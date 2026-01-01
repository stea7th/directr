"use client";

import { createBrowserClient as _createBrowserClient } from "@supabase/ssr";

export function createBrowserClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return _createBrowserClient(supabaseUrl, supabaseAnon);
}

// Keep these for the other imports in your app
export function createClient() {
  return createBrowserClient();
}

export const supabase = createBrowserClient();
