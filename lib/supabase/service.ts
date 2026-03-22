import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | undefined;

/** Prefer server-only `SUPABASE_URL`; fall back to public URL used by the browser client. */
export function getSupabaseProjectUrl(): string | undefined {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  return url?.trim() || undefined;
}

export function isSupabaseServiceConfigured(): boolean {
  return Boolean(getSupabaseProjectUrl() && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

/** Server-only client with service role (bypasses RLS). Do not import from client components. */
export function getServiceSupabase(): SupabaseClient {
  if (client) return client;
  const url = getSupabaseProjectUrl();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Missing SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) or SUPABASE_SERVICE_ROLE_KEY",
    );
  }
  client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return client;
}
