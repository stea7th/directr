// Server Supabase (for API routes & server components)
import { cookies } from 'next/headers';
import { createServerClient as createSSRClient } from '@supabase/ssr';

export function createServerClient() {
  const cookieStore = cookies(); // NOTE: do NOT await — it's NOT a Promise.
  return createSSRClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, // or NEXT_PUBLIC_SUPABASE_ANON_KEY if you prefer
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set() {},
        remove() {},
      },
    }
  );
}
