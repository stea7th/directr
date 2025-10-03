'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase'; // your existing client

export default function ResetPage() {
  const [email, setEmail] = useState('');
  const [stage, setStage] = useState<'ready' | 'saving' | 'sent' | 'error'>('ready');
  const [message, setMessage] = useState<string>('');

  async function sendReset() {
    if (!email) {
      setMessage('Enter your email first.');
      return;
    }
    setStage('saving');
    setMessage('');

    const redirectTo =
      typeof window !== 'undefined'
        ? `${window.location.origin}/reset/confirm`
        : 'https://directr-beta.vercel.app/reset/confirm';

    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });

    if (error) {
      setStage('error');
      setMessage(error.message);
    } else {
      setStage('sent');
      setMessage('Check your email for the reset link.');
    }
  }

  // ---- styles (plain CSS-in-JS) ----
  const wrap: React.CSSProperties = { maxWidth: 420, margin: '40px auto', color: '#e5e7eb', fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Arial' };
  const h1: React.CSSProperties = { fontSize: 24, fontWeight: 700, marginBottom: 16 };
  const label: React.CSSProperties = { display: 'block', fontSize: 13, marginBottom: 6, color: '#a3a3a3' };
  const input: React.CSSProperties = { width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid #262626', background: '#0a0a0a', color: '#e5e7eb' };
  const btn: React.CSSProperties = { width: '100%', marginTop: 12, padding: '10px 12px', borderRadius: 10, border: '1px solid #096aa6', background: '#0ea5e9', color: '#fff', fontWeight: 600, cursor: 'pointer', opacity: stage === 'saving' ? 0.7 : 1 };
  const note: React.CSSProperties = { marginTop: 12, fontSize: 13, color: stage === 'error' ? '#fca5a5' : '#a3e635' };

  return (
    <div style={wrap}>
      <div style={h1}>Reset your password</div>

      <label style={label} htmlFor="email">Email</label>
      <input
        id="email"
        type="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={input}
      />

      <button onClick={sendReset} disabled={stage === 'saving'} style={btn}>
        {stage === 'saving' ? 'Sending…' : 'Send reset link'}
      </button>

      {message ? <div style={note}>{message}</div> : null}
    </div>
  );
}
      {message ? <div style={note}>{message}</div> : null}
    </div>
  );
}
