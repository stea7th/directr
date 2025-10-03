'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
);

export default function ResetPage() {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function sendReset() {
    setBusy(true);
    setMsg(null);
    setErr(null);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset/confirm`,
    });
    if (error) setErr(error.message);
    else setMsg('Check your email for the reset link.');
    setBusy(false);
  }

  const wrap: React.CSSProperties = { maxWidth: 420, margin: '60px auto', padding: 20 };
  const label: React.CSSProperties = { display: 'block', marginBottom: 8, fontWeight: 600 };
  const input: React.CSSProperties = {
    width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #333',
    background: '#111', color: '#fff', marginBottom: 12,
  };
  const button = (disabled = false): React.CSSProperties => ({
    width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #096aa6',
    background: '#0ea5e9', color: '#fff', fontWeight: 600, opacity: disabled ? 0.7 : 1,
    cursor: disabled ? 'not-allowed' : 'pointer',
  });
  const note: React.CSSProperties = { marginTop: 12, color: '#9ca3af' };
  const errorStyle: React.CSSProperties = { marginTop: 12, color: '#f87171' };

  return (
    <div style={wrap}>
      <h1 style={{ fontSize: 26, marginBottom: 14 }}>Reset password</h1>

      <label style={label} htmlFor="email">Email</label>
      <input
        id="email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        style={input}
      />

      <button onClick={sendReset} disabled={busy || !email} style={button(busy || !email)}>
        {busy ? 'Sending…' : 'Send reset link'}
      </button>

      {msg && <div style={note}>{msg}</div>}
      {err && <div style={errorStyle}>{err}</div>}
    </div>
  );
}
