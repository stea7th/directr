// src/app/page.tsx
'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';

export default function AppPage() {
  const [prompt, setPrompt] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string>('');
  const fileInput = useRef<HTMLInputElement>(null);

  function pickFile() {
    fileInput.current?.click();
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) setFile(f);
  }

  async function onGenerate() {
    setNote('');
    setBusy(true);
    try {
      const form = new FormData();
      form.append('prompt', prompt);
      if (file) form.append('file', file);

      const res = await fetch('/api/generate', { method: 'POST', body: form });
      const text = await res.text();
      let data: any = null;
      try { data = JSON.parse(text); } catch {}
      if (!res.ok) {
        setNote(data?.error || text || 'Something went wrong.');
        return;
      }
      setNote(data?.message || 'Request received. Check your jobs shortly.');
    } catch (e: any) {
      setNote(e?.message || 'Network error.');
    } finally {
      setBusy(false);
    }
  }

  const canGenerate = !busy && (prompt.trim().length > 0 || file);

  return (
    <main className="wrap">
      <section className="hero">
        <h1>Type what you want or upload a file</h1>

        <div
          className="card"
          onDragOver={(e) => e.preventDefault()}
          onDrop={onDrop}
        >
          <div className="editor">
            <textarea
              placeholder="Example: Turn this podcast into 5 viral TikToks"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <div className="actions">
              <button className="pick" onClick={pickFile}>
                <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
                  <path fill="currentColor" d="M19 15v4H5v-4H3v4a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-4zM13 5.41V16h-2V5.41l-3.3 3.3L6 7l6-6l6 6l-1.7 1.71z"/>
                </svg>
                {file ? file.name : 'Choose File / Drop here'}
                <input
                  ref={fileInput}
                  type="file"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
              </button>

              <button
                className="cta"
                onClick={onGenerate}
                disabled={!canGenerate}
                aria-disabled={!canGenerate}
                title={!canGenerate ? 'Type a prompt or attach a file' : 'Generate'}
              >
                {busy ? 'Generating…' : 'Generate'}
              </button>
            </div>

            {note ? <div className="note">{note}</div> : null}
          </div>

          <div className="hint">
            Tip: Drop a video/audio, or describe what you want. We’ll handle the rest.
          </div>

          <div className="ring" aria-hidden />
        </div>
      </section>

      <section className="grid">
        <Feature title="Create"  desc="Upload → get captioned clips" href="/create" />
        <Feature title="Clipper" desc="Auto-find hooks & moments"    href="/clipper" />
        <Feature title="Planner" desc="Plan posts & deadlines"       href="/planner" />
      </section>

      <style jsx>{`
        :root {
          --bg: #0b0b0c;
          --panel: #121214;
          --panel-2: #0f0f11;
          --muted: #9aa0a6;
          --text: #e8ebf0;
          --brand: #60a5fa;         /* Blue button like your existing site */
          --brand-700: #3b82f6;
          --ring: rgba(96,165,250,.35);
          --radius: 18px;
          --shadow: 0 12px 40px rgba(0,0,0,.45);
          --border: 1px solid rgba(255,255,255,.08);
        }

        .wrap {
          max-width: 1100px;
          margin: 0 auto;
          padding: 48px 20px 80px;
          color: var(--text);
        }

        .hero h1 {
          font-size: 22px;
          font-weight: 650;
          letter-spacing: .2px;
          margin: 8px 0 16px;
        }

        .card {
          position: relative;
          background: linear-gradient(180deg, var(--panel), var(--panel-2));
          border: var(--border);
          border-radius: var(--radius);
          box-shadow: var(--shadow);
          padding: 18px;
          overflow: hidden;
        }

        .ring {
          position: absolute;
          inset: -1px;
          border-radius: calc(var(--radius) + 1px);
          pointer-events: none;
          background:
            radial-gradient(1200px 220px at 20% -10%, rgba(96,165,250,.15), transparent 60%),
            radial-gradient(1200px 220px at 90% -10%, rgba(96,165,250,.10), transparent 60%);
          mix-blend-mode: screen;
        }

        .editor {
          position: relative;
          z-index: 2;
          background: #0e0f12;
          border: 1px solid rgba(255,255,255,.07);
          border-radius: 14px;
          padding: 14px;
        }

        textarea {
          width: 100%;
          min-height: 140px;
          resize: vertical;
          background: #0d0e11;
          color: var(--text);
          border: 1px solid rgba(255,255,255,.08);
          border-radius: 12px;
          padding: 14px 16px;
          line-height: 1.45;
          outline: none;
          transition: border-color .15s ease, box-shadow .15s ease;
        }
        textarea:focus {
          border-color: var(--brand);
          box-shadow: 0 0 0 3px var(--ring);
        }
        textarea::placeholder { color: #727a86; }

        .actions {
          display: grid;
          grid-template-columns: 1fr 170px;
          gap: 12px;
          margin-top: 12px;
        }
        @media (max-width: 720px) {
          .actions { grid-template-columns: 1fr; }
        }

        .pick {
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          height: 48px;
          padding: 0 16px;
          border-radius: 12px;
          border: 1px dashed rgba(255,255,255,.14);
          background: #0c0d10;
          color: var(--text);
          cursor: pointer;
          text-align: left;
          overflow: hidden;
          transition: border-color .2s ease, background .2s ease;
        }
        .pick:hover { border-color: var(--brand); background: #0d1016; }
        .pick input {
          position: absolute;
          inset: 0;
          opacity: 0;
          cursor: pointer;
        }

        .cta {
          height: 48px;
          border: none;
          border-radius: 12px;
          background: linear-gradient(180deg, var(--brand), var(--brand-700));
          color: #0a1222;
          font-weight: 800;
          letter-spacing: .25px;
          box-shadow: 0 12px 24px rgba(59,130,246,.28);
          cursor: pointer;
          transition: transform .05s ease, filter .2s ease, box-shadow .2s ease;
        }
        .cta:hover { filter: brightness(1.05); }
        .cta:active { transform: translateY(1px); }
        .cta[aria-disabled="true"] {
          opacity: .5;
          pointer-events: none;
          box-shadow: none;
        }

        .hint {
          margin-top: 10px;
          font-size: 13px;
          color: var(--muted);
          padding-left: 2px;
        }

        .note {
          margin-top: 12px;
          font-size: 13px;
          color: var(--muted);
          border-top: 1px dashed rgba(255,255,255,.08);
          padding-top: 10px;
        }

        .grid {
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
    <Link href={href} className="feature" draggable={false}>
      <div className="box">
        <div className="t">{title}</div>
        <div className="d">{desc}</div>
      </div>

      <style jsx>{`
        .feature { text-decoration: none; }
        .box {
          background: #121214;
          border: 1px solid rgba(255,255,255,.08);
          border-radius: 16px;
          padding: 18px;
          box-shadow: 0 10px 28px rgba(0,0,0,.42);
          transition: transform .08s ease, border-color .2s ease, box-shadow .2s ease;
        }
        .box:hover {
          transform: translateY(-2px);
          border-color: rgba(96,165,250,.35);
          box-shadow: 0 16px 34px rgba(0,0,0,.5), 0 0 0 1px rgba(96,165,250,.22) inset;
        }
        .t { font-weight: 800; margin-bottom: 4px; color: #e9edf7; }
        .d { color: #a0a6b3; font-size: 14px; }
      `}</style>
    </Link>
  );
}
