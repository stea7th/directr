'use client';

import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
);

type Status = 'idle' | 'saving' | 'sent' | 'error';

export default function ResetPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [msg, setMsg] = useState('');

  async function sendLink() {
    if (status === 'saving') return;
    if (!email || !email.includes('@')) {
      setMsg('Enter a valid email.');
      setStatus('error');
      return;
    }
    setStatus('saving');
    setMsg('Sending reset email…');

    const redirectTo = `${window.location.origin}/reset/confirm`;
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });

    if (error) {
      setStatus('error');
      setMsg(error.message);
      return;
    }

    setStatus('sent');
    setMsg('Check your email for the reset link.');
  }

  return (
    <main style={{ minHeight: '70vh', display: 'grid', placeItems: 'center' }}>
      <div
        style={{
          background: '#161a20',
          border: '1px solid #252c36',
          padding: 20,
          borderRadius: 12,
          width: 420,
          maxWidth: '90%',
          color: '#e9eef3',
        }}
      >
        <h1 style={{ margin: 0, marginBottom: 8, fontSize: 22, fontWeight: 800 }}>Reset password</h1>

        <input
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            width: '100%',
            padding: '12px 14px',
            borderRadius: 10,
            border: '1px solid #2a3745',
            background: '#17202a',
            color: '#e9eef3',
          }}
        />

        <button
          type="button"
          onClick={sendLink}
          disabled={status === 'saving'}
          style={{
            width: '100%',
            marginTop: 12,
            padding: '12px 16px',
            borderRadius: 10,
            fontWeight: 700,
            border: '1px solid #2a3745',
            background: '#1e3a8a',
            color: '#e9eef3',
            opacity: status === 'saving' ? 0.7 : 1,
            cursor: status === 'saving' ? 'not-allowed' : 'pointer',
          }}
        >
          {status === 'saving' ? 'Sending…' : 'Send reset link'}
        </button>

        {msg && <p style={{ marginTop: 12, opacity: 0.9 }}>{msg}</p>}
      </div>
    </main>
  );
}
