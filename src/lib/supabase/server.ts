// src/lib/supabase/server.ts
import { cookies } from "next/headers";
import { createServerClient as createSupabaseClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

/**
 * For layouts / server components
 * ✅ Only READ cookies (no set/remove) so Next.js doesn't complain.
 */
export function createServerClient() {
  const cookieStore = cookies() as any;

  return createSupabaseClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      // no set/remove here on purpose
    },
  });
}

/**
 * For Route Handlers (/api/...) and Server Actions
 * ✅ Full read/write cookies allowed.
 */
export function createRouteClient() {
  const cookieStore = cookies() as any;

  return createSupabaseClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: any) {
        cookieStore.set({ name, value, ...options });
      },
      remove(name: string, options: any) {
        cookieStore.set({ name, value: "", ...options });
      },
    },
  });
}
