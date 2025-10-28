import { createClient as createSb } from "@supabase/supabase-js";

export function createClient() {
  return createSb(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: true, autoRefreshToken: true } }
  );
}
