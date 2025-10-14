import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export const runtime = 'nodejs'; // keep it on Node so Buffer is available

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    // Verify user (optional but recommended)
    let userId: string | null = null;
    if (token) {
      const { data, error } = await supabaseAdmin.auth.getUser(token);
      if (error) return NextResponse.json({ ok: false, error: 'Invalid auth token' }, { status: 401 });
      userId = data.user?.id ?? null;
    }

    const form = await req.formData();
    const prompt = (form.get('prompt') || '').toString().trim();
    const file = form.get('file') as unknown as File | null;

    if (!prompt && !file) {
      return NextResponse.json({ ok: false, error: 'Provide a prompt or a file.' }, { status: 400 });
    }

    let uploadedPath: string | null = null;

    if (file && file.name && file.size > 0) {
      const arrayBuf = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuf);

      const safeName = file.name.replace(/[^\w.\-]+/g, '_');
      const ts = Date.now();
      const who = userId ?? 'anon';
      const path = `uploads/${who}/${ts}-${safeName}`;

      const { error: upErr } = await supabaseAdmin
        .storage
        .from('assets')
        .upload(path, buffer, {
          contentType: file.type || 'application/octet-stream',
          upsert: false
        });

      if (upErr) {
        return NextResponse.json({ ok: false, error: `Upload failed: ${upErr.message}` }, { status: 500 });
      }
      uploadedPath = path;
    }

    // TODO: if you want to queue a background job, insert into your "jobs" table here
    // const { data: job } = await supabaseAdmin.from('jobs').insert({ ... }).select().single();

    return NextResponse.json({
      ok: true,
      userId,
      prompt,
      uploadedPath
      // jobId: job?.id
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? 'Server error' }, { status: 500 });
  }
}
