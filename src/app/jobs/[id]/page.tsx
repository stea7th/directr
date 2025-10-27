// src/app/jobs/[id]/page.tsx
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

type RouteParams = { id: string };
type PageProps = { params: Promise<RouteParams> };

export default async function JobPage({ params }: PageProps) {
  const { id } = await params; // Next.js 15: params is a Promise

  const supa = createClient();

  // auth (optional: remove if you want public job view)
  const { data: { user } } = await supa.auth.getUser();
  if (!user) {
    return <main style={{ padding: 24 }}>Not signed in.</main>;
  }

  const { data: job, error } = await supa
    .from('jobs')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !job) {
    return <main style={{ padding: 24 }}>Job not found.</main>;
  }

  // result_url format: "<bucket>:<path>"
  let downloadUrl: string | null = null;
  if (job.result_url) {
    const [bucket, ...rest] = (job.result_url as string).split(':');
    const path = rest.join(':');
    if (bucket && path) {
      const { data: signed } = await supa
        .storage
        .from(bucket)
        .createSignedUrl(path, 60 * 60);
      downloadUrl = signed?.signedUrl || null;
    }
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>{job.title || `Untitled Job #${job.id}`}</h1>
      <div>Status: {job.status}</div>
      {job.error && <pre style={{ color: '#f88' }}>{job.error}</pre>}

      {downloadUrl ? (
        <p><a href={downloadUrl} target="_blank" rel="noreferrer">Download result</a></p>
      ) : (
        job.status === 'done' ? <p>No result available.</p> : <p>Processing…</p>
      )}

      <p><a href="/jobs">← Back to jobs</a></p>
    </main>
  );
}
