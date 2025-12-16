import { createClient as createSupabaseClient } from "@supabase/supabase-js";

function mustEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

// ✅ only read env when you actually create the client
export function createClient() {
  const url = mustEnv("NEXT_PUBLIC_SUPABASE_URL");
  const anon = mustEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  return createSupabaseClient(url, anon);
}

// Optional convenience singleton (safe-ish)
export const supabase = (() => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return null as any;
  return createSupabaseClient(url, anon);
})();
