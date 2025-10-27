import React from 'react';
import { createClient } from '@/lib/supabase/server';

type Props = {
  params: { id: string };
};

export default async function JobPage({ params }: Props) {
  const supa = await createClient(); // ✅ await the async call
  const jobId = params.id;

  // (Optional) Auth check – remove if you want public access
  const { data: userData, error: userError } = await supa.auth.getUser();
  if (userError || !userData?.user) {
    return (
      <main style={{ padding: 24 }}>
        Not signed in.
      </main>
    );
  }

  // Fetch the job details
  const { data, error } = await supa
    .from('jobs')
    .select('*')
    .eq('id', jobId)
    .single();

  if (error || !data) {
    return (
      <main style={{ padding: 24 }}>
        <h2>Job not found</h2>
        <p>{error?.message || 'No job data available.'}</p>
      </main>
    );
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>Job: {data.title}</h1>
      <p>Status: {data.status}</p>
      {data.file_name && (
        <p>Attached file: {data.file_name}</p>
      )}
      <p>Created at: {new Date(data.created_at).toLocaleString()}</p>
    </main>
  );
}
