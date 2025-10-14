// src/app/page.tsx
'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';

export default function AppPage() {
  const [prompt, setPrompt] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState('');
  const fileInput = useRef<HTMLInputElement>(null);

  const canGenerate = !busy && (prompt.trim().length > 0 || file);

  function pickFile() {
    fileInput.current?.click();
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) setFile(f);
  }

  async function onGenerate() {
    if (!canGenerate) return;
    setBusy(true);
    setNote('');
    try {
      const form = new FormData();
      form.append('prompt', prompt);
      if (file) form.append('file', file);
      const res = await fetch('/api/generate', { method: 'POST', body: form });
      const text = await res.text();
      let data: any = null;
      try { data = JSON.parse(text); } catch {}
      if (!res.ok) return setNote(data?.error || text || 'Something went wrong.');
      setNote(data?.message || 'Request received. Check your jobs shortly.');
    } catch (e: any) {
      setNote(e?.message || 'Network error.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="wrap" onDragOver={(e)=>e.preventDefault()} onDrop={onDrop}>
      <div className="bg-grid" aria-hidden />

      <section className="card">
        <h1>Type what you want or upload a file</h1>

        <div className="editor">
          <textarea
            placeholder="Example: Turn this podcast into 5 viral TikToks"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />

          <div className="controls">
            <button className="file" onClick={pickFile}>
              <span className="icon">⌁</span>
              <span className="fileLabel">
                {file ? file.name : 'Choose File / Drop here'}
              </span>
              <input
                ref={fileInput}
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </button>

            <button
              className="cta"
              disabled={!canGenerate}
              aria-disabled={!canGenerate}
              onClick={onGenerate}
            >
              {busy ? 'Generating…' : 'Generate'}
            </button>
          </div>

          {note ? <div className="note">{note}</div> : null}
        </div>

        <p className="hint">
          Tip: Drop a video or audio, or just describe what you want. We’ll handle the rest.
        </p>
      </section>

      <section className="grid">
        <Feature title="Create"  desc="Upload → get captioned clips" href="/create" />
        <Feature title="Clipper" desc="Auto-find hooks & moments"    href="/clipper" />
        <Feature title="Planner" desc="Plan posts & deadlines"       href="/planner" />
      </section>

      <style jsx>{`
        /* Brand knobs */
        :root {
          --bg: #08090c;
          --grid: rgba(255,255,255,.04);
          --text: #eaf0ff;
          --muted: #a3acc2;
          --panel: rgba(16,18,24,.72);
          --panel-border: 1px solid rgba(255,255,255,.10);
          --panel-blur: blur(8px);
          --brand-1: #6aa9ff;
          --brand-2: #3859ff;
          --brand-3: #00e4ff;
          --cta-shadow: 0 12px 36px rgba(56, 89, 255, .35);
          --radius-lg: 18px;
          --radius-sm: 12px;
        }

        .wrap {
          position: relative;
          max-width: 1100px;
          margin: 0 auto;
          padding: 48px 20px 80px;
          color: var(--text);
          min-height: 65vh;
        }

        /* Animated faint grid background */
        .bg-grid {
          position: absolute;
          inset: -200px 0 0 0;
          background:
            linear-gradient(var(--grid) 1px, transparent 1px) 0 0 / 32px 32px,
            linear-gradient(90deg, var(--grid) 1px, transparent 1px) 0 0 / 32px 32px;
          mask: radial-gradient(1000px 500px at 50% -10%, #000 55%, transparent 70%);
          animation: float 16s linear infinite;
          pointer-events: none;
          z-index: 0;
        }
        @keyframes float {
          from { transform: translateY(0); }
          to   { transform: translateY(32px); }
        }

        .card {
          position: relative;
          z-index: 1;
          background: var(--panel);
          border: var(--panel-border);
          border-radius: var(--radius-lg);
          backdrop-filter: var(--panel-blur);
          padding: 20px;
          box-shadow: 0 20px 60px rgba(0,0,0,.45);
        }

        h1 {
          margin: 6px 6px 14px;
          font-size: 22px;
          letter-spacing: .2px;
          font-weight: 700;
        }

        .editor {
          border: 1px solid rgba(255,255,255,.08);
          border-radius: var(--radius-lg);
          padding: 14px;
          background: rgba(10,12,16,.6);
        }

        textarea {
          width: 100%;
          min-height: 150px;
          resize: vertical;
          color: var(--text);
          background: #0c0f14;
          border: 1px solid rgba(255,255,255,.10);
          border-radius: var(--radius-sm);
          padding: 14px 16px;
          line-height: 1.45;
          outline: none;
          transition: box-shadow .18s ease, border-color .18s ease;
        }
        textarea::placeholder { color: #77819b; }
        textarea:focus {
          border-color: #2a6dff;
          box-shadow: 0 0 0 3px rgba(42,109,255,.28);
        }

        .controls {
          display: grid;
          grid-template-columns: 1fr 200px;
          gap: 12px;
          margin-top: 12px;
        }
        @media (max-width: 720px) {
          .controls { grid-template-columns: 1fr; }
        }

        .file {
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          height: 50px;
          border-radius: var(--radius-sm);
          background: #0b0e13;
          border: 1px dashed rgba(255,255,255,.18);
          color: var(--text);
          padding: 0 16px;
          text-align: left;
          cursor: pointer;
          transition: border-color .2s ease, background .2s ease, transform .06s ease;
        }
        .file:hover { border-color: #3b60ff; background: #0d1119; }
        .file:active { transform: translateY(1px); }
        .file input { position: absolute; inset: 0; opacity: 0; cursor: pointer; }
        .icon {
          width: 22px; height: 22px;
          display: grid; place-items: center;
          color: #9bb3ff;
          filter: drop-shadow(0 0 6px rgba(155,179,255,.34));
        }
        .fileLabel { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

        .cta {
          height: 50px;
          border: none;
          border-radius: var(--radius-sm);
          background:
            radial-gradient(120% 120% at 80% -20%, rgba(0,228,255,.55), transparent 40%),
            linear-gradient(180deg, var(--brand-1), var(--brand-2));
          color: #ffffff;                    /* ← WHITE TEXT (was dark before) */
          font-weight: 800;
          letter-spacing: .3px;
          box-shadow: var(--cta-shadow);
          cursor: pointer;
          transition: transform .08s ease, filter .2s ease, box-shadow .2s ease;
        }
        .cta:hover { filter: brightness(1.07); box-shadow: 0 16px 44px rgba(56, 89, 255, .42); }
        .cta:active { transform: translateY(1px); }
        .cta[aria-disabled="true"] {
          opacity: .55; pointer-events: none; box-shadow: none;
        }

        .note {
          margin-top: 12px;
          font-size: 13px;
          color: var(--muted);
          border-top: 1px dashed rgba(255,255,255,.10);
          padding-top: 10px;
        }

        .hint {
          margin: 10px 6px 4px;
          color: var(--muted);
          font-size: 13px;
        }

        .grid {
          z-index: 1;
          position: relative;
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 18px;
          margin-top: 26px;
        }
        @media (max-width: 900px) {
          .grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </main>
  );
}

function Feature({ title, desc, href }: { title: string; desc: string; href: string }) {
  return (
    <Link className="feature" href={href} draggable={false}>
      <div className="box">
        <div className="t">{title}</div>
        <div className="d">{desc}</div>
      </div>
      <style jsx>{`
        .feature { text-decoration: none; }
        .box {
          background: linear-gradient(180deg, rgba(18,19,26,.92), rgba(14,16,22,.92));
          border: 1px solid rgba(255,255,255,.10);
          border-radius: 16px;
          padding: 18px;
          box-shadow: 0 14px 32px rgba(0,0,0,.48);
          transition: transform .08s ease, border-color .2s ease, box-shadow .2s ease, background .2s ease;
        }
        .box:hover {
          transform: translateY(-2px);
          border-color: rgba(108,150,255,.45);
          box-shadow: 0 18px 40px rgba(0,0,0,.58), 0 0 0 1px rgba(108,150,255,.22) inset;
          background: linear-gradient(180deg, rgba(20,24,34,.95), rgba(15,18,28,.95));
        }
        .t { font-weight: 800; margin-bottom: 4px; color: #f1f5ff; }
        .d { color: #a4adc4; font-size: 14px; }
      `}</style>
    </Link>
  );
}
