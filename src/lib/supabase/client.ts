"use client";

import { createClient } from "@supabase/supabase-js";

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

  if (!url || !anon) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }

  return createClientSupabase(url, anon);
}

// separated so the function name doesn’t collide
function createClientSupabase(url: string, anon: string) {
  return createClient(url, anon, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: "directr-auth",
    },
  });
}
