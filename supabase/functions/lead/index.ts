// Supabase Edge Function: receives the CTA form, stores the lead,
// and emails Juan via Resend with reply-to set to the lead.
//
// Secrets (supabase secrets set):
//   RESEND_API_KEY  — from resend.com
//   NOTIFY_EMAIL    — inbox that receives lead notifications
// SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are injected automatically.

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

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

Deno.serve(async (req) => {
  const headers = { ...corsHeaders(req.headers.get("origin")), "Content-Type": "application/json" };

  if (req.method === "OPTIONS") return new Response(null, { headers });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers });
  }

  let body: { email?: string; name?: string | null; message?: string | null; source?: unknown };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400, headers });
  }

  const email = (body.email ?? "").trim().slice(0, 254);
  const name = body.name ? String(body.name).trim().slice(0, 120) : null;
  const message = body.message ? String(body.message).trim().slice(0, 2000) : null;
  const source = body.source && typeof body.source === "object" ? body.source : null;

  if (!EMAIL_RE.test(email)) {
    return new Response(JSON.stringify({ error: "Invalid email" }), { status: 400, headers });
  }

  // Store the lead first — it must survive even if the email ping fails
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
  const { error: dbError } = await supabase.from("leads").insert({ email, name, message, source });
  if (dbError) {
    console.error("leads insert failed:", dbError.message);
    return new Response(JSON.stringify({ error: "Could not save your message" }), { status: 500, headers });
  }

  // Notify Juan. Failure here is logged, not surfaced — the lead is safe.
  const resendKey = Deno.env.get("RESEND_API_KEY");
  const notifyEmail = Deno.env.get("NOTIFY_EMAIL");
  if (resendKey && notifyEmail) {
    const lines = [
      `Email: ${email}`,
      name ? `Name: ${name}` : null,
      message ? `\n${message}` : null,
      source ? `\nSource: ${JSON.stringify(source)}` : null,
    ].filter(Boolean);

    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${resendKey}` },
      body: JSON.stringify({
        from: "Noruzo Leads <onboarding@resend.dev>",
        to: [notifyEmail],
        reply_to: email,
        subject: `New lead — ${name ?? email}`,
        text: lines.join("\n"),
      }),
    });
    if (!emailRes.ok) {
      console.error("resend notify failed:", emailRes.status, await emailRes.text());
    }
  } else {
    console.error("RESEND_API_KEY / NOTIFY_EMAIL not configured — lead stored, no notification sent");
  }

  return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
});
