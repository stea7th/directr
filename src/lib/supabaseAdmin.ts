import { createClient } from '@supabase/supabase-js';

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  // Service role is required for verifying user tokens and uploading server-side
  process.env.SUPABASE_SERVICE_ROLE as string,
  { auth: { persistSession: false } }
);
