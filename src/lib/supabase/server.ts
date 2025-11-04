// src/lib/supabase/server.ts
import { cookies, headers } from "next/headers";
import { createServerClient as createSSRClient } from "@supabase/ssr";
// import type { Database } from "@/lib/supabase/types"; // optional

export async function createServerClient() {
  const cookieStore = await cookies();

  const supabase = createSSRClient/*<Database>*/(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set() {},   // no-op on server; Route Handlers manage Set-Cookie
        remove() {},// no-op
      },
    }
  );

  return supabase;
}
