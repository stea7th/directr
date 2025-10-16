'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

// Force client render (no prerender)
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
);

function parseHash(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const h = window.location.hash.startsWith('#') ? window.location.hash.slice(1) : '';
  const params = new URLSearchParams(h);
  const out: Record<string, string> = {};
  params.forEach((v, k) => (out[k] = v));
  return out;
}

export default function ConfirmResetPage() {
  const [status, setStatus] = useState<'init' | 'ready' | 'saving' | 'error'>('init');
  const [msg, setMsg] = useState<string>('');
  const [pw1, setPw1] = useState('');
  const [pw2, setPw2] = useState('');

  // 1) On mount, read tokens from hash and create a session.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const { access_token, refresh_token, type } = parseHash();

        if (!access_token || !refresh_token || type !== 'recovery') {
          setStatus('error');
          setMsg('Invalid or expired reset link. Request a new one.');
          return;
        }

        // Create a session so updateUser() is allowed
        const { data, error } = await supabase.auth.setSession({
          access_token,
          refresh_token,
        });
        if (cancelled) return;

        if (error || !data?.session) {
          setStatus('error');
          setMsg(error?.message || 'Could not create session from reset link.');
          return;
        }

        setStatus('ready');
      } catch (e: any) {
        if (!cancelled) {
          setStatus('error');
          setMsg(e.message || 'Something went wrong.');
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // 2) Save new password
  async function save() {
    if (status !== 'ready') return;
    if (!pw1 || pw1.length < 8) return setMsg('Password must be at least 8 characters.');
    if (pw1 !== pw2) return setMsg('Passwords do not match.');
    setMsg('');
    setStatus('saving');
    try {
      const { error } = await supabase.auth.updateUser({ password: pw1 });
      if (error) throw error;
      setMsg('Password updated! You can close this tab and sign in.');
      // Optional: redirect after 1.5s
      setTimeout(() => { window.location.href = '/login'; }, 1500);
    } catch (e: any) {
      setStatus('ready');
      setMsg(e.message || 'Failed to update password.');
    }
  }

  return (
    <main style={{ maxWidth: 520, margin: '80px auto', padding: 16 }}>
      <h1 style={{ marginBottom: 12 }}>Choose a new password</h1>

      {status === 'init' && (
        <p style={{ color: '#9aa4af' }}>Verifying your reset link…</p>
      )}

      {status === 'error' && (
        <p style={{ color: '#ff9aa2' }}>{msg || 'There was a problem with your link.'}</p>
      )}

      {status === 'ready' && (
        <>
          <label style={{ display: 'block', margin: '12px 0 6px' }}>New password</label>
          <input
            type="password"
            value={pw1}
            onChange={(e) => setPw1(e.target.value)}
            style={{
              width: '100%', padding: '12px 14px', borderRadius: 10,
              border: '1px solid #1b1d21', background: '#0f1113', color: '#e9eef3'
            }}
          />
          <label style={{ display: 'block', margin: '12px 0 6px' }}>Confirm password</label>
          <input
            type="password"
            value={pw2}
            onChange={(e) => setPw2(e.target.value)}
            style={{
              width: '100%', padding: '12px 14px', borderRadius: 10,
              border: '1px solid #1b1d21', background: '#0f1113', color: '#e9eef3'
            }}
          />
          <button
            type="button"
            onClick={save}
            disabled={status === 'saving'}
            style={{
              marginTop: 12, padding: '12px 16px', borderRadius: 10, fontWeight: 700,
              border: '1px solid #2a3745', background: '#17202a', color: '#e9eef3',
              opacity: status === 'saving' ? 0.6 : 1
            }}
          >
            {status === 'saving' ? 'Saving…' : 'Update password'}
          </button>
          {msg ? <div style={{ marginTop: 12, color: '#9aa4af' }}>{msg}</div> : null}
        </>
      )}
    </main>
  );
}
