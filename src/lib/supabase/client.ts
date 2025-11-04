'use client';

import { createClient as createSupabaseClient, type SupabaseClient } from '@supabase/supabase-js';

// Read from public env (required on the client)
const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Optional: reuse a single instance to avoid re-creating the client every render
let _client: SupabaseClient | null = null;

/**
 * Browser-only Supabase client.
 * Uses localStorage session so users stay signed in.
 */
export function createBrowserClient(): SupabaseClient {
  if (_client) return _client;
  _client = createSupabaseClient(url, anon, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      flowType: 'pkce',
    },
    global: { fetch },
  });
  return _client;
}

// If you prefer importing a ready instance:
//   import { supabase } from '@/lib/supabase/client'
export const supabase = createBrowserClient();
