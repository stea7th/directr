'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

// ----- If you already have a client (e.g. '@/lib/supabaseClient'), replace this block with your import.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);
// ----- end temp client

type Phase = 'checking' | 'need-password' | 'done' | 'error';

export default function ConfirmResetPage() {
  const router = useRouter();
  const qs = useSearchParams();

  const [phase, setPhase] = useState<Phase>('checking');
  const [msg, setMsg] = useState<string>('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');

  // Pull tokens from BOTH query and hash so any Supabase template works.
  const parsed = useMemo(() => {
    // 1) Query params (e.g. /reset/confirm?token=...&type=recovery)
    const queryToken = qs.get('token') || qs.get('access_token') || '';
    const queryType = (qs.get('type') || '').toLowerCase();

    // 2) Hash params (e.g. /reset/confirm#access_token=...&type=recovery&refresh_token=...)
    const hash = typeof window !== 'undefined' ? window.location.hash : '';
    const hashParams = new URLSearchParams(hash.startsWith('#') ? hash.slice(1) : hash);
    const hashAccess = hashParams.get('access_token') || '';
    const hashRefresh = hashParams.get('refresh_token') || '';
    const hashType = (hashParams.get('type') || '').toLowerCase();

    return {
      // prefer hash if present (that’s what Supabase uses by default for magic links)
      access_token: hashAccess || queryToken,
      refresh_token: hashRefresh || '',
      type: (hashType || queryType) as 'recovery' | 'signup' | 'magiclink' | string,
      hasHashTokens: !!hashAccess,
      rawHash: hash,
    };
  }, [qs]);

  useEffect(() => {
    (async () => {
      try {
        // No token? Bail early with message.
        if (!parsed.access_token && !parsed.refresh_token) {
          setPhase('error');
          setMsg('Missing code in URL.');
          return;
        }

        // If hash had tokens, create a session so we can call updateUser.
        if (parsed.access_token && parsed.refresh_token) {
          const { data, error } = await supabase.auth.setSession({
            access_token: parsed.access_token,
            refresh_token: parsed.refresh_token,
          });
          if (error) throw error;
        }

        // What flow is this?
        if (parsed.type === 'recovery') {
          // Ask for the new password.
          setPhase('need-password');
          setMsg('');
          return;
        }

        // For signup / magiclink: session is already set; just confirm and bounce home.
        setPhase('done');
        setMsg('Email confirmed. Redirecting…');
        setTimeout(() => router.replace('/'), 900);
      } catch (err: any) {
        setPhase('error');
        setMsg(err?.message || 'Could not complete the request.');
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parsed.access_token, parsed.refresh_token, parsed.type]);

  async function savePassword() {
    if (phase !== 'need-password') return;
    if (!password || password.length < 8) {
      setMsg('Password must be at least 8 characters.');
      return;
    }
    if (password !== password2) {
      setMsg('Passwords do not match.');
      return;
    }
    try {
      setMsg('Saving new password…');
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setPhase('done');
      setMsg('Password updated. Redirecting…');
      setTimeout(() => router.replace('/'), 900);
    } catch (err: any) {
      setPhase('error');
      setMsg(err?.message || 'Failed to update password.');
    }
  }

  return (
    <main style={wrap}>
      <section style={card}>
        <h1 style={title}>Reset your password</h1>

        {phase === 'checking' && <p style={note}>Checking your link…</p>}

        {phase === 'need-password' && (
          <div style={{ display: 'grid', gap: 10 }}>
            <label style={label}>New password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={input}
            />
            <label style={label}>Confirm new password</label>
            <input
              type="password"
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
              style={input}
            />
            <button onClick={savePassword} style={button}>
              Save password
            </button>
          </div>
        )}

        {phase === 'done' && <p style={good}>{msg || 'Done.'}</p>}
        {phase === 'error' && <p style={bad}>{msg || 'Something went wrong.'}</p>}
      </section>
    </main>
  );
}

// ---- inline styles (kept tiny & consistent with your dark UI)
const wrap: React.CSSProperties = {
  minHeight: '70vh',
  display: 'grid',
  placeItems: 'center',
  padding: '40px 16px',
};
const card: React.CSSProperties = {
  width: '100%',
  maxWidth: 520,
  borderRadius: 16,
  border: '1px solid #1b1d21',
  background: '#121214',
  padding: 20,
  boxShadow: '0 10px 30px rgba(0,0,0,.35)',
  color: '#e9eef3',
};
const title: React.CSSProperties = { margin: '0 0 12px', fontSize: 22 };
const note: React.CSSProperties = { color: '#9aa4af' };
const label: React.CSSProperties = { color: '#cdd6df', fontSize: 14 };
const input: React.CSSProperties = {
  height: 40,
  borderRadius: 10,
  border: '1px solid #2a2d33',
  background: '#0f1113',
  color: '#e9eef3',
  padding: '0 12px',
  outline: 'none',
};
const button: React.CSSProperties = {
  height: 42,
  borderRadius: 999,
  border: '1px solid rgba(124,211,255,.5)',
  background: 'linear-gradient(180deg,#1a2430,#161b22)',
  color: '#eaf6ff',
  fontWeight: 700,
  cursor: 'pointer',
};
const good: React.CSSProperties = { color: '#67e8f9' };
const bad: React.CSSProperties = { color: '#ff7b7b' };
