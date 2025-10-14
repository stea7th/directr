// src/app/api/generate/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs"; // ensure Node (service role is not allowed on edge)

// Accept several possible env names so it "just works"
const supabaseUrl =
  process.env.SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL;

const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || // preferred
  process.env.SUPABASE_KEY ||              // fallback if older name was used
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY; // last resort (not ideal, but avoids hard failure)

if (!supabaseUrl) {
  throw new Error("SUPABASE_URL is required.");
}
if (!supabaseServiceKey) {
  throw new Error("supabaseKey is required.");
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false },
});

// ...keep the rest of your route logic below unchanged...
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
