'use client';

import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Page() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState('');

  const handleGenerate = async () => {
    setResponse('');
    setLoading(true);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      alert('You must sign in first.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Generation failed');
      setResponse(`✅ Success — Job ID: ${data.id}`);
    } catch (e: any) {
      setResponse(`❌ ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={main}>
      <header style={header}>
        <img src="/logo.svg" alt="Directr" style={logo} />
        <a href="/account" style={link}>Account</a>
      </header>

      <div style={card}>
        <h1 style={title}>Directr</h1>
        <p style={sub}>Type what you want and hit Generate.</p>

        <textarea
          placeholder="e.g. create 10 short hooks from my new video"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={6}
          style={input}
        />

        <button onClick={handleGenerate} disabled={loading} style={button(loading)}>
          {loading ? 'Generating…' : 'Generate'}
        </button>

        {response && <p style={note}>{response}</p>}
      </div>
    </main>
  );
}

/* ---------- styles ---------- */
const main: React.CSSProperties = {
  minHeight: '100vh',
  background: '#0a0f1c',
  color: '#e7ecf8',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
};

const header: React.CSSProperties = {
  width: '100%',
  maxWidth: 960,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '18px 22px',
  boxSizing: 'border-box',
};

const logo: React.CSSProperties = { height: 26 };
const link: React.CSSProperties = { color: '#94aaff', fontWeight: 600, textDecoration: 'none' };

const card: React.CSSProperties = {
  width: '100%',
  maxWidth: 960,
  marginTop: 40,
  padding: 28,
  borderRadius: 16,
  background: 'linear-gradient(180deg,#111a2f,#0b1224)',
  border: '1px solid #1d2a4c',
  boxShadow: '0 8px 32px rgba(0,0,0,0.45)',
  boxSizing: 'border-box',
};

const title: React.CSSProperties = { fontSize: 28, marginBottom: 6 };
const sub: React.CSSProperties = { opacity: 0.75, marginBottom: 20 };

const input: React.CSSProperties = {
  width: '100%',
  border: '1px solid #28365e',
  borderRadius: 10,
  background: '#0b1020',
  color: '#fff',
  padding: '12px 14px',
  fontSize: 15,
  outline: 'none',
  resize: 'vertical',
  marginBottom: 20,
};

const button = (loading: boolean): React.CSSProperties => ({
  width: '100%',
  padding: '12px',
  borderRadius: 12,
  border: 'none',
  cursor: loading ? 'default' : 'pointer',
  fontWeight: 700,
  color: '#fff',
  background: loading
    ? 'rgba(80,120,255,0.4)'
    : 'linear-gradient(180deg,#3f62ff,#2249f7)',
});

const note: React.CSSProperties = {
  marginTop: 18,
  padding: '10px 12px',
  borderRadius: 10,
  background: '#0e1424',
  border: '1px solid #25345d',
  color: '#b6c5ff',
  fontSize: 14,
};
