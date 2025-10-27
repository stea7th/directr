// src/lib/supabase/server.ts
import { cookies } from "next/headers";
import { createServerClient as createSbServer } from "@supabase/ssr";

export async function createServerClient() {
  const cookieStore = await cookies();

  return createSbServer(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          // Next 15 cookies store is mutable on the server
          // @ts-ignore - Next provides compatible options
          cookieStore.set(name, value, options);
        },
        remove(name: string, options: any) {
          // @ts-ignore
          cookieStore.set(name, "", { ...options, maxAge: 0 });
        },
      },
    }
  );
}
