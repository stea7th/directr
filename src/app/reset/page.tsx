'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ResetNewPage() {
  type State = 'checking' | 'ready' | 'missing' | 'saving' | 'done' | 'error';
  const [state, setState] = useState<State>('checking');
  const [err, setErr] = useState('');
  const [pw1, setPw1] = useState('');
  const [pw2, setPw2] = useState('');

  // Restore session from tokens saved by /reset/confirm
  useEffect(() => {
    (async () => {
      try {
        const at = localStorage.getItem('supabase_recovery_access_token');
        const rt = localStorage.getItem('supabase_recovery_refresh_token') || '';

        if (at) {
          await supabase.auth.setSession({ access_token: at, refresh_token: rt });
          localStorage.removeItem('supabase_recovery_access_token');
          localStorage.removeItem('supabase_recovery_refresh_token');
        }

        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;

        setState(data.session ? 'ready' : 'missing');
      } catch (e: any) {
        setErr(e?.message || 'Could not initialize reset session.');
        setState('error');
      }
    })();
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (state !== 'ready') return;

    if (!pw1 || pw1.length < 8) {
      setErr('Password must be at least 8 characters.');
      return;
    }
    if (pw1 !== pw2) {
      setErr('Passwords do not match.');
      return;
    }

    try {
      setState('saving');
      setErr('');
      const { error } = await supabase.auth.updateUser({ password: pw1 });
      if (error) throw error;
      setState('done');

      // send to sign in
      setTimeout(() => {
        window.location.href = '/signin';
      }, 1000);
    } catch (e: any) {
      setErr(e?.message || 'Failed to update password.');
      setState('ready');
    }
  }

  const Card: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div style={{
      maxWidth: 520, width: '92%', background: '#121214', border: '1px solid #1b1d21',
      borderRadius: 16, padding: 20
    }}>
      {children}
    </div>
  );

  return (
    <main style={{ minHeight: '70vh', display: 'grid', placeItems: 'center', color: '#e9eef3' }}>
      <Card>
        <h1 style={{ margin: '0 0 10px', fontSize: 22, fontWeight: 700 }}>Reset your password</h1>

        {state === 'checking' && <p style={{ color: '#9aa4af' }}>Preparing your reset session…</p>}

        {state === 'missing' && (
          <>
            <p style={{ color: '#9aa4af' }}>
              We couldn’t find an active recovery session. Please open the password reset link from your email again.
              If it expired, request a new one.
            </p>
            <p style={{ marginTop: 12 }}>
              <a href="/signin" style={{ color: '#7cd3ff', textDecoration: 'none' }}>Back to sign in</a>
            </p>
          </>
        )}

        {(state === 'ready' || state === 'saving' || state === 'error') && (
          <form onSubmit={onSubmit}>
            <label style={{ display: 'block', marginBottom: 8 }}>
              <span style={{ display: 'block', marginBottom: 6, color: '#cfd6dd' }}>New password</span>
              <input
                type="password"
                value={pw1}
                onChange={(e) => setPw1(e.target.value)}
                autoComplete="new-password"
                style={{
                  width: '100%', height: 44, borderRadius: 10, border: '1px solid #1b1d21',
                  background: '#0f1113', color: '#e9eef3', padding: '0 12px'
                }}
              />
            </label>

            <label style={{ display: 'block', marginBottom: 12 }}>
              <span style={{ display: 'block', marginBottom: 6, color: '#cfd6dd' }}>Confirm password</span>
              <input
                type="password"
                value={pw2}
                onChange={(e) => setPw2(e.target.value)}
                autoComplete="new-password"
                style={{
                  width: '100%', height: 44, borderRadius: 10, border: '1px solid #1b1d21',
                  background: '#0f1113', color: '#e9eef3', padding: '0 12px'
                }}
              />
            </label>

            {err && <p style={{ color: '#ff9ea3', margin: '6px 0 12px' }}>{err}</p>}

            <button
              type="submit"
              disabled={state === 'saving'}
              style={{
                width: '100%', height: 46, borderRadius: 999,
                border: '1px solid rgba(124,211,255,0.5)',
                background: 'linear-gradient(180deg, #1a2430, #161b22)',
                color: '#eaf6ff', fontWeight: 700, letterSpacing: 0.2,
                cursor: state === 'saving' ? 'default' : 'pointer'
              }}
            >
              {state === 'saving' ? 'Saving…' : 'Update password'}
            </button>
          </form>
        )}

        {state === 'done' && (
          <p style={{ color: '#9ae6b4' }}>Password updated. Redirecting to sign in…</p>
        )}
      </Card>
    </main>
  );
}
