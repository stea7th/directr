// src/lib/supabase/server.ts
import { cookies } from 'next/headers';
import { createServerClient as _createServerClient } from '@supabase/ssr';
import type { CookieOptions } from '@supabase/ssr';

function env(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

/**
 * Create a Supabase client for server environments (RSCs, route handlers, etc)
 * NOTE: Next.js 15 => cookies() is async, so we await it here.
 */
export async function createClient() {
  const cookieStore = await cookies(); // <-- IMPORTANT in Next 15
  return _createServerClient(
    env('NEXT_PUBLIC_SUPABASE_URL'),
    env('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          // mutate response cookies
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: '', ...options, maxAge: 0 });
        },
      },
    }
  );
}

// Optional alias so older imports keep working:
export const createServerClient = createClient;
export type { CookieOptions };
