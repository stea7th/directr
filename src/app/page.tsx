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

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
const supabase = createClient(supabaseUrl, supabaseAnon);

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

  const dropRef = useRef<HTMLDivElement>(null);

  const captionOptions = useMemo(
    () => ({ font, fontSize, style, position: position.toLowerCase() }),
    [font, fontSize, style, position],
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
    e.preventDefault(); e.stopPropagation(); setDragOver(false);
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
        cacheControl: '3600', upsert: true, contentType: file.type || 'video/mp4',
      });
      if (up.error) throw up.error;

      const { error: insErr } = await supabase.from('jobs').insert({
        id: jobId, status: 'queued', input_path: inputPath, output_path: null, error: null,
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
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      {/* Upload panel */}
      <section className="rounded-2xl border border-white/10 bg-neutral-900/50 p-6 ring-1 ring-white/5">
        <h1 className="text-lg font-semibold">Create</h1>
        <p className="mt-1 text-sm text-white/60">Upload a video → get a captioned, social-ready clip back.</p>

        <div
          ref={dropRef}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          className={[
            'mt-6 flex h-44 items-center justify-center rounded-2xl border-2 border-dashed transition',
            dragOver ? 'border-sky-500 bg-sky-500/10' : 'border-white/10 bg-neutral-900/60',
          ].join(' ')}
        >
          <div className="text-center">
            <p className="text-white/80">
              Drag & drop your video or{' '}
              <label className="cursor-pointer text-sky-400 underline">
                browse
                <input type="file" accept="video/*" className="hidden" onChange={onFilePick} />
              </label>
            </p>
            <p className="mt-1 text-xs text-white/50">MP4 recommended</p>
            {file ? <p className="mt-3 text-xs text-white/70">Selected: {file.name}</p> : null}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <label className="flex flex-col gap-1 text-xs">
            <span className="text-white/60">Font</span>
            <select
              value={font}
              onChange={(e) => setFont(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-neutral-900/70 px-3 py-2 text-sm text-white/90 outline-none ring-1 ring-white/5 hover:ring-sky-500/30 focus:ring-sky-500/50 transition"
            >
              {FONT_OPTIONS.map((f) => <option key={f}>{f}</option>)}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-xs">
            <span className="text-white/60">Size</span>
            <input
              type="number" min={24} max={120} step={2} value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value || 0))}
              className="w-full rounded-xl border border-white/10 bg-neutral-900/70 px-3 py-2 text-sm text-white/90 outline-none ring-1 ring-white/5 hover:ring-sky-500/30 focus:ring-sky-500/50 transition"
            />
          </label>

          <label className="flex flex-col gap-1 text-xs">
            <span className="text-white/60">Style</span>
            <select
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-neutral-900/70 px-3 py-2 text-sm text-white/90 outline-none ring-1 ring-white/5 hover:ring-sky-500/30 focus:ring-sky-500/50 transition"
            >
              {STYLE_OPTIONS.map((s) => <option key={s}>{s}</option>)}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-xs">
            <span className="text-white/60">Position</span>
            <select
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-neutral-900/70 px-3 py-2 text-sm text-white/90 outline-none ring-1 ring-white/5 hover:ring-sky-500/30 focus:ring-sky-500/50 transition"
            >
              {POSITION_OPTIONS.map((p) => <option key={p}>{p}</option>)}
            </select>
          </label>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <button
            disabled={busy || !file}
            onClick={handleUpload}
            className="inline-flex h-9 items-center rounded-xl bg-sky-500 px-4 text-sm font-medium text-white shadow-sm hover:bg-sky-400 disabled:pointer-events-none disabled:opacity-50"
          >
            {busy ? 'Uploading…' : 'Upload & Process'}
          </button>
          <button
            onClick={() => loadJobs()}
            className="inline-flex h-9 items-center rounded-xl border border-white/10 bg-neutral-900/70 px-3 text-sm text-white/90 hover:ring-1 hover:ring-sky-500/30"
          >
            Refresh
          </button>
        </div>
      </section>

      {/* Jobs */}
      <section className="rounded-2xl border border-white/10 bg-neutral-900/50 p-6 ring-1 ring-white/5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Your recent jobs</h2>
          <button
            onClick={() => loadJobs()}
            className="h-8 rounded-lg border border-white/10 bg-neutral-900/70 px-3 text-xs text-white/80 hover:ring-1 hover:ring-sky-500/30"
          >
            Refresh
          </button>
        </div>

        <div className="flex flex-col gap-3">
          {jobs.length === 0 && (
            <div className="rounded-xl border border-white/10 bg-neutral-900/60 p-4 text-sm text-white/60">
              No jobs yet.
            </div>
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
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
        );
        const { data } = await s.storage.from('videos').createSignedUrl(job.output_path, 600);
        if (!cancelled && data?.signedUrl) setUrl(data.signedUrl);
      }
    })();
    return () => { cancelled = true; };
  }, [job.status, job.output_path]);

  const badge =
    job.status === 'done'
      ? 'bg-sky-500/20 text-sky-400 border-sky-500/30'
      : job.status === 'processing'
      ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
      : job.status === 'error'
      ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
      : 'bg-white/5 text-white/60 border-white/10';

  return (
    <div className="group rounded-xl border border-white/10 bg-neutral-900/60 p-4 ring-1 ring-white/5 transition hover:ring-sky-500/30">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-medium text-white/90">Clip</div>
          <div className="mt-1 text-xs text-white/50 break-all">{job.id}</div>
        </div>
        <span className={`rounded-full border px-2 py-0.5 text-[11px] ${badge}`}>{job.status}</span>
      </div>

      <div className="mt-3 flex items-center justify-between">
        {job.status === 'done' ? (
          <a
            href={url || '#'}
            target="_blank"
            className="inline-flex h-8 items-center rounded-lg border border-white/10 bg-neutral-900/70 px-3 text-xs text-white/90 hover:ring-1 hover:ring-sky-500/30"
          >
            Download video
          </a>
        ) : (
          <button
            disabled
            className="inline-flex h-8 items-center rounded-lg border border-white/10 bg-neutral-900/50 px-3 text-xs text-white/50"
          >
            {job.status === 'processing' ? 'Processing…' : job.status === 'queued' ? 'Queued' : 'No video'}
          </button>
        )}
        {job.error ? <div className="text-[11px] text-rose-400">Error: {job.error}</div> : null}
      </div>
    </div>
  );
}
