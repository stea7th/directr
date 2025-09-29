// src/app/page.tsx
'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

type Job = {
  id: string;
  status: 'queued' | 'processing' | 'done' | 'error';
  input_path: string | null;
  output_path: string | null;
  error: string | null;
  created_at?: string | null;
};

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
);

const FONT_OPTIONS = ['Inter', 'Montserrat', 'Anton', 'Poppins', 'Bebas Neue'];
const STYLE_OPTIONS = ['Classic', 'Shadow', 'Outline', 'Glow'];
const POSITION_OPTIONS = ['Top', 'Middle', 'Bottom'];

export default function Page() {
  const [file, setFile] = useState<File | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [busy, setBusy] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const [font, setFont] = useState(FONT_OPTIONS[0]);
  const [fontSize, setFontSize] = useState<number>(72);
  const [style, setStyle] = useState(STYLE_OPTIONS[1]);
  const [position, setPosition] = useState(POSITION_OPTIONS[2]);

  const captionOptions = useMemo(
    () => ({ font, fontSize, style, position: position.toLowerCase() }),
    [font, fontSize, style, position]
  );

  const loadJobs = useCallback(async () => {
    const { data, error } = await supabase
      .from('jobs')
      .select('id,status,input_path,output_path,error,created_at')
      .order('created_at', { ascending: false })
      .limit(25);

    if (!error && data) setJobs(data as Job[]);
  }, []);

  useEffect(() => { loadJobs(); }, [loadJobs]);

  const onFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0] ?? null;
    if (f) setFile(f);
  };

  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragOver(true); };
  const onDragLeave = (e: React.DragEvent) => { e.preventDefault(); setDragOver(false); };

  const handleUpload = async () => {
    if (!file) { alert('Choose a video first'); return; }
    setBusy(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { alert('Sign in first'); setBusy(false); return; }

      const ext = (file.name.split('.').pop() || 'mp4').toLowerCase();
      const jobId = crypto.randomUUID();
      const inputPath = `uploads/${user.id}/${jobId}.${ext}`;

      const up = await supabase.storage.from('videos').upload(inputPath, file, {
        cacheControl: '3600',
        upsert: true,
        contentType: file.type || 'video/mp4',
      });
      if (up.error) throw up.error;

      const { error: insErr } = await supabase.from('jobs').insert({
        id: jobId,
        status: 'queued',
        input_path: inputPath,
        output_path: null,
        error: null,
        options: captionOptions, // JSONB column recommended
      });
      if (insErr) throw insErr;

      setFile(null);
      await loadJobs();
    } catch (e: any) {
      console.error(e);
      alert(e?.message || 'Upload failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid grid-2">
      {/* Left: Upload */}
      <section className="card">
        <h1 className="h1">Create</h1>
        <p className="muted">Upload a video → get a captioned, social-ready clip back.</p>

        <div
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          className={`dropzone ${dragOver ? 'is-over' : ''}`}
        >
          <div className="dz-inner">
            <p>
              Drag &amp; drop your video or{' '}
              <label className="link">
                browse
                <input type="file" accept="video/*" className="hidden-input" onChange={onFilePick} />
              </label>
            </p>
            <p className="hint">MP4 recommended</p>
            {file ? <p className="hint sel">Selected: {file.name}</p> : null}
          </div>
        </div>

        <div className="controls">
          <label className="ctl">
            <span className="label">Font</span>
            <select className="select" value={font} onChange={(e) => setFont(e.target.value)}>
              {FONT_OPTIONS.map((f) => (<option key={f}>{f}</option>))}
            </select>
          </label>

          <label className="ctl">
            <span className="label">Size</span>
            <input
              className="input"
              type="number"
              min={24}
              max={120}
              step={2}
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value || 0))}
            />
          </label>

          <label className="ctl">
            <span className="label">Style</span>
            <select className="select" value={style} onChange={(e) => setStyle(e.target.value)}>
              {STYLE_OPTIONS.map((s) => (<option key={s}>{s}</option>))}
            </select>
          </label>

          <label className="ctl">
            <span className="label">Position</span>
            <select className="select" value={position} onChange={(e) => setPosition(e.target.value)}>
              {POSITION_OPTIONS.map((p) => (<option key={p}>{p}</option>))}
            </select>
          </label>
        </div>

        <div className="actions">
          <button className="btn btn-primary" onClick={handleUpload} disabled={busy || !file}>
            {busy ? 'Uploading…' : 'Upload & Process'}
          </button>
          <button className="btn btn-ghost" onClick={() => loadJobs()}>Refresh</button>
        </div>
      </section>

      {/* Right: Jobs */}
      <section className="card">
        <div className="card-head">
          <h2 className="h2">Your recent jobs</h2>
          <button className="chip" onClick={() => loadJobs()}>Refresh</button>
        </div>

        <div className="jobs">
          {jobs.length === 0 && (
            <div className="empty">No jobs yet.</div>
          )}
          {jobs.map((job) => <JobRow key={job.id} job={job} />)}
        </div>
      </section>
    </div>
  );
}

function JobRow({ job }: { job: Job }) {
  const [url, setUrl] = useState<string>('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (job.status === 'done' && job.output_path) {
        const s = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL as string,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
        );
        const { data } = await s.storage.from('videos').createSignedUrl(job.output_path, 600);
        if (!cancelled && data?.signedUrl) setUrl(data.signedUrl);
      }
    })();
    return () => { cancelled = true; };
  }, [job.status, job.output_path]);

  let badgeClass = 'badge';
  if (job.status === 'done') badgeClass += ' badge-done';
  else if (job.status === 'processing') badgeClass += ' badge-warn';
  else if (job.status === 'error') badgeClass += ' badge-err';

  return (
    <div className="job">
      <div className="job-top">
        <div>
          <div className="job-title">Clip</div>
          <div className="job-id">{job.id}</div>
        </div>
        <span className={badgeClass}>{job.status}</span>
      </div>

      <div className="job-actions">
        {job.status === 'done' ? (
          <a className="btn btn-ghost" href={url || '#'} target="_blank">Download video</a>
        ) : (
          <button className="btn btn-disabled" disabled>
            {job.status === 'processing' ? 'Processing…' : job.status === 'queued' ? 'Queued' : 'No video'}
          </button>
        )}

        {job.error ? <div className="err-text">Error: {job.error}</div> : null}
      </div>
    </div>
  );
}
