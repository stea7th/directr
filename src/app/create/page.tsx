"use client";

import React, { useCallback, useMemo, useRef, useState } from "react";
import "./page.css";

type UploadFile = File & { preview?: string; pretty?: string };

const MAX_MB = 2048; // 2GB soft limit for UX (tweak as you like)
const ACCEPT = "video/*,audio/*";

export default function CreatePage() {
  const [prompt, setPrompt] = useState("");
  const [file, setFile] = useState<UploadFile | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const liveRef = useRef<HTMLDivElement>(null);

  const disabled = useMemo(() => isBusy || (!prompt && !file), [isBusy, prompt, file]);

  const speak = (msg: string) => {
    setToast(msg);
    // auto-hide toast
    setTimeout(() => setToast((t) => (t === msg ? null : t)), 2600);
    // aria-live
    if (liveRef.current) liveRef.current.textContent = msg;
  };

  function prettyBytes(bytes: number) {
    const units = ["B", "KB", "MB", "GB"];
    let i = 0, val = bytes;
    while (val >= 1024 && i < units.length - 1) { val /= 1024; i++; }
    return `${val.toFixed(val >= 100 ? 0 : val >= 10 ? 1 : 2)} ${units[i]}`;
  }

  function decorate(f: File): UploadFile {
    return Object.assign(f, {
      preview: URL.createObjectURL(f),
      pretty: `${f.name} · ${prettyBytes(f.size)}`
    });
  }

  const acceptFile = (f: File | null) => {
    if (!f) return;
    const mb = f.size / (1024 * 1024);
    if (mb > MAX_MB) {
      speak(`File too large. Max ~${MAX_MB} MB`);
      return;
    }
    // basic type hint—still allow since some containers misreport
    if (!f.type.startsWith("video/") && !f.type.startsWith("audio/")) {
      speak("Unexpected type. Try a video or audio file.");
    }
    setFile(decorate(f));
  };

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    acceptFile(e.target.files?.[0] || null);
  };

  const onDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault(); e.stopPropagation();
    setIsDragging(false);
    acceptFile(e.dataTransfer.files?.[0] || null);
  };

  const onDrag = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault(); e.stopPropagation();
    setIsDragging(e.type === "dragenter" || e.type === "dragover");
  };

  const onClear = () => {
    if (file?.preview) URL.revokeObjectURL(file.preview);
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (disabled) return;
    setIsBusy(true);
    setProgress(0);

    // Demo progress animation while you wire your real API:
    const start = performance.now();
    const tick = () => {
      const t = performance.now() - start;
      const pct = Math.min(95, Math.round((t / 1800) * 100));
      setProgress(pct);
      if (pct < 95) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);

    try {
      // TODO: replace with your real POST /api/jobs
      // const body = new FormData();
      // if (file) body.append("file", file);
      // body.append("prompt", prompt);
      // const res = await fetch("/api/jobs", { method: "POST", body });
      // if (!res.ok) throw new Error(await res.text());

      await new Promise((r) => setTimeout(r, 1800)); // simulate
      setProgress(100);
      speak("Job created — check Jobs in a moment.");
      setPrompt("");
      onClear();
    } catch (err: any) {
      speak(err?.message || "Something went wrong.");
    } finally {
      setIsBusy(false);
      setTimeout(() => setProgress(0), 600);
    }
  }

  return (
    <main className="create__main">
      {/* motion background */}
      <div className="bg-blob bg-blob--one" />
      <div className="bg-blob bg-blob--two" />
      <div className="bg-blob bg-blob--three" />

      <section className="create__wrap">
        <header className="create__header">
          <h1 className="title">Create</h1>
          <p className="sub">Tell Directr what to make — drop a file or paste a URL.</p>
        </header>

        <form className="panel panel--ring" onSubmit={onSubmit} noValidate>
          <label className="field">
            <span className="field__label">Prompt</span>
            <textarea
              className="input input--area"
              placeholder="Clip 5 times; 9:16; bold captions; keep best hooks…"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              spellCheck={false}
            />
            <div className="assist">
              {["Find 3 hooks → 9:16", "Clip 5 × 30s with subs", "Summarize to 60s VO"].map(t => (
                <button
                  key={t}
                  className="chip"
                  type="button"
                  onClick={() => setPrompt((p) => (p ? p + "\n" + t : t))}
                >
                  {t}
                </button>
              ))}
            </div>
          </label>

          <label
            className={`drop ${isDragging ? "drop--drag" : ""} ${file ? "drop--has" : ""}`}
            onDrop={onDrop}
            onDragEnter={onDrag}
            onDragOver={onDrag}
            onDragLeave={onDrag}
          >
            <div className="drop__inner">
              {!file ? (
                <>
                  <div className="drop__icon" aria-hidden>⬆️</div>
                  <div className="drop__text">
                    <strong>Drag & drop</strong> a file here, or{" "}
                    <button type="button" className="link" onClick={() => fileInputRef.current?.click()}>
                      browse
                    </button>
                  </div>
                  <div className="drop__hint">Accepted: video/audio · up to ~2 GB</div>
                </>
              ) : (
                <div className="drop__file">
                  <div className="drop__badge" title={file.name}>
                    {file.pretty}
                  </div>
                  <button type="button" className="link" onClick={onClear}>remove</button>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPT}
              className="hidden"
              onChange={onPick}
            />
          </label>

          {!!progress && (
            <div className="bar" aria-hidden>
              <div className="bar__fill" style={{ width: `${progress}%` }} />
            </div>
          )}

          <button className={`prime ${isBusy ? "prime--busy" : ""}`} disabled={disabled}>
            <span className="prime__shine" />
            {isBusy ? (<><span className="dots" aria-hidden /><span>Working…</span></>) : "Create"}
          </button>

          <div className="sr-live" aria-live="polite" aria-atomic="true" ref={liveRef} />
        </form>

        <footer className="foot">
          <span className="foot__hint">Pro tip: Paste a TikTok/YouTube URL in the prompt.</span>
        </footer>
      </section>

      {/* toast */}
      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}
    </main>
  );
}
