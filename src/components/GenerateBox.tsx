'use client';

import { useState, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { auth: { persistSession: true, autoRefreshToken: true } }
);

export default function GenerateBox() {
  const [prompt, setPrompt] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const submit = async () => {
    try {
      setBusy(true);
      setMsg(null);

      const { data: sessionRes } = await supabase.auth.getSession();
      const token = sessionRes?.session?.access_token;

      const fd = new FormData();
      fd.set('prompt', prompt);
      const f = fileRef.current?.files?.[0];
      if (f) fd.set('file', f);

      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: fd
      });

      const json = await res.json();
      if (!res.ok || !json.ok) {
        setMsg(json.error || 'Something went wrong.');
        return;
      }

      // Success UX
      const details = [];
      if (json.uploadedPath) details.push(`file: ${json.uploadedPath}`);
      if (json.prompt) details.push(`prompt: "${json.prompt}"`);
      setMsg(`Queued ✔️ (${details.join(' · ')})`);
      setPrompt('');
      if (fileRef.current) fileRef.current.value = '';
    } catch (e: any) {
      setMsg(e?.message || 'Request failed.');
    } finally {
      setBusy(false);
    }
  };

  // Minimal inline styles to match your current look
  const wrap: React.CSSProperties = { margin: '0 auto', maxWidth: 900 };
  const box: React.CSSProperties = { background: '#0f1113', border: '1px solid #2a2f35', borderRadius: 12, padding: 20 };
  const ta: React.CSSProperties = { width: '100%', height: 120, background: '#0b0d0f', color: '#e5e7eb', border: '1px solid #2a2f35', borderRadius: 8, padding: 12 };
  const bar: React.CSSProperties = { display: 'flex', gap: 12, alignItems: 'center', marginTop: 12 };
  const btn: React.CSSProperties = { background: '#58a6ff', color: '#0b0d0f', borderRadius: 8, padding: '10px 16px', border: 'none', fontWeight: 600, cursor: busy ? 'not-allowed' : 'pointer', opacity: busy ? 0.7 : 1 };
  const note: React.CSSProperties = { marginTop: 12, color: '#9aa5b1' };

  return (
    <div style={wrap}>
      <div style={box}>
        <textarea
          style={ta}
          placeholder="Example: Turn this podcast into 5 viral TikToks"
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
        />
        <div style={bar}>
          <input ref={fileRef} type="file" />
          <button onClick={submit} disabled={busy} style={btn}>
            {busy ? 'Working…' : 'Generate'}
          </button>
        </div>
        {msg ? <div style={note}>{msg}</div> : null}
      </div>
    </div>
  );
}
