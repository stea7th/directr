import { createClient as createSupabaseClient } from "@supabase/supabase-js";

function getEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  if (!url || !anon) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }
  return { url, anon };
}

/**
 * ✅ New “correct” name used by your LoginForm
 */
export function createBrowserClient() {
  const { url, anon } = getEnv();
  return createSupabaseClient(url, anon, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
}

/**
 * ✅ Backwards-compatible export
 * Some files still do: import { createClient } from "@/lib/supabase/client"
 */
export function createClient() {
  return createBrowserClient();
}

/**
 * ✅ Backwards-compatible export
 * Some files still do: import { supabase } from "@/lib/supabase/client"
 */
export const supabase = createBrowserClient();
