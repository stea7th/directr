// src/lib/supabase/client.ts
"use client";

import { createClient } from "@supabase/supabase-js";

let _client:
  | ReturnType<typeof createClient<Database>>
  | null = null;

// If you have generated types, replace `any` with your Database type
type Database = any;

export function createBrowserClient() {
  if (_client) return _client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  _client = createClient<Database>(url, anon, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });

  return _client;
}
