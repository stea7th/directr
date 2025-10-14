// src/app/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function AppPage() {
  const [prompt, setPrompt] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string>('');

  async function onGenerate() {
    setNote('');
    setBusy(true);
    try {
      // TODO: wire to your /api/generate later; keep UI resilient
      const form = new FormData();
      form.append('prompt', prompt);
      if (file) form.append('file', file);

      const res = await fetch('/api/generate', { method: 'POST', body: form });

      // Be defensive: only parse JSON if it’s JSON.
      const text = await res.text();
      let data: any = null;
      try { data = JSON.parse(text); } catch { /* not json, ignore */ }

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

  return (
    <main className="wrap">
      <section className="hero">
        <h1>Type what you want or upload a file</h1>

        <div className="card">
          <textarea
            placeholder="Example: 'Turn this podcast into 5 viral TikToks'"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <div className="row">
            <label className="file">
              <input
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
              <span>{file ? file.name : 'Choose File'}</span>
            </label>

            <button
              className="cta"
              onClick={onGenerate}
              disabled={busy || (!prompt && !file)}
            >
              {busy ? 'Working…' : 'Generate'}
            </button>
          </div>

          {note ? <div className="note">{note}</div> : null}
        </div>
      </section>

      <section className="grid">
        <Feature
          title="Create"
          desc="Upload → get captioned clips"
          href="/create"
        />
        <Feature
          title="Clipper"
          desc="Auto-find hooks & moments"
          href="/clipper"
        />
        <Feature
          title="Planner"
          desc="Plan posts & deadlines"
          href="/planner"
        />
      </section>

      <style jsx>{`
        :root {
          --bg: #0c0c0c;
          --panel: #121212;
          --muted: #a1a1aa;
          --text: #e5e7eb;
          --brand: #60a5fa;   /* blue from your buttons */
          --brand-700: #3b82f6;
          --ring: rgba(96,165,250,.35);
          --radius: 16px;
          --shadow: 0 8px 30px rgba(0,0,0,.35);
          --border: 1px solid rgba(255,255,255,.08);
        }

        .wrap {
          min-height: calc(100dvh - 140px);
          max-width: 980px;
          margin: 0 auto;
          padding: 48px 20px 72px;
          color: var(--text);
        }

        .hero h1 {
          font-size: 22px;
          font-weight: 600;
          letter-spacing: .2px;
          margin: 6px 0 18px;
        }

        .card {
          background: var(--panel);
          border: var(--border);
          border-radius: var(--radius);
          box-shadow: var(--shadow);
          padding: 18px;
        }

        textarea {
          width: 100%;
          min-height: 120px;
          resize: vertical;
          background: #0f0f10;
          color: var(--text);
          border: 1px solid rgba(255,255,255,.08);
          border-radius: 12px;
          padding: 14px 16px;
          line-height: 1.4;
          outline: none;
        }
        textarea::placeholder { color: #6b7280; }

        .row {
          display: flex;
          gap: 12px;
          align-items: center;
          margin-top: 12px;
          flex-wrap: wrap;
        }

        .file {
          position: relative;
          display: inline-flex;
          align-items: center;
          height: 40px;
          padding: 0 14px;
          border-radius: 10px;
          background: #0f0f10;
          border: 1px solid rgba(255,255,255,.08);
          color: var(--text);
          cursor: pointer;
          user-select: none;
        }
        .file input {
          position: absolute;
          inset: 0;
          opacity: 0;
          cursor: pointer;
        }

        .cta {
          height: 40px;
          padding: 0 18px;
          border-radius: 10px;
          border: none;
          background: var(--brand);
          color: #0b1020;
          font-weight: 700;
          letter-spacing: .2px;
          cursor: pointer;
          transition: transform .04s ease, box-shadow .2s ease, background .2s ease;
          box-shadow: 0 6px 18px rgba(59,130,246,.25);
        }
        .cta:hover { background: var(--brand-700); }
        .cta:disabled {
          opacity: .6;
          cursor: not-allowed;
          box-shadow: none;
        }

        .note {
          margin-top: 10px;
          font-size: 13px;
          color: var(--muted);
          border-top: 1px dashed rgba(255,255,255,.08);
          padding-top: 10px;
        }

        .grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 18px;
          margin-top: 22px;
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
    <Link href={href} className="feature">
      <div className="box">
        <div className="t">{title}</div>
        <div className="d">{desc}</div>
      </div>

      <style jsx>{`
        .feature { text-decoration: none; }
        .box {
          background: #121212;
          border: 1px solid rgba(255,255,255,.08);
          border-radius: 16px;
          padding: 18px 18px 16px;
          transition: transform .06s ease, border-color .2s ease, box-shadow .2s ease;
          box-shadow: 0 6px 24px rgba(0,0,0,.35);
        }
        .box:hover {
          transform: translateY(-1px);
          border-color: rgba(96,165,250,.35);
          box-shadow: 0 10px 28px rgba(0,0,0,.42), 0 0 0 1px var(--ring) inset;
        }
        .t { font-weight: 700; margin-bottom: 4px; color: #e6e9f2; }
        .d { color: #a1a1aa; font-size: 14px; }
      `}</style>
    </Link>
  );
}
