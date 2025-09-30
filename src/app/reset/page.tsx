'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
);

type Stage = 'idle' | 'sending' | 'sent' | 'error';

export default function ResetPage() {
  const [email, setEmail] = useState('');
  const [stage, setStage] = useState<Stage>('idle');
  const [message, setMessage] = useState<string>('');

  const sendReset = async () => {
    if (!email) return;
    setStage('sending');
    setMessage('');

    const base = (process.env.NEXT_PUBLIC_SITE_URL || '').replace(/\/$/, '');
    const redirectTo = `${base}/reset/confirm`;

    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });

    if (error) {
      setStage('error');
      setMessage(error.message || 'Something went wrong.');
      return;
    }

    setStage('sent');
    setMessage('Check your email for a password reset link.');
  };

  const container: React.CSSProperties = {
    minHeight: '100vh',
    background: '#0a0a0a',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  };

  const card: React.CSSProperties = {
    width: '100%',
    maxWidth: 420,
    background: 'rgba(20,20,20,0.9)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 16,
    padding: 20,
  };

  const h1: React.CSSProperties = { margin: 0, fontSize: 18, fontWeight: 600 };
  const p: React.CSSProperties = { marginTop: 6, fontSize: 13, color: 'rgba(255,255,255,0.6)' };
  const label: React.CSSProperties = { display: 'block', fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 16, marginBottom: 6 };
  const input: React.CSSProperties = {
    width: '100%',
    background: 'rgba(30,30,30,0.9)',
    border: '1px solid rgba(255,255,255,0.08)',
    color: '#fff',
    borderRadius: 10,
    padding: '10px 12px',
    outline: 'none',
  };
  const button: React.CSSProperties = {
    width: '100%',
    padding: '10px 12px',
    borderRadius: 10,
    border: '1px solid #096aa6',
    background: '#0ea5e9',
    color: '#fff',
    fontWeight: 600,
    marginTop: 16,
    cursor: 'pointer',
    opacity: stage === 'sending' ? 0.7 : 1,
  };
  const note: React.CSSProperties = {
    marginTop: 12,
    fontSize: 12,
    color: stage === 'error' ? '#f87171' : 'rgba(255,255,255,0.7)',
  };
  const link: React.CSSProperties = { marginTop: 12, fontSize: 12, color: '#0ea5e9', textDecoration: 'underline' };

  return (
    <div style={container}>
      <div style={card}>
        <h1 style={h1}>Reset your password</h1>
        <p style={p}>Enter your account email. We’ll send you a link to set a new password.</p>

        <label style={label} htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={input}
        />

        <button onClick={sendReset} disabled={stage === 'sending'} style={button}>
          {stage === 'sending' ? 'Sending…' : 'Send reset link'}
        </button>

        {message ? <div style={note}>{message}</div> : null}
        <a href="/login" style={link}>Back to sign in</a>
      </div>
    </div>
  );
}
