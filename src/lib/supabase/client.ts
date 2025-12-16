import { createClient as createSupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// ✅ export a function (what your pages expect)
export function createClient() {
  return createSupabaseClient(url, anon);
}

// ✅ also export a singleton if you want it
export const supabase = createSupabaseClient(url, anon);
