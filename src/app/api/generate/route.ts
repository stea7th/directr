 // src/app/api/generate/route.ts
import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { createServerClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  const supa = createServerClient(); // returns a client (not a Promise)
  const body = await req.json();

  const fileUrl  = body.fileUrl ?? null;     // URL from your uploader
  const fileName = body.fileName ?? null;    // original filename
  const prompt   = body.prompt   ?? '';      // text prompt allowed to be empty

  // Who’s creating this job?
  const { data: authData, error: authErr } = await supa.auth.getUser();
  if (authErr || !authData?.user?.id) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
  }
  const userId = authData.user.id;

  // You can allow prompt-only jobs; if you want to require a file, uncomment:
  // if (!fileUrl) return NextResponse.json({ error: 'fileUrl required' }, { status: 400 });

  const id = randomUUID();

  const payload = {
    id,
    user_id: userId,
    input_prompt: prompt,
    file_name: fileName,
    input_file: fileUrl,
    input_path: fileUrl,   // mirror so worker never sees NULL
    status: 'queued',
  };

  const { data, error } = await supa
    .from('jobs')
    .insert(payload)
    .select('id')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // Kick worker with data.id (Railway/Cron/etc.)
  return NextResponse.json({ id: data.id }, { status: 201 });
}
