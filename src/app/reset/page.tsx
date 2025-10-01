'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function ResetRequestPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] =
    useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [message, setMessage] = useState<string>('');

  async function sendReset() {
    if (!email) return;

    try {
      setStatus('sending');
      setMessage('');

      // Where the email link should land:
      // we use the current site origin at runtime
      const redirectTo = `${window.location.origin}/reset/confirm`;

      await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: `${origin}/reset/confirm`,
});
      if (error) {
        setStatus('error');
        setMessage(error.message || 'Failed sending reset email.');
        return;
      }

      setStatus('sent');
      setMessage('Check your email for a password reset link.');
    } catch (e: any) {
      setStatus('error');
      setMessage(e?.message || 'Something went wrong.');
    }
  }

  const wrap: React.CSSProperties = {
    maxWidth: 440,
    margin: '40px auto',
    padding: 20,
    borderRadius: 12,
    border: '1px solid #e5e7eb',
  };

  const h1: React.CSSProperties = {
    fontSize: 20,
    fontWeight: 700,
    marginBottom: 10,
  };

  const label: React.CSSProperties = {
    display: 'block',
    fontSize: 13,
    color: '#555',
    marginBottom: 6,
  };

  const input: React.CSSProperties = {
    width: '100%',
    padding: '10px 12px',
    borderRadius: 10,
    border: '1px solid #ddd',
    outline: 'none',
    fontSize: 14,
  };

  const btn: React.CSSProperties = {
    width: '100%',
    padding: '10px 12px',
    marginTop: 12,
    borderRadius: 10,
    border: '1px solid #096aa6',
    background: '#0ea5e9',
    color: '#fff',
    fontWeight: 600 as const,
    cursor: status === 'sending' ? 'not-allowed' : 'pointer',
    opacity: status === 'sending' ? 0.7 : 1,
  };

  const note: React.CSSProperties = {
    marginTop: 10,
    fontSize: 12,
    color: status === 'error' ? '#b91c1c' : '#111827',
  };

  return (
    <div style={wrap}>
      <h1 style={h1}>Reset your password</h1>

      <label style={label} htmlFor="email">
        Email
      </label>
      <input
        id="email"
        type="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={input}
      />

      <button
        onClick={sendReset}
        disabled={status === 'sending'}
        style={btn}
      >
        {status === 'sending' ? 'Sending…' : 'Send reset link'}
      </button>

      {message ? <div style={note}>{message}</div> : null}
    </div>
  );
}
