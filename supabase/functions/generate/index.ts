// Supabase Edge Function: content studio generator.
// Takes a brain-dump or a YouTube URL, turns it into a LinkedIn post,
// a blog post, and an X thread via Claude Opus 4.8, and stores them as drafts.
//
// Secrets:
//   ANTHROPIC_API_KEY  — from console.anthropic.com
//   OWNER_EMAIL        — (optional) lock generation to this account only
// SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY / SUPABASE_ANON_KEY injected automatically.

import { createClient } from "jsr:@supabase/supabase-js@2";

const ALLOWED_ORIGINS = new Set([
  "https://jzrandodev.github.io",
  "http://localhost:4321",
  "http://localhost:4322",
]);

function corsHeaders(origin: string | null): HeadersInit {
  return {
    "Access-Control-Allow-Origin": origin && ALLOWED_ORIGINS.has(origin) ? origin : "https://jzrandodev.github.io",
    "Access-Control-Allow-Headers": "authorization, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
}

const MODEL = "claude-opus-4-8";

const SYSTEM = `You are the content engine for Noruzo, an AI agency that designs, builds, and ships automation and custom AI products for teams that want results, not demos.

Voice: direct, confident, concrete. No corporate slop, no hype words ("revolutionary", "game-changing", "unlock", "supercharge"), no em-dash-stuffed filler, no hashtag spam. Write like a sharp practitioner talking to a peer. Work ONLY from the material provided — never invent facts, names, numbers, or case studies.

You produce three platform-native pieces from the same source material:

1. linkedin — One post. Strong first-line hook, short scannable paragraphs, one core idea, a soft takeaway or question at the end. ~1,000–1,800 characters. At most 0–3 relevant hashtags, or none.

2. blog — A blog post in Markdown. Give it a clear title, a URL slug (lowercase, words separated by hyphens, no stop-word padding), a one-sentence excerpt, and a body of ~500–900 words using ## subheadings and short paragraphs. The body is Markdown (no front-matter, no H1 — the title is separate).

3. x_thread — An array of 5–9 tweets that tell one coherent story. First tweet is a punchy standalone hook. Each tweet MUST be 280 characters or fewer. No "🧵" gimmicks required, no hashtag spam. Make each tweet able to stand on its own while building the thread.`;

const SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    linkedin: { type: "string" },
    blog: {
      type: "object",
      additionalProperties: false,
      properties: {
        title: { type: "string" },
        slug: { type: "string" },
        excerpt: { type: "string" },
        body: { type: "string" },
      },
      required: ["title", "slug", "excerpt", "body"],
    },
    x_thread: { type: "array", items: { type: "string" } },
  },
  required: ["linkedin", "blog", "x_thread"],
};

function slugify(s: string): string {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
}

function videoId(url: string): string | null {
  const m = url.match(/(?:v=|youtu\.be\/|shorts\/|embed\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}

async function youtubeTitle(url: string): Promise<string | null> {
  try {
    const r = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`);
    if (!r.ok) return null;
    return (await r.json()).title ?? null;
  } catch {
    return null;
  }
}

// Best-effort transcript scrape. Fragile by nature — failures fall back to
// the user pasting the transcript manually in the UI.
async function fetchTranscript(id: string): Promise<string> {
  const page = await fetch(`https://www.youtube.com/watch?v=${id}&hl=en`, {
    headers: { "User-Agent": "Mozilla/5.0", "Accept-Language": "en-US,en;q=0.9" },
  });
  const html = await page.text();
  const m = html.match(/"captionTracks":(\[.*?\])/);
  if (!m) throw new Error("no captions");
  const tracks = JSON.parse(m[1]) as Array<{ baseUrl: string; languageCode: string }>;
  const track = tracks.find((t) => t.languageCode?.startsWith("en")) ?? tracks[0];
  if (!track?.baseUrl) throw new Error("no track");
  const cap = await fetch(`${track.baseUrl}&fmt=json3`);
  const data = await cap.json();
  const text = (data.events ?? [])
    .flatMap((e: { segs?: Array<{ utf8: string }> }) => (e.segs ?? []).map((s) => s.utf8))
    .join("")
    .replace(/\n+/g, " ")
    .trim();
  if (!text) throw new Error("empty");
  return text;
}

Deno.serve(async (req) => {
  const headers = { ...corsHeaders(req.headers.get("origin")), "Content-Type": "application/json" };
  if (req.method === "OPTIONS") return new Response(null, { headers });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers });
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const ANON = Deno.env.get("SUPABASE_ANON_KEY")!;
  const SERVICE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const ANTHROPIC_KEY = Deno.env.get("ANTHROPIC_API_KEY");

  // Identify caller from their JWT
  const token = (req.headers.get("authorization") ?? "").replace("Bearer ", "");
  const authClient = createClient(SUPABASE_URL, ANON);
  const { data: userData } = await authClient.auth.getUser(token);
  const user = userData.user;
  if (!user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers });

  const ownerEmail = Deno.env.get("OWNER_EMAIL");
  if (ownerEmail && user.email?.toLowerCase() !== ownerEmail.toLowerCase()) {
    return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers });
  }
  if (!ANTHROPIC_KEY) {
    return new Response(JSON.stringify({ error: "ANTHROPIC_API_KEY not configured" }), { status: 500, headers });
  }

  let body: { kind?: string; text?: string; url?: string; transcript?: string };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400, headers });
  }

  // Resolve the source material
  let rawText = "";
  let sourceUrl: string | null = null;
  let title: string | null = null;

  if (body.kind === "youtube") {
    const url = (body.url ?? "").trim();
    const id = videoId(url);
    if (!id) return new Response(JSON.stringify({ error: "Couldn't read that YouTube URL" }), { status: 400, headers });
    sourceUrl = url;
    title = await youtubeTitle(url);
    if (body.transcript && body.transcript.trim()) {
      rawText = body.transcript.trim();
    } else {
      try {
        rawText = await fetchTranscript(id);
      } catch {
        return new Response(JSON.stringify({ error: "transcript_unavailable" }), { status: 422, headers });
      }
    }
  } else {
    rawText = (body.text ?? "").trim();
    if (!rawText) return new Response(JSON.stringify({ error: "No text provided" }), { status: 400, headers });
  }

  // Generate with Claude Opus 4.8 (structured output)
  let generated: {
    linkedin: string;
    blog: { title: string; slug: string; excerpt: string; body: string };
    x_thread: string[];
  };
  try {
    const aiRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 16000,
        thinking: { type: "adaptive" },
        system: SYSTEM,
        output_config: { format: { type: "json_schema", schema: SCHEMA } },
        messages: [
          {
            role: "user",
            content: `Here is the source material${title ? ` (from a video titled "${title}")` : ""}. Turn it into the three pieces.\n\n---\n${rawText}`,
          },
        ],
      }),
    });
    const aiData = await aiRes.json();
    if (!aiRes.ok) {
      console.error("anthropic error", aiRes.status, JSON.stringify(aiData));
      return new Response(JSON.stringify({ error: "Generation failed" }), { status: 502, headers });
    }
    if (aiData.stop_reason === "refusal") {
      return new Response(JSON.stringify({ error: "The model declined this content." }), { status: 422, headers });
    }
    const textBlock = (aiData.content ?? []).find((b: { type: string }) => b.type === "text");
    generated = JSON.parse(textBlock.text);
  } catch (e) {
    console.error("generation error", e);
    return new Response(JSON.stringify({ error: "Generation failed" }), { status: 502, headers });
  }

  // Persist: source + 3 drafts (service role; owner pinned to caller)
  const db = createClient(SUPABASE_URL, SERVICE);
  const { data: source, error: srcErr } = await db
    .from("content_sources")
    .insert({ owner: user.id, kind: body.kind === "youtube" ? "youtube" : "braindump", source_url: sourceUrl, raw_text: rawText, title: title ?? generated.blog.title })
    .select()
    .single();
  if (srcErr || !source) {
    console.error("source insert", srcErr);
    return new Response(JSON.stringify({ error: "Could not save" }), { status: 500, headers });
  }

  let slug = slugify(generated.blog.slug || generated.blog.title);
  const rows = [
    { owner: user.id, source_id: source.id, platform: "linkedin", body: generated.linkedin },
    { owner: user.id, source_id: source.id, platform: "blog", title: generated.blog.title, slug, excerpt: generated.blog.excerpt, body: generated.blog.body },
    { owner: user.id, source_id: source.id, platform: "x", tweets: generated.x_thread },
  ];

  let { data: posts, error: postErr } = await db.from("generated_posts").insert(rows).select();
  if (postErr && /duplicate|unique/i.test(postErr.message)) {
    rows[1].slug = `${slug}-${crypto.randomUUID().slice(0, 4)}`;
    ({ data: posts, error: postErr } = await db.from("generated_posts").insert(rows).select());
  }
  if (postErr || !posts) {
    console.error("posts insert", postErr);
    return new Response(JSON.stringify({ error: "Could not save drafts" }), { status: 500, headers });
  }

  return new Response(JSON.stringify({ source_id: source.id, posts }), { status: 200, headers });
});
