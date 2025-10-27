// src/app/api/generate/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

type Intent =
  | { type: 'hooks'; count?: number }
  | { type: 'clip'; count?: number }
  | { type: 'caption' }
  | { type: 'resize'; ratio: '9:16' | '1:1' | '16:9' }
  | { type: 'transcribe' }
  | { type: 'summarize' }
  | { type: 'generic' };

function parseIntent(text: string): Intent {
  const s = text.toLowerCase();
  const n = Number((s.match(/\b(\d{1,2})\b/) || [])[1]);

  if (/(hook|hooks)/.test(s)) return { type: 'hooks', count: Number.isFinite(n) ? n : 5 };
  if (/(clip|clips|cut)/.test(s)) return { type: 'clip', count: Number.isFinite(n) ? n : 3 };
  if (/(caption|subtitles?)/.test(s)) return { type: 'caption' };
  if (/(9[:x]16|vertical|tiktok)/.test(s)) return { type: 'resize', ratio: '9:16' };
  if (/(1[:x]1|square)/.test(s)) return { type: 'resize', ratio: '1:1' };
  if (/(16[:x]9|landscape)/.test(s)) return { type: 'resize', ratio: '16:9' };
  if (/(transcribe|transcript)/.test(s)) return { type: 'transcribe' };
  if (/(summarize|summary)/.test(s)) return { type: 'summarize' };
  return { type: 'generic' };
}

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const prompt = (body.prompt || '').toString();
    const input_path = (body.input_path || '').toString() || null;

    const supabase = createClient();

    // figure out what they want
    const intent = parseIntent(prompt);

    // build a normalized job payload
    const payload = {
      title: (prompt && prompt.slice(0, 80)) || 'Untitled Job',
      type: intent.type,
      input_path,                 // storage path (uploads/<file>)
      prompt,                     // original text
      params: intent,             // machine-usable params
      status: 'queued' as const,  // queued → processing → done/error
      result_url: null as string | null,
      error: null as string | null,
    };

    const { data, error } = await supabase.from('jobs').insert(payload).select('id').single();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    // ⚠️ kick off your worker here (Railway/Cron/Edge Function) using data.id
    // e.g. await fetch(process.env.WORKER_URL!, { method: 'POST', body: JSON.stringify({ id: data.id }) })

    return NextResponse.json({ id: data.id });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to create job' }, { status: 500 });
  }
}
