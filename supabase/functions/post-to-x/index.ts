// Supabase Edge Function: post a saved X thread to X (Twitter) via POST /2/tweets,
// chaining each tweet as a reply to the previous one. OAuth 1.0a user context.
//
// Secrets (the four come from your X developer app):
//   X_API_KEY, X_API_SECRET, X_ACCESS_TOKEN, X_ACCESS_SECRET
//   OWNER_EMAIL — (optional) lock posting to this account only
// SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY / SUPABASE_ANON_KEY injected automatically.

import { createClient } from "jsr:@supabase/supabase-js@2";

const ALLOWED_ORIGINS = new Set([
  "https://jzrandodev.github.io",
  "http://localhost:3000",
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

function pe(s: string): string {
  return encodeURIComponent(s).replace(/[!*'()]/g, (c) => "%" + c.charCodeAt(0).toString(16).toUpperCase());
}

async function oauthHeader(method: string, url: string, creds: {
  apiKey: string; apiSecret: string; token: string; tokenSecret: string;
}): Promise<string> {
  const oauth: Record<string, string> = {
    oauth_consumer_key: creds.apiKey,
    oauth_nonce: crypto.randomUUID().replace(/-/g, ""),
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: creds.token,
    oauth_version: "1.0",
  };

  // POST /2/tweets sends a JSON body, which is NOT part of the OAuth signature.
  const paramString = Object.keys(oauth)
    .sort()
    .map((k) => `${pe(k)}=${pe(oauth[k])}`)
    .join("&");
  const base = `${method}&${pe(url)}&${pe(paramString)}`;
  const signingKey = `${pe(creds.apiSecret)}&${pe(creds.tokenSecret)}`;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(signingKey),
    { name: "HMAC", hash: "SHA-1" },
    false,
    ["sign"],
  );
  const sigBuf = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(base));
  oauth.oauth_signature = btoa(String.fromCharCode(...new Uint8Array(sigBuf)));

  return "OAuth " + Object.keys(oauth)
    .sort()
    .map((k) => `${pe(k)}="${pe(oauth[k])}"`)
    .join(", ");
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

  // Identify caller first — don't leak config state to unauthenticated callers
  const jwt = (req.headers.get("authorization") ?? "").replace("Bearer ", "");
  const { data: userData } = await createClient(SUPABASE_URL, ANON).auth.getUser(jwt);
  const user = userData.user;
  if (!user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers });
  const ownerEmail = Deno.env.get("OWNER_EMAIL");
  if (ownerEmail && user.email?.toLowerCase() !== ownerEmail.toLowerCase()) {
    return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers });
  }

  const creds = {
    apiKey: Deno.env.get("X_API_KEY") ?? "",
    apiSecret: Deno.env.get("X_API_SECRET") ?? "",
    token: Deno.env.get("X_ACCESS_TOKEN") ?? "",
    tokenSecret: Deno.env.get("X_ACCESS_SECRET") ?? "",
  };
  if (!creds.apiKey || !creds.apiSecret || !creds.token || !creds.tokenSecret) {
    return new Response(JSON.stringify({ error: "X credentials not configured" }), { status: 500, headers });
  }

  let postId: string;
  try {
    postId = (await req.json()).postId;
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400, headers });
  }
  if (!postId) return new Response(JSON.stringify({ error: "Missing postId" }), { status: 400, headers });

  const db = createClient(SUPABASE_URL, SERVICE);
  const { data: post } = await db
    .from("generated_posts")
    .select("id, tweets, status, owner")
    .eq("id", postId)
    .eq("owner", user.id)
    .maybeSingle();
  if (!post) return new Response(JSON.stringify({ error: "Post not found" }), { status: 404, headers });
  if (post.status === "published") {
    return new Response(JSON.stringify({ error: "Already posted" }), { status: 409, headers });
  }

  const tweets: string[] = (post.tweets ?? []).map((t: string) => String(t).trim()).filter(Boolean);
  if (!tweets.length) return new Response(JSON.stringify({ error: "No tweets to post" }), { status: 400, headers });
  if (tweets.some((t) => t.length > 280)) {
    return new Response(JSON.stringify({ error: "A tweet exceeds 280 characters" }), { status: 400, headers });
  }

  // Post sequentially, chaining replies
  const url = "https://api.twitter.com/2/tweets";
  const ids: string[] = [];
  let replyTo: string | null = null;
  for (const text of tweets) {
    const payload: Record<string, unknown> = { text };
    if (replyTo) payload.reply = { in_reply_to_tweet_id: replyTo };

    const auth = await oauthHeader("POST", url, creds);
    const res = await fetch(url, {
      method: "POST",
      headers: { Authorization: auth, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok || !data?.data?.id) {
      console.error("x post failed", res.status, JSON.stringify(data));
      const detail = data?.detail || data?.title || `HTTP ${res.status}`;
      return new Response(
        JSON.stringify({ error: ids.length ? `Posted ${ids.length} then failed: ${detail}` : `X rejected the post: ${detail}` }),
        { status: 502, headers },
      );
    }
    ids.push(data.data.id);
    replyTo = data.data.id;
  }

  await db.from("generated_posts").update({ status: "published", published_at: new Date().toISOString() }).eq("id", postId);

  return new Response(JSON.stringify({ url: `https://x.com/i/web/status/${ids[0]}`, ids }), { status: 200, headers });
});
