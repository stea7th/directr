'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
);

type Stage = 'checking' | 'need-password' | 'saving' | 'done' | 'error';

export default function ConfirmResetPage() {
  const [stage, setStage] = useState<Stage>('checking');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<string>('');

  // 1) Convert the code in the URL into a session
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data, error } = await supabase.auth.exchangeCodeForSession();
        if (cancelled) return;

        if (error) {
          setStage('error');
          setMessage(error.message || 'Invalid or expired link.');
          return;
        }

        // Type should be "recovery" for password reset links
        if (data.session?.user) {
          setStage('need-password');
        } else {
          setStage('error');
          setMessage('Could not verify reset link.');
        }
      } catch (e: any) {
        if (!cancelled) {
          setStage('error');
          setMessage(e?.message || 'Something went wrong.');
        }
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // 2) Save new password
  const save = async () => {
    if (!password) return;
    setStage('saving');
    setMessage('');
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setStage('need-password');
      setMessage(error.message || 'Could not update password.');
      return;
    }
    setStage('done');
  };

  // --- Simple inline styles (no Tailwind) ---
  const wrap: React.CSSProperties = {
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
    opacity: stage === 'saving' ? 0.7 : 1,
  };
  const note: React.CSSProperties = {
    marginTop: 12,
    fontSize: 12,
    color: stage === 'error' ? '#f87171' : 'rgba(255,255,255,0.7)',
  };
  const link: React.CSSProperties = { marginTop: 12, fontSize: 12, color: '#0ea5e9', textDecoration: 'underline' };

  return (
    <div style={wrap}>
      <div style={card}>
        {stage === 'checking' && (
          <>
            <h1 style={h1}>Verifying link…</h1>
            <p style={p}>Please wait a moment.</p>
          </>
        )}

        {stage === 'need-password' && (
          <>
            <h1 style={h1}>Set a new password</h1>
            <p style={p}>Enter a new password for your account.</p>

            <label style={label} htmlFor="pw">New password</label>
            <input
              id="pw"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={input}
            />

            <button onClick={save} disabled={stage === 'saving'} style={button}>
              {stage === 'saving' ? 'Saving…' : 'Update password'}
            </button>

            {message ? <div style={note}>{message}</div> : null}
            <a href="/login" style={link}>Back to sign in</a>
          </>
        )}

        {stage === 'done' && (
          <>
            <h1 style={h1}>Password updated</h1>
            <p style={p}>You can now sign in with your new password.</p>
            <a href="/login" style={link}>Go to sign in</a>
          </>
        )}

        {stage === 'error' && (
          <>
            <h1 style={h1}>Link problem</h1>
            <p style={p}>{message || 'This reset link is invalid or expired.'}</p>
            <a href="/reset" style={link}>Request a new reset link</a>
          </>
        )}
      </div>
    </div>
  );
}
