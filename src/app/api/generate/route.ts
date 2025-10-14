// app/api/generate/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { createClient as createServerClient } from '@supabase/supabase-js';
import { randomUUID } from 'node:crypto';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const service = process.env.SUPABASE_SERVICE_ROLE!; // server-only

export async function POST(req: Request) {
  try {
    const cookieStore = cookies();
    const userClient = createRouteHandlerClient({ cookies: () => cookieStore });
    const { data: { user } } = await userClient.auth.getUser();

    const form = await req.formData();
    const prompt = (form.get('prompt') as string | null) ?? '';
    const file = form.get('file') as File | null;

    // Use service client for Storage + RLS bypass on insert
    const server = createServerClient(supabaseUrl, service);

    let filePath: string | null = null;

    if (file && file.size > 0) {
      const ext = file.name.includes('.') ? file.name.split('.').pop() : 'bin';
      const key = `${user?.id ?? 'anon'}/${randomUUID()}.${ext}`;
      const arrayBuf = await file.arrayBuffer();

      const { error: upErr } = await server
        .storage
        .from('uploads')
        .upload(key, Buffer.from(arrayBuf), {
          contentType: file.type || 'application/octet-stream',
          upsert: false
        });

      if (upErr) throw upErr;
      filePath = key;
    }

    // Insert job
    const { data: job, error: insErr } = await server
      .from('jobs')
      .insert({
        user_id: user?.id ?? null,
        prompt,
        file_path: filePath,
        status: 'queued'
      })
      .select('id')
      .single();

    if (insErr) throw insErr;

    // TODO: kick off your worker here (edge func / queue). For now we just return id.
    return NextResponse.json({ id: job.id }, { status: 201 });
  } catch (e: any) {
    console.error('generate error:', e);
    return NextResponse.json({ error: e.message ?? 'failed' }, { status: 500 });
  }
}
