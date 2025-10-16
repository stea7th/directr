'use client';

import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
);

export default function ResetPage() {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string>('');

  async function send() {
    if (busy) return;
    if (!email.trim()) return setMsg('Enter your email.');

    setBusy(true);
    setMsg('');
    try {
      const redirectTo = `${window.location.origin}/reset/confirm`;
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo });
      if (error) throw error;
      setMsg('Check your email for the reset link.');
    } catch (e: any) {
      setMsg(e.message || 'Failed to send reset email.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main style={{ maxWidth: 520, margin: '80px auto', padding: 16 }}>
      <h1 style={{ marginBottom: 12 }}>Reset your password</h1>
      <p style={{ color: '#9aa4af', marginBottom: 16 }}>
        We’ll email you a secure link to choose a new password.
      </p>
      <input
        type="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{
          width: '100%', padding: '12px 14px', borderRadius: 10,
          border: '1px solid #1b1d21', background: '#0f1113', color: '#e9eef3'
        }}
      />
      <button
        type="button"
        onClick={send}
        disabled={busy || !email}
        style={{
          marginTop: 12, padding: '12px 16px', borderRadius: 10, fontWeight: 700,
          border: '1px solid #2a3745', background: '#17202a', color: '#e9eef3',
          opacity: busy ? 0.6 : 1
        }}
      >
        {busy ? 'Sending…' : 'Send reset link'}
      </button>
      {msg ? <div style={{ marginTop: 12, color: '#9aa4af' }}>{msg}</div> : null}
    </main>
  );
}
