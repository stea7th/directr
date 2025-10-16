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
      // JSON payload to match /api/generate
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

  // Drag & drop support for the file button
  function onDropFile(e: React.DragEvent<HTMLButtonElement>) {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) {
      setFileName(f.name);
      // reflect in the hidden input so form state is consistent
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

      <style jsx>{`
        :root {
          --bg: #0c0c0d;
          --surface: #121214;
          --ink: #e9eef3;
          --muted: #9aa4af;
          --line: #1b1d21;
          --brand: #66b2ff;
          --brand-2: #7cd3ff;
          --good: #67e8f9;
        }

        .wrap {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 48px 16px 96px;
          color: var(--ink);
          background: transparent;
        }

        .card {
          width: 100%;
          max-width: 980px;
          margin: 24px auto 12px;
          background: radial-gradient(1200px 300px at 50% -10%, rgba(102, 178, 255, 0.06), transparent),
            linear-gradient(180deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.02));
          border: 1px solid var(--line);
          border-radius: 24px;
          padding: 28px;
          backdrop-filter: blur(6px);
          box-shadow:
            0 20px 50px rgba(0, 0, 0, 0.4),
            0 0 0 1px rgba(255, 255, 255, 0.04);
          animation: fadeUp 540ms ease-out both, cardGlow 6s ease-in-out infinite;
        }

        .title {
          font-size: 22px;
          font-weight: 700;
          letter-spacing: 0.2px;
          margin: 0 0 18px;
        }

        .inputStack { display: flex; flex-direction: column; gap: 14px; }

        .prompt {
          width: 100%;
          min-height: 140px;
          max-height: 320px;
          padding: 16px 18px;
          border-radius: 16px;
          border: 1px solid var(--line);
          background: #0f1113;
          color: var(--ink);
          resize: vertical;
          outline: none;
          transition: border-color 160ms ease, box-shadow 200ms ease, min-height 250ms ease;
        }
        .prompt:focus {
          min-height: 180px;
          border-color: rgba(124, 211, 255, 0.6);
          box-shadow: 0 0 0 3px rgba(102, 178, 255, 0.18), inset 0 0 0 1px rgba(102, 178, 255, 0.25);
        }

        .row {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 12px;
          align-items: center;
        }

        .fileBtn {
          position: relative;
          width: 100%;
          height: 48px;
          border-radius: 999px;
          background: #0f1113;
          border: 1px dashed #28303a;
          color: var(--muted);
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 0 16px 0 14px;
          cursor: pointer;
          transition: border-color 160ms ease, color 160ms ease, box-shadow 200ms ease, transform 120ms ease;
        }
        .fileBtn:hover {
          color: #c6d3df;
          border-color: #344254;
          box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.02);
        }
        .fileBtn:active { transform: translateY(1px); }
        .hiddenFile { display: none; }

        .genBtn {
          position: relative;
          height: 48px;
          padding: 0 22px;
          border-radius: 999px;
          border: 1px solid rgba(124, 211, 255, 0.5);
          background: linear-gradient(180deg, #1a2430, #161b22);
          color: #eaf6ff;
          font-weight: 700;
          letter-spacing: 0.2px;
          cursor: pointer;
          transition: transform 120ms ease, box-shadow 200ms ease, opacity 200ms ease, filter 200ms ease;
          overflow: hidden;
          box-shadow:
            0 0 0 0 rgba(124, 211, 255, 0.0),
            inset 0 -8px 24px rgba(124, 211, 255, 0.08);
          animation: pulse 3.6s ease-in-out infinite;
        }
        .genBtn.neon::before {
          content: "";
          position: absolute;
          inset: -3px;
          border-radius: inherit;
          pointer-events: none;
          background:
            radial-gradient(60% 140% at 50% -20%, rgba(124,211,255,0.24), rgba(124,211,255,0) 70%),
            radial-gradient(120% 80% at 50% 120%, rgba(102,178,255,0.18), rgba(102,178,255,0) 70%);
          filter: blur(6px);
          opacity: 0.65;
          transition: opacity 180ms ease;
          z-index: 0;
        }
        .genBtn.neon:hover::before { opacity: 0.95; }
        .genBtn.isBusy::after {
          content: "";
          position: absolute;
          inset: 2px;
          border-radius: inherit;
          pointer-events: none;
          background:
            repeating-linear-gradient(
              -45deg,
              rgba(255,255,255,0.10) 0 10px,
              rgba(255,255,255,0.00) 10px 22px
            );
          background-size: 220% 100%;
          mix-blend-mode: screen;
          animation: shimmer 1.15s linear infinite;
          z-index: 1;
        }
        .genBtn:hover {
          box-shadow:
            0 0 24px rgba(124, 211, 255, 0.18),
            0 0 0 1px rgba(124, 211, 255, 0.25),
            inset 0 -10px 28px rgba(124, 211, 255, 0.12);
          transform: translateY(-0.5px);
          filter: saturate(1.1);
        }
        .genBtn:active { transform: translateY(0.5px); }
        .genBtn:disabled { opacity: 0.55; cursor: not-allowed; animation: none; }
        .genBtn.isBusy { animation: throb 1.2s ease-in-out infinite; }

        .hint { margin: 10px 2px 0; font-size: 13px; color: var(--muted); }

        .tiles {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 16px;
          width: 100%;
          max-width: 980px;
          margin: 26px auto 0;
        }
        .tile {
          display: flex; flex-direction: column; gap: 4px;
          padding: 16px 18px;
          border-radius: 18px;
          text-decoration: none; color: var(--ink);
          background: linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.02));
          border: 1px solid var(--line);
          box-shadow: 0 12px 30px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.03);
          transition: transform 140ms ease, box-shadow 200ms ease, border-color 160ms ease;
        }
        .tile:hover {
          transform: translateY(-1px);
          border-color: rgba(124, 211, 255, 0.22);
          box-shadow: 0 18px 36px rgba(0,0,0,0.4), 0 0 0 1px rgba(124,211,255,0.12);
        }
        .tile strong { font-weight: 700; letter-spacing: 0.2px; }
        .tile span { color: var(--muted); font-size: 13px; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px) scale(0.995); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes cardGlow {
          0%, 100% { box-shadow: 0 20px 50px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.04); }
          50% { box-shadow: 0 24px 60px rgba(0,0,0,0.46), 0 0 0 1px rgba(124,211,255,0.10); }
        }
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(124,211,255,0.0), inset 0 -8px 24px rgba(124,211,255,0.08); }
          50% { box-shadow: 0 0 24px rgba(124,211,255,0.22), inset 0 -10px 30px rgba(124,211,255,0.14); }
        }
        @keyframes throb { 0%,100%{ transform:translateY(0) } 50%{ transform:translateY(-1px) } }
        @keyframes shimmer { 0%{ background-position:200% 0 } 100%{ background-position:-20% 0 } }

        @media (prefers-reduced-motion: reduce) {
          .card, .genBtn { animation: none !important; }
          .genBtn.isBusy::after { animation: none !important; }
          .prompt, .tile, .fileBtn, .genBtn { transition: none !important; }
        }
        @media (max-width: 720px) {
          .row { grid-template-columns: 1fr; }
          .genBtn { width: 100%; }
          .tiles { grid-template-columns: 1fr; }
        }
      `}</style>
    </main>
  );
}
