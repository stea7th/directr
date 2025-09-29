// src/app/page.tsx
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "./lib/supabase"; // <- keep your file at src/app/lib/supabase.ts

type Job = {
  id: string;
  status: "queued" | "processing" | "done" | "error";
  input_path: string | null;
  output_path: string | null;
  error: string | null;
  created_at?: string | null;
};

const FONT_OPTIONS = ["Inter", "Montserrat", "Anton", "Poppins", "Bebas Neue"];
const STYLE_OPTIONS = ["Classic", "Shadow", "Outline", "Glow"];
const POSITION_OPTIONS = ["Top", "Middle", "Bottom"];

export default function Page() {
  // upload state
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  // caption controls
  const [font, setFont] = useState(FONT_OPTIONS[0]);
  const [fontSize, setFontSize] = useState<number>(72);
  const [style, setStyle] = useState(STYLE_OPTIONS[1]);
  const [position, setPosition] = useState(POSITION_OPTIONS[2]);

  // jobs
  const [jobs, setJobs] = useState<Job[]>([]);

  const dropRef = useRef<HTMLDivElement>(null);

  const options = useMemo(
    () => ({
      font,
      fontSize,
      style,
      position: position.toLowerCase(),
    }),
    [font, fontSize, style, position]
  );

  const loadJobs = useCallback(async () => {
    // (optionally scope by user_id if your table stores it)
    const { data, error } = await supabase
      .from("jobs")
      .select("id,status,input_path,output_path,error,created_at")
      .order("created_at", { ascending: false })
      .limit(25);

    if (!error && data) setJobs(data as Job[]);
    if (error) console.error(error);
  }, []);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  // drag and drop handlers
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0] ?? null;
    if (f) setFile(f);
  };
  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };
  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Choose a video first");
      return;
    }
    setBusy(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        alert("Sign in first");
        setBusy(false);
        return;
      }

      const ext = (file.name.split(".").pop() || "mp4").toLowerCase();
      const jobId = crypto.randomUUID();
      const inputPath = `uploads/${user.id}/${jobId}.${ext}`;

      // upload to storage
      const upload = await supabase
        .storage
        .from("videos")
        .upload(inputPath, file, {
          cacheControl: "3600",
          upsert: true,
          contentType: file.type || "video/mp4",
        });

      if (upload.error) throw upload.error;

      // create job record
      const { error: insertErr } = await supabase.from("jobs").insert({
        id: jobId,
        status: "queued",
        input_path: inputPath,
        output_path: null,
        error: null,
        options, // if you don't have this JSONB column, remove this line
      });

      if (insertErr) {
        // helpful hint if options column doesn’t exist
        if (insertErr.message?.includes("options")) {
          alert(
            "Your 'jobs' table does not have an 'options' column. Either add JSONB 'options' or remove it from the insert."
          );
        }
        throw insertErr;
      }

      setFile(null);
      await loadJobs();
    } catch (err: any) {
      console.error(err);
      alert(err?.message ?? "Upload failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container">
      {/* page intro headline */}
      <h1 className="title">Create</h1>
      <p className="subtitle">
        Upload a video → get a captioned, social-ready clip back.
      </p>

      <div className="dashboard">
        {/* Left: uploader */}
        <section className="card">
          <div
            ref={dropRef}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            className={`drop ${dragOver ? "drop--over" : ""}`}
          >
            <div className="drop__inner">
              <p>
                Drag & drop your video or{" "}
                <label className="browse">
                  browse
                  <input type="file" accept="video/*" className="hidden" onChange={onPick} />
                </label>
              </p>
              <small>MP4 recommended</small>
              {file ? <p className="selected">Selected: {file.name}</p> : null}
            </div>
          </div>

          <div className="grid">
            <label className="field">
              <span>Font</span>
              <select value={font} onChange={(e) => setFont(e.target.value)} className="input">
                {FONT_OPTIONS.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Size</span>
              <input
                type="number"
                min={24}
                max={120}
                step={2}
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value || 0))}
                className="input"
              />
            </label>

            <label className="field">
              <span>Style</span>
              <select value={style} onChange={(e) => setStyle(e.target.value)} className="input">
                {STYLE_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Position</span>
              <select value={position} onChange={(e) => setPosition(e.target.value)} className="input">
                {POSITION_OPTIONS.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="actions">
            <button className="btn btn--primary" disabled={busy || !file} onClick={handleUpload}>
              {busy ? "Uploading…" : "Upload & Process"}
            </button>
            <button className="btn" onClick={loadJobs}>Refresh</button>
          </div>
        </section>

        {/* Right: jobs */}
        <section className="card">
          <div className="card__head">
            <h2>Your recent jobs</h2>
            <button className="btn btn--ghost" onClick={loadJobs}>Refresh</button>
          </div>

          <div className="jobs">
            {jobs.length === 0 && (
              <div className="empty">No jobs yet.</div>
            )}

            {jobs.map((job) => (
              <JobRow key={job.id} job={job} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function JobRow({ job }: { job: Job }) {
  const [url, setUrl] = useState<string>("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (job.status === "done" && job.output_path) {
        const { data, error } = await supabase
          .storage
          .from("videos")
          .createSignedUrl(job.output_path, 600);
        if (!error && !cancelled && data?.signedUrl) setUrl(data.signedUrl);
      }
    })();
    return () => { cancelled = true; };
  }, [job.status, job.output_path]);

  const badgeClass =
    job.status === "done"
      ? "badge badge--ok"
      : job.status === "processing"
      ? "badge badge--warn"
      : job.status === "error"
      ? "badge badge--err"
      : "badge";

  return (
    <div className="job">
      <div className="job__top">
        <div className="job__id">
          <div className="job__title">Clip</div>
          <div className="job__meta">{job.id}</div>
        </div>
        <span className={badgeClass}>{job.status}</span>
      </div>

      <div className="job__actions">
        {job.status === "done" ? (
          <a className="btn btn--ghost" href={url || "#"} target="_blank" rel="noreferrer">
            Download video
          </a>
        ) : (
          <button className="btn btn--disabled" disabled>
            {job.status === "processing" ? "Processing…" : job.status === "queued" ? "Queued" : "No video"}
          </button>
        )}
        {job.error ? <div className="job__err">Error: {job.error}</div> : null}
      </div>
    </div>
  );
}
