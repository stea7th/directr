import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { randomUUID } from 'crypto';

// POST /api/generate
export async function POST(req: Request) {
  try {
    const supabase = await createClient(); // ✅ must await here

    const { prompt, fileName } = await req.json();

    if (!prompt && !fileName) {
      return NextResponse.json({ error: 'Missing prompt or file.' }, { status: 400 });
    }

    // Create a job record
    const payload = {
      id: randomUUID(),
      title: prompt || 'New Directr Job',
      status: 'pending',
      file_name: fileName || null,
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('jobs')
      .insert(payload)
      .select('id')
      .single();

    if (error) {
      console.error('Supabase insert error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // ⚙️ Simulate background processing / edge worker trigger
    console.log(`✅ Job ${data.id} created for "${prompt}"`);

    return NextResponse.json({ id: data.id }, { status: 200 });
  } catch (err: any) {
    console.error('Error in /api/generate:', err.message);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
