'use client';

import { useMemo, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Stage = 'idle' | 'sending' | 'sent' | 'need' | 'saving' | 'done' | 'error';

export default function ResetPage() {
  const [email, setEmail] = useState('');
  const [stage, setStage] = useState<Stage>('idle');
  const [msg, setMsg] = useState('');

  const siteUrl = useMemo(
    () => process.env.NEXT_PUBLIC_SITE_URL ?? '',
    []
  );

  async function sendReset() {
    if (!email) {
      setMsg('Enter your email.');
      return;
    }
    setStage('sending');
    setMsg('');
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${siteUrl}/reset/confirm`,
    });
    if (error) {
      setStage('error');
      setMsg(error.message);
      return;
    }
    setStage('sent');
    setMsg('Check your email for a reset link.');
  }

  // --- Simple styles (no Tailwind) ---
  const card: React.CSSProperties = {
    width: 420,
    maxWidth: '92vw',
    background: '#141414',
    border: '1px solid #222',
    borderRadius: 12,
    padding: 18,
  };

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#0b0b0b', color: '#fff' }}>
      <div style={card}>
        <h2 style={{ margin: '0 0 10px' }}>Forgot your password?</h2>
        <p style={{ marginTop: 0, opacity: 0.8, fontSize: 14 }}>
          Enter your email and we’ll send a password reset link.
        </p>

        {/* Email input */}
        <label style={{ display: 'block', fontSize: 12, opacity: 0.7, marginTop: 10 }}>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@email.com"
          style={{
            width: '100%',
            marginTop: 6,
            marginBottom: 12,
            padding: '10px 12px',
            borderRadius: 10,
            border: '1px solid #2a2a2a',
            background: '#0e0e0e',
            color: '#fff',
          }}
        />

        {/* NOTE: compute isSending outside any 'stage === ...' branch,
            then use it inside – avoids the literal-type comparison error */}
        {/** This is the key to fixing your TS error */}
        {/** If we computed stage === 'sending' or 'saving' inside a narrowed block,
             TS would complain. */}

        <button
          onClick={sendReset}
          disabled={stage === 'sending'}
          style={{
            width: '100%',
            padding: '10px 12px',
            borderRadius: 10,
            border: '1px solid #096aa6',
            background: '#0ea5e9',
            color: '#fff',
            fontWeight: 600,
            opacity: stage === 'sending' ? 0.7 : 1,
            cursor: 'pointer',
          }}
        >
          {stage === 'sending' ? 'Sending…' : 'Send reset link'}
        </button>

        <p style={{ marginTop: 10, fontSize: 12, opacity: 0.8 }}>
          We’ll send you to <code>/reset/confirm</code> after you click the email link.
        </p>

        {msg && (
          <p style={{ marginTop: 10, fontSize: 13, color: stage === 'error' ? '#f87171' : '#9bd5ff' }}>
            {msg}
          </p>
        )}
      </div>
    </div>
  );
}
