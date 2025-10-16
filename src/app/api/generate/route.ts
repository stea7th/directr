import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    );

    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { prompt } = await req.json();
    if (!prompt || prompt.trim() === '') {
      return NextResponse.json({ error: 'Prompt required' }, { status: 400 });
    }

    // ——— mock job create (replace with real logic later) ———
    const jobId = Math.random().toString(36).slice(2, 9);
    // await supabase.from('jobs').insert({ id: jobId, user_id: user.id, prompt });

    return NextResponse.json({ id: jobId, ok: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Server error' },
      { status: 500 }
    );
  }
}
