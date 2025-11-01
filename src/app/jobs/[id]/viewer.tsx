'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

type Job = {
  id: string;
  status: 'queued' | 'processing' | 'done' | 'error';
  prompt: string | null;
  input_path: string | null;
  output_path: string | null;
  error: string | null;
  created_at?: string;
};

export default function JobViewer({ id }: { id: string }) {
  const [job, setJob] = useState<Job | null>(null);
  const [publicUrl, setPublicUrl] = useState<string | null>(null);

  useEffect(() => {
    let timer: any;

    async function tick() {
      const res = await fetch(`/api/job?id=${id}`, { cache: 'no-store' });
      const json = await res.json();
      if (res.ok) {
        setJob(json.job);
      } else {
        setJob({ id, status: 'error', prompt: null, input_path: null, output_path: null, error: json.error });
      }
    }

    tick();
    timer = setInterval(tick, 1500);
    return () => clearInterval(timer);
  }, [id]);

  useEffect(() => {
    // build a public URL for output when available
    async function buildUrl() {
      if (!job?.output_path) return setPublicUrl(null);
      const supa = createClient();
      const { data } = supa.storage.from('outputs').getPublicUrl(job.output_path);
      setPublicUrl(data.publicUrl || null);
    }
    buildUrl();
  }, [job?.output_path]);

  return (
    <main style={{ padding: 24 }}>
      <h1 style={{ marginTop: 0 }}>Job #{id}</h1>
      {!job && <p>Loading…</p>}

      {job && (
        <div style={{ border: '1px solid #222', borderRadius: 12, padding: 16 }}>
          <p><b>Status:</b> {job.status}</p>
          {job.prompt && <p><b>Prompt:</b> {job.prompt}</p>}
          {job.input_path && <p><b>Input:</b> {job.input_path}</p>}

          {job.status === 'error' && <p style={{ color: '#fca5a5' }}><b>Error:</b> {job.error}</p>}

          {job.status !== 'done' && job.status !== 'error' && (
            <p style={{ color: '#9aa4af' }}>Processing… this will update automatically.</p>
          )}

          {job.status === 'done' && publicUrl && (
            <a href={publicUrl} target="_blank" rel="noreferrer" style={{
              display: 'inline-block', marginTop: 10, padding: '8px 12px',
              borderRadius: 10, border: '1px solid #2a3a4a', background: '#0f1113', color: '#e9eef3', textDecoration: 'none'
            }}>
              Download result
            </a>
          )}
        </div>
      )}
    </main>
  );
}
