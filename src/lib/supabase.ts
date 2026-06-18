import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Browser Supabase client for the content studio + public blog reads.
 * Both env values are public-safe: the anon key only reaches RLS-protected
 * tables and JWT-gated edge functions. Reused across studio.ts and the blog
 * pages so there's a single auth/session source.
 */
const url = import.meta.env.PUBLIC_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY as string | undefined;

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (!url || !anonKey) return null;
  if (!client) {
    client = createClient(url, anonKey, {
      auth: { persistSession: true, autoRefreshToken: true },
    });
  }
  return client;
}

/** The deployed Edge Function base, e.g. https://ref.supabase.co/functions/v1 */
export function functionsBase(): string | null {
  return url ? `${url}/functions/v1` : null;
}
