import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { createServerClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const { prompt, filePath } = await req.json();
    const supa = createServerClient();

    // who is this?
    const { data: authData } = await supa.auth.getUser();
    const userId = authData?.user?.id ?? null;

    const id = randomUUID();
    const payload = {
      id,
      user_id: userId,
      prompt: prompt ?? '',
      input_path: filePath ?? null,
      output_path: null,
      status: 'queued',
      error: null,
    };

    const { error } = await supa.from('jobs').insert(payload);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // TODO: trigger your worker to process {id}
    return NextResponse.json({ id });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Bad request' }, { status: 400 });
  }
}
