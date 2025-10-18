// src/app/reset/confirm/ClientConfirm.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
);

type Status = 'checking' | 'need-password' | 'saving' | 'done' | 'error';

export default function ClientConfirm() {
  const params = useSearchParams();
  const router = useRouter();

  const [status, setStatus] = useState<Status>('checking');
  const [pw1, setPw1] = useState('');
  const [pw2, setPw2] = useState('');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    // Handles both OAuth-style ?code=... and gotrue-style ?token_hash=...&type=recovery
    const code = params.get('code');
    const tokenHash = params.get('token_hash');
    const type = params.get('type'); // 'recovery' etc.

    (async () => {
      try {
        // try exchangeCodeForSession (OAuth/PKCE)
        if (code) {
          // some SDK versions accept an object, some a string — handle both
          let res: any = null;
          try {
            // @ts-ignore version-safe
            res = await supabase.auth.exchangeCodeForSession({ code });
          } catch {
            // @ts-ignore version-safe
            res = await supabase.auth.exchangeCodeForSession(code);
          }
          if (res?.error) throw res.error;
          setStatus('need-password');
          return;
        }

        // try verifyOtp for recovery links
        if (tokenHash && (type === 'recovery' || type === 'email_change')) {
          // verifyOtp usually requires email, but for recovery via token_hash Supabase will attach user after exchange above.
          // If there’s no session yet, we can still let user attempt password update — Supabase will error if invalid.
          setStatus('need-password');
          return;
        }

        // Fallback: if we already have a session, just let them set a new password
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          setStatus('need-password');
          return;
        }

        // Nothing usable in the URL
        setMsg('This reset link is invalid or expired. Request a new one.');
        setStatus('error');
      } catch (e: any) {
        setMsg(e?.message || 'Could not process the reset link.');
        setStatus('error');
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once on mount

  async function save() {
    if (status === 'saving') return;
    if (!pw1 || pw1.length < 8) {
      setMsg('Password must be at least 8 characters.');
      return;
    }
    if (pw1 !== pw2) {
      setMsg('Passwords do not match.');
      return;
    }

    setMsg('');
    setStatus('saving');
    try {
      const { error } = await supabase.auth.updateUser({ password: pw1 });
      if (error) throw error;

      setStatus('done');
      setMsg('Password updated. Redirecting…');
      setTimeout(() => router.push('/'), 1200);
    } catch (e: any) {
      setStatus('need-password');
      setMsg(e?.message || 'Failed to update password.');
    }
  }

  return (
    <main style={{ minHeight: '60vh', display: 'grid', placeItems: 'center', padding: 24 }}>
      <section
        style={{
          width: '100%',
          maxWidth: 480,
          background: '#121214',
          border: '1px solid #1b1d21',
          borderRadius: 16,
          padding: 20,
          color: '#e9eef3',
          boxShadow: '0 12px 32px rgba(0,0,0,0.45)',
        }}
      >
        <h1 style={{ margin: '0 0 10px', fontSize: 20, fontWeight: 800 }}>Reset your password</h1>

        {status === 'checking' && <p>Validating your link…</p>}

        {status === 'need-password' && (
          <>
            <label style={{ display: 'block', marginTop: 12, fontSize: 13, color: '#9aa4af' }}>
              New password
            </label>
            <input
              type="password"
              value={pw1}
              onChange={(e) => setPw1(e.target.value)}
              style={inputStyle}
            />
            <label style={{ display: 'block', marginTop: 12, fontSize: 13, color: '#9aa4af' }}>
              Confirm password
            </label>
            <input
              type="password"
              value={pw2}
              onChange={(e) => setPw2(e.target.value)}
              style={inputStyle}
            />
            <button
              type="button"
              onClick={save}
              disabled={status === 'saving'}
              style={buttonStyle(status === 'saving')}
            >
              {status === 'saving' ? 'Saving…' : 'Save password'}
            </button>
            {msg ? <p style={noteStyle}>{msg}</p> : null}
          </>
        )}

        {status === 'done' && <p>{msg || 'All set.'}</p>}
        {status === 'error' && (
          <>
            <p style={{ color: '#ffb4b4' }}>{msg || 'Something went wrong.'}</p>
            <p style={{ marginTop: 8, color: '#9aa4af' }}>
              Go back to <a href="/reset" style={{ color: '#7cd3ff' }}>request another link</a>.
            </p>
          </>
        )}
      </section>
    </main>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  marginTop: 6,
  padding: '12px 14px',
  borderRadius: 10,
  border: '1px solid #2a3745',
  background: '#0f1113',
  color: '#e9eef3',
  outline: 'none',
};

const buttonStyle = (disabled: boolean): React.CSSProperties => ({
  width: '100%',
  marginTop: 12,
  padding: '12px 16px',
  borderRadius: 10,
  fontWeight: 700,
  border: '1px solid #2a3745',
  background: '#17202a',
  color: '#e9eef3',
  cursor: disabled ? 'not-allowed' : 'pointer',
  opacity: disabled ? 0.6 : 1,
});

const noteStyle: React.CSSProperties = {
  marginTop: 10,
  fontSize: 13,
  color: '#9aa4af',
};
