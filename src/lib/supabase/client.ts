'use client';

import { createClient as createSupabaseClient, type SupabaseClient } from '@supabase/supabase-js';

// Public keys required on the client
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  // Fail early and loudly in dev; avoids silent auth failures
  // eslint-disable-next-line no-console
  console.warn(
    '[supabase/client] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY'
  );
}

let _client: SupabaseClient | null = null;

/**
 * Returns a singleton browser Supabase client.
 * - Persists session in localStorage
 * - Auto refreshes tokens
 * - Uses PKCE (recommended on web)
 */
export function createBrowserClient(): SupabaseClient {
  if (_client) return _client;

  _client = createSupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      flowType: 'pkce',
    },
    global: {
      fetch, // use the browser fetch
    },
  });

  return _client;
}

/**
 * Backward-compatible alias so existing imports keep working:
 *   import { createClient } from '@/lib/supabase/client'
 */
export const createClient = createBrowserClient;

/**
 * Optional ready-made instance for convenience:
 *   import { supabase } from '@/lib/supabase/client'
 */
export const supabase = createBrowserClient();

// Re-export the SupabaseClient type for callers if needed
export type { SupabaseClient } from '@supabase/supabase-js';
