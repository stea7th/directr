// app/jobs/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';

type Job = {
  id: string;
  status: 'queued' | 'processing' | 'done' | 'error';
  error?: string | null;
  output?: any;
  created_at: string;
};

export default function JobPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const [job, setJob] = useState<Job | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let t: number | null = null;

    async function load() {
      const res = await fetch(`/api/jobs/${id}`, { cache: 'no-store' });
      const j = await res.json();
      setJob(j);
      if (j.status === 'done' || j.status === 'error') {
        if (t) window.clearInterval(t);
      }
    }

    load();
    t = window.setInterval(() => setTick((n) => n + 1), 2000);
    return () => { if (t) window.clearInterval(t); };
  }, [id]);

  useEffect(() => {
    if (!job || job.status === 'done' || job.status === 'error') return;
    fetch(`/api/jobs/${id}`, { cache: 'no-store' })
      .then((r) => r.json())
      .then((j) => setJob(j))
      .catch(() => {});
  }, [tick]); // poll

  if (!job) return <main style={{ padding: 24 }}>Loading…</main>;

  return (
    <main style={{ padding: 24, maxWidth: 860, margin: '0 auto', color: '#e9eef3' }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Job #{job.id.slice(0, 8)}</h1>
      <p style={{ color: '#97a3af', marginBottom: 18 }}>
        Created {new Date(job.created_at).toLocaleString()}
      </p>

      {job.status === 'queued' && <Badge text="Queued" />}
      {job.status === 'processing' && <Badge text="Processing…" glow />}
      {job.status === 'error' && (
        <>
          <Badge text="Error" error />
          <pre style={{ marginTop: 14, color: '#ff9ea3', whiteSpace: 'pre-wrap' }}>{job.error}</pre>
        </>
      )}
      {job.status === 'done' && (
        <>
          <Badge text="Done" good />
          <pre style={{
            marginTop: 14,
            padding: 12,
            borderRadius: 12,
            background: '#0f1113',
            border: '1px solid #1b1d21',
            color: '#cfe7ff',
            overflowX: 'auto'
          }}>
            {JSON.stringify(job.output ?? { note: 'No output object provided yet.' }, null, 2)}
          </pre>
        </>
      )}
    </main>
  );
}

function Badge({ text, glow, error, good }: { text: string; glow?: boolean; error?: boolean; good?: boolean }) {
  const bg = error ? '#2a1214' : good ? '#0f1f1c' : '#151922';
  const bd = error ? '#52222a' : good ? '#1f4d43' : '#253246';
  const sh = glow ? '0 0 18px rgba(124,211,255,0.22)' : 'none';
  const col = error ? '#ff9ea3' : good ? '#67e8f9' : '#9ecaf5';
  return (
    <span style={{
      display: 'inline-block',
      padding: '8px 12px',
      borderRadius: 999,
      background: bg,
      border: `1px solid ${bd}`,
      color: col,
      boxShadow: sh,
      fontWeight: 700,
      letterSpacing: 0.2
    }}>{text}</span>
  );
}
