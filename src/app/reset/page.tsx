'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ResetPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    setMessage('');

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset/confirm`,
    });

    if (error) {
      console.error(error);
      setStatus('error');
      setMessage(error.message || 'Something went wrong.');
    } else {
      setStatus('sent');
      setMessage('Check your email for a reset link.');
    }
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        background: 'transparent',
        color: '#e9eef3',
      }}
    >
      <div
        style={{
          width: '92%',
          maxWidth: 440,
          background: '#121214',
          border: '1px solid #1b1d21',
          borderRadius: 16,
          padding: '32px 28px',
          boxShadow: '0 20px 50px rgba(0,0,0,0.4)',
        }}
      >
        <h1
          style={{
            margin: '0 0 12px',
            fontSize: 22,
            fontWeight: 700,
            letterSpacing: 0.2,
          }}
        >
          Reset your password
        </h1>

        {status === 'sent' ? (
          <p style={{ color: '#9aa4af', margin: 0 }}>{message}</p>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <input
              type="email"
              value={email}
              placeholder="you@example.com"
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                height: 48,
                borderRadius: 999,
                padding: '0 16px',
                border: '1px solid #2a2d32',
                background: '#0f1113',
                color: '#e9eef3',
                outline: 'none',
                fontSize: 15,
              }}
            />

            <button
              type="submit"
              disabled={status === 'loading'}
              style={{
                height: 48,
                borderRadius: 999,
                border: '1px solid rgba(124,211,255,0.4)',
                background: 'linear-gradient(180deg, #1a2430, #161b22)',
                color: '#eaf6ff',
                fontWeight: 700,
                cursor: 'pointer',
                opacity: status === 'loading' ? 0.6 : 1,
                transition: 'opacity 0.2s ease',
              }}
            >
              {status === 'loading' ? 'Sending…' : 'Send reset link'}
            </button>
          </form>
        )}

        {status === 'error' && (
          <p style={{ color: '#ff7b7b', marginTop: 10 }}>{message}</p>
        )}

        {status === 'idle' && (
          <p style={{ color: '#9aa4af', fontSize: 13, marginTop: 10 }}>
            Enter your account email and we’ll send you a reset link.
          </p>
        )}
      </div>
    </main>
  );
}
