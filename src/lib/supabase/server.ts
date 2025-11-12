import { cookies } from "next/headers";
import {
  createServerClient as createSupabaseServerClient,
  type CookieOptions,
} from "@supabase/ssr";

/**
 * Returns a Supabase server client (sync) and works whether
 * next/headers cookies() is sync or Promise-typed in your setup.
 */
export function createServerClient() {
  // Coerce to the shape we need so TS stops thinking it's a Promise
  const cookieStore = cookies() as unknown as {
    get: (name: string) => { value?: string } | undefined;
    set: (name: string, value: string, options?: CookieOptions) => void;
  };

  return createSupabaseServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options?: CookieOptions) {
          try {
            cookieStore.set(name, value, options);
          } catch {
            // ignore set errors on immutable request cookies
          }
        },
        remove(name: string, options?: CookieOptions) {
          try {
            cookieStore.set(name, "", { ...options, maxAge: 0 });
          } catch {
            // ignore remove errors on immutable request cookies
          }
        },
      },
    }
  );
}
