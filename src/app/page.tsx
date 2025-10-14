'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function AppHome() {
  const [prompt, setPrompt] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const canSubmit = !!prompt.trim() || !!file;

  async function onGenerate() {
    if (!canSubmit || busy) return;
    setBusy(true);
    try {
      // Hook your /api/generate call here
      alert('Generate triggered');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="page">
      <div className="glass">
        <h1>Type what you want or upload a file</h1>

        <textarea
          className="prompt"
          placeholder="Example: Turn this podcast into 5 viral TikToks"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />

        <div className="actions">
          <label className="upload">
            <input
              type="file"
              hidden
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            {file ? file.name : 'Choose File / Drop here'}
          </label>

          <button
            className={`generate ${!canSubmit ? 'disabled' : ''}`}
            disabled={!canSubmit}
            onClick={onGenerate}
          >
            {busy ? 'Generating…' : 'Generate'}
          </button>
        </div>

        <p className="tip">
          Tip: Drop a video/audio, or describe what you want. We’ll handle the rest.
        </p>
      </div>

      <div className="links">
        <Feature title="Create" desc="Upload → get captioned clips" href="/create" />
        <Feature title="Clipper" desc="Auto-find hooks & moments" href="/clipper" />
        <Feature title="Planner" desc="Plan posts & deadlines" href="/planner" />
      </div>

      <style jsx>{`
        :root {
          --blue: #3b82f6;
          --blue-glow: rgba(59, 130, 246, 0.4);
          --bg: #0b0c0f;
          --glass: rgba(255, 255, 255, 0.03);
          --border: rgba(255, 255, 255, 0.08);
          --ink: #f1f5f9;
          --muted: #a1a1aa;
        }

        .page {
          min-height: 100vh;
          padding: 80px 24px 100px;
          background: var(--bg);
          color: var(--ink);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 40px;
        }

        .glass {
          width: 100%;
          max-width: 800px;
          background: var(--glass);
          border: 1px solid var(--border);
          border-radius: 36px;
          padding: 32px 28px;
          backdrop-filter: blur(16px);
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.45);
        }

        h1 {
          font-size: 22px;
          font-weight: 700;
          text-align: center;
          margin-bottom: 20px;
        }

        .prompt {
          width: 100%;
          min-height: 140px;
          border: none;
          border-radius: 28px;
          padding: 18px 20px;
          background: rgba(255, 255, 255, 0.04);
          color: var(--ink);
          resize: none;
          font-size: 15px;
          outline: none;
          transition: box-shadow 0.2s ease, background 0.2s ease;
        }

        .prompt:focus {
          background: rgba(255, 255, 255, 0.07);
          box-shadow: 0 0 0 3px var(--blue-glow);
        }

        .actions {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-top: 18px;
          flex-wrap: wrap;
          justify-content: center;
        }

        .upload {
          flex: 1;
          max-width: 380px;
          height: 52px;
          border-radius: 28px;
          border: 1px dashed var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 15px;
          color: var(--muted);
          background: rgba(255, 255, 255, 0.03);
          transition: all 0.2s ease;
        }

        .upload:hover {
          border-color: var(--blue);
          color: var(--ink);
          background: rgba(255, 255, 255, 0.06);
        }

        .generate {
          height: 52px;
          width: 180px;
          border: none;
          border-radius: 28px;
          background: linear-gradient(135deg, var(--blue), #60a5fa);
          color: white;
          font-weight: 700;
          cursor: pointer;
          transition: transform 0.1s ease, box-shadow 0.2s ease, filter 0.2s ease;
          box-shadow: 0 8px 25px var(--blue-glow);
        }

        .generate:hover {
          filter: brightness(1.08);
          box-shadow: 0 10px 30px rgba(59, 130, 246, 0.55);
        }

        .generate:active {
          transform: scale(0.98);
        }

        .generate.disabled {
          opacity: 0.5;
          cursor: not-allowed;
          box-shadow: none;
          background: rgba(255, 255, 255, 0.08);
        }

        .tip {
          text-align: center;
          margin-top: 12px;
          font-size: 13px;
          color: var(--muted);
        }

        .links {
          display: flex;
          flex-wrap: wrap;
          gap: 18px;
          justify-content: center;
          margin-top: 10px;
        }

        @media (max-width: 700px) {
          .glass {
            padding: 24px 20px;
            border-radius: 28px;
          }
          .prompt {
            border-radius: 22px;
          }
          .generate {
            width: 100%;
          }
        }
      `}</style>
    </main>
  );
}

function Feature({
  title,
  desc,
  href,
}: {
  title: string;
  desc: string;
  href: string;
}) {
  return (
    <Link href={href} className="feature">
      <div className="featureCard">
        <h3>{title}</h3>
        <p>{desc}</p>
      </div>

      <style jsx>{`
        .feature {
          text-decoration: none;
        }

        .featureCard {
          width: 220px;
          border-radius: 28px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.07);
          padding: 18px 20px;
          color: white;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.35);
          transition: transform 0.2s ease, border-color 0.2s ease;
          text-align: center;
        }

        .featureCard:hover {
          border-color: rgba(96, 165, 250, 0.4);
          transform: translateY(-3px);
        }

        h3 {
          font-weight: 700;
          margin: 0 0 6px;
        }

        p {
          margin: 0;
          font-size: 13px;
          color: #a1a1aa;
        }
      `}</style>
    </Link>
  );
}
