"use client";

import React, { useCallback, useRef, useState } from "react";
import "./page.css";

type UploadFile = File & { preview?: string };

export default function CreatePage() {
  const [prompt, setPrompt] = useState("");
  const [file, setFile] = useState<UploadFile | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const onPick = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    if (f) setFile(Object.assign(f, { preview: URL.createObjectURL(f) }));
  }, []);

  const onDrop = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const f = e.dataTransfer.files?.[0] || null;
    if (f) setFile(Object.assign(f, { preview: URL.createObjectURL(f) }));
  }, []);

  const onDrag = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setIsDragging(true);
    else setIsDragging(false);
  }, []);

  const onClear = () => {
    setFile(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt && !file) return;
    setIsBusy(true);

    // Simulate a request so the UI animates nicely.
    await new Promise((r) => setTimeout(r, 1500));

    // TODO: hook your real POST /api/jobs here
    // const body = new FormData();
    // if (file) body.append("file", file);
    // body.append("prompt", prompt);
    // await fetch("/api/jobs", { method: "POST", body });

    setIsBusy(false);
    alert("✅ Job created (demo). Wire to your /api when ready.");
  };

  return (
    <main className="create__main">
      {/* animated background blobs */}
      <div className="bg-blob bg-blob--one" />
      <div className="bg-blob bg-blob--two" />
      <div className="bg-blob bg-blob--three" />

      <section className="create__wrap">
        <header className="create__header">
          <h1 className="title">Create</h1>
          <p className="sub">Upload or drop a file and tell Directr what to make.</p>
        </header>

        <form className="panel" onSubmit={onSubmit}>
          {/* prompt */}
          <label className="field">
            <span className="field__label">Prompt</span>
            <textarea
              className="input input--area"
              placeholder="Clip 5 times; 9:16; bold captions; keep best hooks…"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
            />
          </label>

          {/* dropzone */}
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
                  <div className="drop__icon">⬆️</div>
                  <div className="drop__text">
                    <strong>Drag & drop</strong> a video/audio here, or
                    <button
                      type="button"
                      className="link"
                      onClick={() => inputRef.current?.click()}
                    >
                      browse
                    </button>
                  </div>
                  <div className="drop__hint">MP4, MOV, WAV, MP3… up to a few GB (Edge Functions OK)</div>
                </>
              ) : (
                <div className="drop__file">
                  <div className="drop__badge">{file.name}</div>
                  <button type="button" className="link" onClick={onClear}>
                    remove
                  </button>
                </div>
              )}
            </div>
            <input
              ref={inputRef}
              type="file"
              accept="video/*,audio/*"
              className="hidden"
              onChange={onPick}
            />
          </label>

          {/* action */}
          <button className={`prime ${isBusy ? "prime--busy" : ""}`} disabled={isBusy}>
            <span className="prime__shine" />
            {isBusy ? (
              <>
                <span className="dots" aria-hidden />
                Working…
              </>
            ) : (
              "Create"
            )}
          </button>
        </form>

        {/* tips */}
        <div className="tips">
          <div className="tip">
            <div className="tip__title">Quick prompts</div>
            <div className="tip__chips">
              {[
                "Find 3 hooks → 9:16",
                "Clip 5 × 30s with subs",
                "Summarize to 60s voiceover",
              ].map((t) => (
                <button
                  key={t}
                  type="button"
                  className="chip"
                  onClick={() => setPrompt((p) => (p ? p + "\n" + t : t))}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="tip">
            <div className="tip__title">Pro tip</div>
            <p className="tip__body">You can paste a TikTok/YouTube URL instead of uploading a file.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
