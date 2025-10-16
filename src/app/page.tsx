'use client';

import React, { useCallback, useRef, useState } from 'react';
import Link from 'next/link';

export default function HomePage() {
  const [prompt, setPrompt] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle'|'working'|'success'|'error'>('idle');
  const [message, setMessage] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);

  const onChooseClick = useCallback(() => inputRef.current?.click(), []);

  const onDrop: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) setFile(f);
  };

  const onGenerate = async () => {
    if (!prompt && !file) {
      setStatus('error');
      setMessage('Type something or attach a file.');
      return;
    }

    setStatus('working');
    setMessage('');

    try {
      // If you later want to send the file, just add it to formData
      const body: any = { prompt };
      if (file) {
        body.fileName = file.name; // placeholder; API currently only expects prompt
      }

      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Request failed');
      }

      const data = await res.json().catch(() => ({} as any));
      const jobId = data?.jobId || data?.id || 'created';
      setStatus('success');
      setMessage(`Success — Job ID: ${jobId}`);
    } catch (err: any) {
      setStatus('error');
      setMessage(err?.message || 'Something went wrong');
    }
  };

  return (
    <div className="wrap">
      <header className="top">
        <div className="logoRow">
          <span className="logoDot" />
          <span className="brand">directr.</span>
        </div>
        <nav className="nav">
          <Link href="/create">Create</Link>
          <Link href="/campaigns">Campaigns</Link>
          <Link href="/analytics">Analytics</Link>
          <Link href="/planner" className="active">Planner</Link>
          <Link href="/settings">Settings</Link>
          <Link href="/signup">Create account</Link>
          <Link href="/signin">Sign in</Link>
        </nav>
      </header>

      <main className="container">
        <section className="card">
          <h1 className="title">Type what you want or upload a file</h1>

          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Example: Turn this podcast into 5 viral TikToks"
            className="inputArea"
          />

          <div className="row">
            <div
              className="choose"
              role="button"
              onClick={onChooseClick}
              onDragOver={(e) => e.preventDefault()}
              onDrop={onDrop}
              title="Drop a file or click to choose"
            >
              <span className="chooseIcon">⬇︎</span>
              <span>{file ? file.name : 'Choose File / Drop here'}</span>
              <input
                ref={inputRef}
                type="file"
                style={{ display: 'none' }}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) setFile(f);
                }}
              />
            </div>

            <button
              className={`genBtn ${status === 'working' ? 'working' : ''}`}
              onClick={onGenerate}
              disabled={status === 'working'}
            >
              {status === 'working' ? 'Working…' : 'Generate'}
            </button>
          </div>

          <p className="tip">
            Tip: Drop a video/audio, or just describe what you want. We’ll handle the rest.
          </p>

          {status !== 'idle' && (
            <div className={`alert ${status}`}>
              {message}
            </div>
          )}
        </section>

        <section className="grid">
          <Link href="/create" className="feature">
            <div className="featureTitle">Create</div>
            <div className="featureSub">Upload → get captioned clips</div>
          </Link>

          <Link href="/clipper" className="feature">
            <div className="featureTitle">Clipper</div>
            <div className="featureSub">Auto-find hooks & moments</div>
          </Link>

          <Link href="/planner" className="feature">
            <div className="featureTitle">Planner</div>
            <div className="featureSub">Plan posts & deadlines</div>
          </Link>
        </section>
      </main>

      <footer className="foot">
        <span>© 2025 directr</span>
        <span>—</span>
        <Link href="/privacy">Privacy</Link>
        <span>·</span>
        <Link href="/terms">Terms</Link>
      </footer>

      <style jsx>{`
        :global(html, body) { background:#0d121a; color:#e9eef6; }
        a { color:#a9c8ff; text-decoration:none; }
        a:hover { text-decoration:underline; }

        .wrap { min-height:100vh; display:flex; flex-direction:column; }
        .top { display:flex; align-items:center; justify-content:space-between; padding:20px 28px; }
        .logoRow { display:flex; align-items:center; gap:10px; }
        .logoDot { width:10px; height:10px; border-radius:50%; background:#4f8cff; box-shadow:0 0 14px rgba(79,140,255,.7); }
        .brand { font-weight:700; letter-spacing:.3px; color:#fff; }
        .nav { display:flex; gap:18px; opacity:.9; }
        .nav :global(a.active) { color:#fff; font-weight:600; }

        .container { width:100%; max-width:980px; margin:0 auto; padding:30px 20px 80px; flex:1; }

        .card {
          background:linear-gradient(180deg, rgba(255,255,255,.04), rgba(255,255,255,.02));
          border:1px solid rgba(255,255,255,.08);
          border-radius:28px;
          padding:28px;
          box-shadow:0 20px 60px rgba(0,0,0,.35);
        }

        .title { margin:0 0 16px; font-size:20px; font-weight:800; letter-spacing:.2px; color:#ffffffde; }

        .inputArea {
          width:100%;
          min-height:130px;
          background:#0f1520;
          color:#dfe7f5;
          border:1px solid #2a3550;
          outline:none;
          border-radius:12px;
          padding:16px;
          resize:vertical;
          box-shadow: inset 0 0 0 1px rgba(79,140,255,0);
        }
        .inputArea:focus {
          border-color:#3f6be0;
          box-shadow:0 0 0 3px rgba(63,107,224,.25), inset 0 0 0 1px rgba(79,140,255,.3);
        }

        .row { display:flex; gap:16px; align-items:center; margin-top:16px; }

        .choose {
          flex:1;
          background:rgba(255,255,255,.04);
          border:1px dashed rgba(255,255,255,.16);
          border-radius:999px;
          height:48px;
          display:flex; align-items:center; justify-content:center; gap:10px;
          cursor:pointer;
          transition:.2s ease;
        }
        .choose:hover { background:rgba(255,255,255,.06); }

        .chooseIcon { opacity:.7; }

        .genBtn {
          width:220px; height:48px; border:none; border-radius:999px;
          color:#fff; font-weight:700; letter-spacing:.3px;
          background:linear-gradient(90deg, #3756ff, #6c8bff);
          box-shadow:0 10px 22px rgba(76,114,255,.35), inset 0 -4px 10px rgba(0,0,0,.35);
          cursor:pointer; transition:transform .12s ease, filter .12s ease, opacity .12s ease;
        }
        .genBtn:hover { transform:translateY(-1px); filter:brightness(1.07); }
        .genBtn:disabled, .genBtn.working { opacity:.6; cursor:not-allowed; transform:none; }

        .tip { margin:14px 8px 0; opacity:.72; font-size:13px; }

        .alert {
          margin-top:14px;
          border-radius:10px;
          padding:10px 12px;
          font-size:14px;
          border:1px solid transparent;
        }
        .alert.success { background:rgba(42,191,99,.09); border-color:rgba(42,191,99,.35); color:#aef5c9; }
        .alert.error   { background:rgba(255,69,69,.08); border-color:rgba(255,69,69,.35); color:#ffc7c7; }

        .grid {
          display:grid; grid-template-columns:repeat(3, 1fr); gap:18px;
          margin:26px 0 0;
        }

        .feature {
          display:block;
          background:linear-gradient(180deg, rgba(255,255,255,.04), rgba(255,255,255,.02));
          border:1px solid rgba(255,255,255,.09);
          border-radius:18px;
          padding:18px 20px;
          box-shadow:0 12px 28px rgba(0,0,0,.28);
        }
        .feature:hover { text-decoration:none; border-color:rgba(255,255,255,.18); }
        .featureTitle { color:#fff; font-weight:800; margin-bottom:6px; }
        .featureSub { color:#a9c8ff; opacity:.9; }

        .foot {
          display:flex; gap:10px; align-items:center; justify-content:center;
          padding:26px; opacity:.75; font-size:14px;
          border-top:1px solid rgba(255,255,255,.06);
        }

        @media (max-width: 840px) {
          .row { flex-direction:column; }
          .genBtn, .choose { width:100%; }
          .grid { grid-template-columns:1fr; }
        }
      `}</style>
    </div>
  );
}
