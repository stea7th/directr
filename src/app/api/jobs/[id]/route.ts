// app/api/jobs/[id]/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const service = process.env.SUPABASE_SERVICE_ROLE!;

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const server = createClient(supabaseUrl, service);
  const { data, error } = await server
    .from('jobs')
    .select('id, status, error, output, created_at')
    .eq('id', params.id)
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json(data);
}
