// src/app/jobs/[id]/page.tsx
import { createClient } from '@/lib/supabase/server';

export default async function JobPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data, error } = await supabase.from('jobs').select('*').eq('id', params.id).single();

  if (error) return <main style={{ padding: 24 }}>Error: {error.message}</main>;
  if (!data) return <main style={{ padding: 24 }}>Not found.</main>;

  return (
    <main style={{ padding: 24 }}>
      <h1>{data.title || `Job #${data.id}`}</h1>
      <p>Status: {data.status}</p>
      {data.error && <pre style={{ color: '#f66' }}>{data.error}</pre>}

      {data.result_url ? (
        <>
          <p>Output ready.</p>
          <a href={data.result_url} download>
            Download result
          </a>
        </>
      ) : (
        <p>No result yet. (Refresh to check again.)</p>
      )}

      <p style={{ marginTop: 16 }}>
        <a href="/jobs">← Back to jobs</a>
      </p>
    </main>
  );
}
