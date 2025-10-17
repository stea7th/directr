'use client';

import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);

// Explicit union fixes TS comparisons in JSX.
type Status = 'idle' | 'sending' | 'sent' | 'error';

export default function ResetPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [msg, setMsg] = useState<string>('');

  async function sendReset() {
    if (!email.trim()) {
      setMsg('Enter your email.');
      return;
    }

    setStatus('sending');
    setMsg('Sending reset email…');

    // Build redirect URL to your confirm page
    const origin =
      typeof window !== 'undefined'
        ? window.location.origin
        : process.env.NEXT_PUBLIC_SITE_URL || '';

    const redirectTo = `${origin}/reset/confirm`;

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo,
    });

    if (error) {
      setStatus('error');
      setMsg(error.message);
      return;
    }

    setStatus('sent');
    setMsg('Check your inbox for the reset link.');
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
        <h1 style={{ margin: 0, marginBottom: 8, fontSize: 22, fontWeight: 800 }}>
          Reset your password
        </h1>

        <p style={{ marginTop: 4, marginBottom: 12, opacity: 0.9 }}>
          We’ll email you a link to set a new password.
        </p>

        <input
          type="email"
          placeholder="you@example.com"
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
          onClick={sendReset}
          disabled={status === 'sending' || !email.trim()}
          style={{
            width: '100%',
            marginTop: 12,
            padding: '12px 16px',
            borderRadius: 10,
            fontWeight: 700,
            border: '1px solid #2a3745',
            background: '#1e3a8a',
            color: '#e9eef3',
            opacity: status === 'sending' || !email.trim() ? 0.7 : 1,
            cursor: status === 'sending' || !email.trim() ? 'not-allowed' : 'pointer',
          }}
        >
          {status === 'sending' ? 'Sending…' : 'Send reset link'}
        </button>

        {msg && <p style={{ marginTop: 12, opacity: 0.9 }}>{msg}</p>}

        {status === 'sent' && (
          <p style={{ marginTop: 10 }}>
            Didn’t get it? Check spam, or try again after a minute.
          </p>
        )}
      </div>
    </main>
  );
}
