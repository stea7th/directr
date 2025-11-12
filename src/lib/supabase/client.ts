// Works with Next.js App Router + @supabase/ssr
import { createBrowserClient as createBrowserClientLib } from "@supabase/ssr";

// If you generated Database types, you can import them and add <Database> below.
// import type { Database } from "../types";

export function createBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  if (!url || !anon) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }
  // return createBrowserClientLib<Database>(url, anon);
  return createBrowserClientLib(url, anon);
}
