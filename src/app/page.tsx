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

  // caption controls
  const [font, setFont] = useState(FONT_OPTIONS[0]);
  const [fontSize, setFontSize] = useState<number>(72);
  const [style, setStyle] = useState(STYLE_OPTIONS[1]);
  const [position, setPosition] = useState(POSITION_OPTIONS[2]);

  const dropRef = useRef<HTMLDivElement>(null);

  const captionOptions = useMemo(
    () => ({ font, fontSize, style, position: position.toLowerCase() }),
    [font, fontSize, style, position],
  );

  const loadJobs = useCallback(async (userId?: string | null) => {
    const { data: { user } } = await supabase.auth.getUser();
    const uid = userId ?? user?.id ?? null;
    if (!uid) {
      setJobs([]);
      return;
    }
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

      let jobId: string;
      try {
        const { data: idData, error: idErr } = await supabase.rpc('gen_random_uuid');
        jobId = (!idErr && idData) || crypto.randomUUID();
      } catch { jobId = crypto.randomUUID(); }

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
        error: null
        // options: captionOptions, // add this only if you created a JSONB "options" column
      });
      if (insErr) throw insErr;

      setFile(null);
      await loadJobs(user.id);
    } catch (e: any) {
      console.error(e);
      alert(e?.message || 'Upload failed');
    } finally { setBusy(false); }
  };

  return (
    <div className="grid-2">
      <section className="card">
        <h1>Create</h1>
        <p className="lead">Upload a video → get a captioned, social-ready clip back.</p>

        <div
          ref={dropRef}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          className={`drop ${dragOver ? 'over' : ''}`}
        >
          <div className="hint">
            <p>Drag & drop your video or <label style={{cursor:'pointer', color:'var(--accent)', textDecoration:'underline'}}>
              browse
              <input type="file" accept="video/*" style={{display:'none'}} onChange={onFilePick} />
            </label></p>
            <div className="small">MP4 recommended</div>
            {file ? <div className="small" style={{marginTop: '8px'}}>Selected: {file.name}</div> : null}
          </div>
        </div>

        <div className="row">
          <label className="label">
            <span>Font</span>
            <select value={font} onChange={(e) => setFont(e.target.value)} className="select">
              {FONT_OPTIONS.map((f) => (<option key={f} value={f}>{f}</option>))}
            </select>
          </label>

          <label className="label">
            <span>Size</span>
            <input
              type="number"
              min={24}
              max={120}
              step={2}
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value || 0))}
              className="number"
            />
          </label>

          <label className="label">
            <span>Style</span>
            <select value={style} onChange={(e) => setStyle(e.target.value)} className="select">
              {STYLE_OPTIONS.map((s) => (<option key={s} value={s}>{s}</option>))}
            </select>
          </label>

          <label className="label">
            <span>Position</span>
            <select value={position} onChange={(e) => setPosition(e.target.value)} className="select">
              {POSITION_OPTIONS.map((p) => (<option key={p} value={p}>{p}</option>))}
            </select>
          </label>
        </div>

        <div className="actions">
          <button className="btn btn-primary" onClick={handleUpload} disabled={busy || !file}>
            {busy ? 'Uploading…' : 'Upload & Process'}
          </button>
          <button className="btn btn-ghost" onClick={() => loadJobs()}>
            Refresh
          </button>
        </div>
      </section>

      <section className="card">
        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'10px'}}>
          <h2>Your recent jobs</h2>
          <button className="btn btn-ghost" onClick={() => loadJobs()}>Refresh</button>
        </div>

        <div className="jobs">
          {jobs.length === 0 && (
            <div className="job">No jobs yet.</div>
          )}
          {jobs.map((job) => (<JobRow key={job.id} job={job} />))}
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

  const badgeClass =
    job.status === 'done' ? 'badge done' :
    job.status === 'processing' ? 'badge proc' :
    job.status === 'error' ? 'badge err' : 'badge';

  return (
    <div className="job">
      <div className="job-head">
        <div>
          <div style={{fontSize: '14px', fontWeight: 600, color:'rgba(255,255,255,0.92)'}}>Clip</div>
          <div className="job-id">{job.id}</div>
        </div>
        <span className={badgeClass}>{job.status}</span>
      </div>

      <div className="job-actions">
        {job.status === 'done' ? (
          <a href={url || '#'} target="_blank" className="btn btn-ghost download">Download video</a>
        ) : (
          <button className="btn" disabled>
            {job.status === 'processing' ? 'Processing…' : job.status === 'queued' ? 'Queued' : 'No video'}
          </button>
        )}
        {job.error ? (<div className="error">Error: {job.error}</div>) : null}
      </div>
    </div>
  );
}
