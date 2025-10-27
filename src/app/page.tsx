'use client';

import React, { useRef, useState } from 'react';

export default function AppHome() {
  const [prompt, setPrompt] = useState('');
  const [busy, setBusy] = useState(false);
  const [fileName, setFileName] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleGenerate() {
    if (busy) return;

    const hasPrompt = prompt.trim().length > 0;
    const hasFile = !!fileName;
    if (!hasPrompt && !hasFile) {
      alert('Type something or attach a file.');
      return;
    }

    setBusy(true);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          fileName: hasFile ? fileName : undefined,
        }),
        credentials: 'include',
      });

      const json = await res.json().catch(() => ({} as any));
      if (!res.ok) throw new Error(json?.error || 'Failed to start');

      const id = json?.id || json?.jobId || 'new';
      window.location.href = `/jobs/${id}`;
    } catch (e: any) {
      console.error(e);
      alert(e?.message || 'Failed to start the job.');
    } finally {
      setBusy(false);
    }
  }

  function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    setFileName(f ? f.name : '');
  }

  function onDropFile(e: React.DragEvent<HTMLButtonElement>) {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) {
      setFileName(f.name);
      if (fileInputRef.current) {
        const dt = new DataTransfer();
        dt.items.add(f);
        fileInputRef.current.files = dt.files;
      }
    }
  }

  return (
    <main className="wrap">
      <section className="card" aria-label="Directr command surface">
        <h1 className="title">Type what you want or upload a file</h1>

        <div className="inputStack">
          <textarea
            className="prompt"
            placeholder="Example: Turn this podcast into 5 viral TikToks"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />

          <div className="row">
            <button
              type="button"
              className="fileBtn"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={onDropFile}
              aria-label="Choose a file or drop here"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
                <path
                  fill="currentColor"
                  d="M16.5 6.5a3.5 3.5 0 0 1 0 7H14v-2h2.5a1.5 1.5 0 0 0 0-3H13V7h3.5ZM11 8H9v3H6v2h3v3h2v-3h3v-2h-3V8Z"
                />
              </svg>
              <span>{fileName ? fileName : 'Choose File / Drop here'}</span>
              <input
                ref={fileInputRef}
                className="hiddenFile"
                type="file"
                accept="video/*,audio/*,.mp3,.mp4,.mov,.m4a,.wav,.aac"
                onChange={onPickFile}
              />
            </button>

            <button
              type="button"
              className={`genBtn neon ${busy ? 'isBusy' : ''}`}
              onClick={handleGenerate}
              disabled={busy || (!prompt.trim() && !fileName)}
            >
              {busy ? 'Working…' : 'Generate'}
            </button>
          </div>
        </div>

        <p className="hint">
          Tip: Drop a video/audio, or just describe what you want. We’ll handle the rest.
        </p>
      </section>

      <nav className="tiles" aria-label="Quick links">
        <a className="tile" href="/create">
          <strong>Create</strong>
          <span>Upload → get captioned clips</span>
        </a>
        <a className="tile" href="/clipper">
          <strong>Clipper</strong>
          <span>Auto-find hooks & moments</span>
        </a>
        <a className="tile" href="/planner">
          <strong>Planner</strong>
          <span>Plan posts & deadlines</span>
        </a>
      </nav>
    </main>
  );
}
