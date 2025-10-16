'use client';

import React, { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function ResetPage() {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string>('');

  async function sendPasswordReset(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) {
      setMsg('Enter your email.');
      return;
    }
    setBusy(true);
    setMsg('');
    try {
      const supabase = createClient();
      const redirectTo = `${window.location.origin}/reset/confirm`; // <-- important
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo });
      if (error) throw error;
      setMsg('Check your email for the password reset link.');
    } catch (err: any) {
      setMsg(err?.message || 'Could not send reset email.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main style={{ maxWidth: 460, margin: '48px auto', padding: 16 }}>
      <h1 style={{ marginBottom: 12 }}>Reset your password</h1>
      <form onSubmit={sendPasswordReset} style={{ display: 'grid', gap: 12 }}>
        <input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            padding: '10px 12px',
            borderRadius: 10,
            border: '1px solid #222',
            background: '#0f1113',
            color: 'white',
          }}
        />
        <button
          type="submit"
          disabled={busy}
          style={{
            padding: '10px 12px',
            borderRadius: 10,
            border: '1px solid #2a6',
            background: busy ? '#234' : '#1f2937',
            color: '#e0f2fe',
            fontWeight: 700,
            cursor: busy ? 'not-allowed' : 'pointer',
          }}
        >
          {busy ? 'Sending…' : 'Send reset link'}
        </button>
      </form>
      {msg ? <p style={{ marginTop: 10, color: '#9aa4af' }}>{msg}</p> : null}
    </main>
  );
}
