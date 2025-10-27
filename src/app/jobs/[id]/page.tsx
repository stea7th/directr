import React from 'react';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

type RouteParams = { id: string };

export default async function JobPage({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  // ✅ Next 15: params is a Promise — await it
  const { id } = await params;

  // ✅ Supabase client is async — await it
  const supa = await createClient();

  // (Optional) auth check — remove if you want public access
  const { data: userData, error: userErr } = await supa.auth.getUser();
  if (userErr || !userData?.user) {
    return (
      <main style={{ padding: 24 }}>
        <h2>Not signed in</h2>
        <p>You must be signed in to view this job.</p>
      </main>
    );
  }

  // Load the job
  const { data: job, error } = await supa
    .from('jobs')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !job) {
    return (
      <main style={{ padding: 24 }}>
        <h2>Job not found</h2>
        <p>{error?.message || 'No job data available.'}</p>
      </main>
    );
  }

  return (
    <main style={{ padding: 24 }}>
      <h1 style={{ marginBottom: 8 }}>Job: {job.title}</h1>
      <p><strong>Status:</strong> {job.status}</p>
      {job.file_name && <p><strong>File:</strong> {job.file_name}</p>}
      <p><strong>Created:</strong> {new Date(job.created_at).toLocaleString()}</p>

      {job.output_url && (
        <p style={{ marginTop: 16 }}>
          <a href={job.output_url} download>
            Download result
          </a>
        </p>
      )}
    </main>
  );
}
