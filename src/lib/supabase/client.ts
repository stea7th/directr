import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

/**
 * Keep backward-compat exports because other files import:
 *  - createClient
 *  - supabase
 */
export function createClient() {
  return createClientComponentClient();
}

// some parts of your app import a singleton `supabase`
export const supabase = createClient();

// optional nicer alias (doesn't break anything)
export const createBrowserClient = createClient;
