import { cookies } from "next/headers";
import { createServerClient as createSupabaseServerClient } from "@supabase/ssr";

export function createServerClient() {
  const cookieStore = cookies();

  return createSupabaseServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options?: Parameters<typeof cookieStore.set>[2]) {
          cookieStore.set(name, value, options);
        },
        remove(name: string, options?: Parameters<typeof cookieStore.set>[1]) {
          // remove by setting an expired cookie
          cookieStore.set(name, "", { ...options, maxAge: 0 });
        },
      },
    }
  );
}
