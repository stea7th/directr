// Unified browser client for Supabase (Next.js App Router)
import { createBrowserClient as createBrowserClientLib } from "@supabase/ssr";

// If you have generated Database types, you can add them: createBrowserClientLib<Database>(...)
const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
if (!url || !anon) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
}

/** Preferred explicit export */
export function createBrowserClient() {
  return createBrowserClientLib(url, anon);
}

/** Back-compat alias so existing imports keep working */
export function createClient() {
  return createBrowserClientLib(url, anon);
}

export default createBrowserClient; // optional default for flexibility
