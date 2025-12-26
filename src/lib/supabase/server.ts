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
 * ✅ read-only cookies
 */
export async function createServerClient() {
  const cookieStore = await cookies();

  return createSupabaseClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
    },
  });
}

/**
 * For Route Handlers (/api/...) and Server Actions
 * ✅ full read/write cookies
 */
export async function createRouteClient() {
  const cookieStore = await cookies();

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
