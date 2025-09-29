'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
);

// Where Supabase should send the user to set a new password.
// This must be allowed in Supabase Auth → URL Configuration → Redirect URLs.
const REDIRECT_TO =
  process.env.NEXT_PUBLIC_SITE_URL
    ? `${process.env.NEXT_PUBLIC_SITE_URL}/reset/confirm`
    : (typeof window !== 'undefined'
        ? `${window.location.origin}/reset/confirm`
        : 'http://localhost:3000/reset/confirm');

type Stage = 'idle' | 'sending' | 'sent' | 'error';

export default function ResetPage() {
  const [email, setEmail] = useState('');
  const [stage, setStage] = useState<Stage>('idle');
  const [message, setMessage] = useState<string>('');

  const send = async () => {
    if (!email) {
      setMessage('Enter your email.');
      setStage('error');
      return;
    }
    setStage('sending');
    setMessage('');
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: REDIRECT_TO,
    });
    if (error) {
      setStage('error');
      setMessage(error.message || 'Could not send reset email.');
    } else {
      setStage('sent');
      setMessage(' Check your inbox for a reset link.');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff' }}>
      <div style={{ maxWidth: 420, margin: '0 auto', padding: '48px 16px' }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Reset your password</h1>
        <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 14, marginBottom: 24 }}>
          Enter the email for your account and we’ll send a reset link.
        </p>

        <label style={{ display: 'block', fontSize: 13, marginBottom: 6, color: 'rgba(255,255,255,0.8)' }}>
          Email
        </label>
        <input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            width: '100%',
            padding: '10px 12px',
            borderRadius: 10,
            border: '1px solid rgba(255,255,255,0.12)',
            background: '#121212',
            color: '#fff',
            outline: 'none',
            marginBottom: 12,
          }}
        />

        <button
          onClick={send}
          disabled={stage === 'sending'}
          style={{
            width: '100%',
            padding: '10px 12px',
            borderRadius: 10,
            border: '1px solid transparent',
            background: stage === 'sending' ? '#0891b2' : '#0ea5e9',
            color: '#fff',
            fontWeight: 600,
            cursor: stage === 'sending' ? 'not-allowed' : 'pointer',
          }}
        >
          {stage === 'sending' ? 'Sending…' : 'Send reset link'}
        </button>

        {message && (
          <div
            style={{
              marginTop: 12,
              fontSize: 13,
              color: stage === 'error' ? '#fda4af' : '#a7f3d0',
              lineHeight: 1.4,
            }}
          >
            {message}
          </div>
        )}

        <div style={{ marginTop: 16, fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>
          We’ll send the link to: {email || '—'}
        </div>
      </div>
    </div>
  );
}
