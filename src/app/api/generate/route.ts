// app/api/generate/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';   // don’t prerender
export const revalidate = 0;              // never cache at build

export async function POST(req: Request) {
  try {
    const { input } = await req.json();

    const url =
      process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key =
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key) {
      // Return a 500 instead of throwing during build
      return NextResponse.json(
        { error: 'Supabase env vars missing on server.' },
        { status: 500 }
      );
    }

    // Create the client *inside* the handler so it’s not evaluated at import time
    const supabase = createClient(url, key);

    // TODO: your generate logic here, using `supabase` if needed.
    // For now return a stubbed payload so the route works.
    return NextResponse.json({ ok: true, input });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Unexpected error' },
      { status: 500 }
    );
  }
}
