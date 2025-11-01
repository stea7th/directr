// src/app/api/generate/route.ts
import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const supa = await createClient(); // <-- IMPORTANT: await

    const body = await req.json().catch(() => ({} as any));
    const prompt = (body?.prompt ?? '').toString().trim();
    const fileName: string | null = body?.fileName ?? null;

    // (optional) who is this?
    const { data: authData } = await supa.auth.getUser();
    const userId = authData?.user?.id ?? null;

    const id = randomUUID();
    const payload = {
      id,
      user_id: userId,
      title:
        prompt.slice(0, 120) ||
        (fileName ? `Process ${fileName}` : 'Untitled job'),
      status: 'queued',
      input_prompt: prompt,
      input_file: fileName,
      created_at: new Date().toISOString(),
    };

    const { error } = await supa.from('jobs').insert(payload);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // kick off worker here if you have one; for now just return the id
    return NextResponse.json({ id });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? 'Failed' },
      { status: 500 }
    );
  }
}
