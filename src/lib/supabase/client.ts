import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export function createBrowserClient() {
  return createClientComponentClient();
}
