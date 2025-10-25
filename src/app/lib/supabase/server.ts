import { cookies } from "next/headers";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

function projectRefFromUrl(url: string) {
  const m = url.match(/^https?:\/\/([a-z0-9-]+)\.supabase\.co/i);
  return m?.[1] || null;
}

/** Server-side Supabase client forwarding the user's auth token from cookies. */
export async function supabaseFromCookies(): Promise<SupabaseClient> {
  const jar = await cookies(); // Next 15: await cookies()
  const ref = projectRefFromUrl(SUPABASE_URL);

  const accessToken =
    jar.get("sb-access-token")?.value ||
    (ref ? jar.get(`sb-${ref}-auth-token`)?.value : undefined) ||
    "";

  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false },
    global: accessToken ? { headers: { Authorization: `Bearer ${accessToken}` } } : {},
  });
}

/** Anonymous client (no auth forwarding). */
export function supabaseAnon(): SupabaseClient {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false },
  });
}

export type { SupabaseClient };
