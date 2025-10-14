'use client';

import { useState } from 'react';

export default function AppPage() {
  const [prompt, setPrompt] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  async function generate() {
    setBusy(true);
    try {
      alert('Generate clicked. (This is your main AI action placeholder)');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main
      style={{
        maxWidth: 960,
        margin: '0 auto',
        padding: '60px 20px',
        color: '#fff',
      }}
    >
      <h1 style={{ fontWeight: 600, fontSize: 22, marginBottom: 20 }}>
        Type what you want or upload a file
      </h1>

      <div
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 14,
          padding: 20,
          marginBottom: 40,
        }}
      >
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Example: 'Turn this podcast into 5 viral TikToks'"
          style={{
            width: '100%',
            height: 120,
            borderRadius: 10,
            border: '1px solid rgba(255,255,255,0.1)',
            background: 'rgba(0,0,0,0.3)',
            color: '#fff',
            padding: 10,
            outline: 'none',
            marginBottom: 12,
          }}
        />

        <input
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          style={{
            display: 'block',
            color: '#ccc',
            marginBottom: 12,
          }}
        />

        <button
          onClick={generate}
          disabled={busy}
          style={{
            width: '100%',
            background: '#0ea5e9',
            color: '#fff',
            fontWeight: 600,
            border: 'none',
            borderRadius: 10,
            padding: '10px 0',
            cursor: busy ? 'not-allowed' : 'pointer',
            opacity: busy ? 0.6 : 1,
          }}
        >
          {busy ? 'Working…' : 'Generate'}
        </button>
      </div>

      {/* Quick navigation */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 20,
        }}
      >
        <Card
          title="Create"
          desc="Upload → get captioned clips"
          link="/create"
        />
        <Card
          title="Clipper"
          desc="Auto-find hooks & moments"
          link="/clipper"
        />
        <Card
          title="Planner"
          desc="Plan posts & deadlines"
          link="/planner"
        />
      </div>
    </main>
  );
}

function Card({ title, desc, link }: { title: string; desc: string; link: string }) {
  return (
    <a
      href={link}
      style={{
        textDecoration: 'none',
        color: '#fff',
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 14,
        padding: 20,
        display: 'block',
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: 6 }}>{title}</div>
      <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>{desc}</div>
    </a>
  );
}
