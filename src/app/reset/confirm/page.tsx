'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
);

// Keep the phase simple, and use a separate boolean for "saving" to avoid TS narrowing issues
type Phase = 'exchanging' | 'need-password' | 'done' | 'error';

export default function ConfirmResetPage() {
  const sp = useSearchParams();
  const code = sp.get('code') || '';

  const [phase, setPhase] = useState<Phase>('exchanging');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');

  const passwordMismatch = useMemo(
    () => password.length > 0 && password2.length > 0 && password !== password2,
    [password, password2]
  );

  // 1) Exchange the code for a session so we can call updateUser()
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (!code) {
          setMessage('Missing code in the URL.');
          setPhase('error');
          return;
        }
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (cancelled) return;

        if (error) {
          setMessage(error.message);
          setPhase('error');
          return;
        }
        setPhase('need-password');
      } catch (e: any) {
        if (cancelled) return;
        setMessage(e?.message || 'Could not validate reset link.');
        setPhase('error');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [code]);

  // 2) Save new password
  const save = async () => {
    if (passwordMismatch || !password) return;
    setSaving(true);
    setMessage(null);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        setMessage(error.message);
        setPhase('error');
        setSaving(false);
        return;
      }
      setPhase('done');
    } catch (e: any) {
      setMessage(e?.message || 'Could not update password.');
      setPhase('error');
      setSaving(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
      <div
        style={{
          width: 360,
          padding: 20,
          borderRadius: 12,
          border: '1px solid #e5e7eb',
        }}
      >
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>
          Reset password
        </h1>

        {phase === 'exchanging' && (
          <p style={{ marginTop: 12, color: '#6b7280' }}>Verifying your link…</p>
        )}

        {phase === 'need-password' && (
          <>
            <p style={{ marginTop: 8, color: '#6b7280' }}>
              Enter a new password for your account.
            </p>

            <label style={{ display: 'block', marginTop: 16, fontSize: 12, color: '#6b7280' }}>
              New password
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  marginTop: 6,
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 10,
                  border: '1px solid #d1d5db',
                  outline: 'none',
                }}
                placeholder="••••••••"
              />
            </label>

            <label style={{ display: 'block', marginTop: 12, fontSize: 12, color: '#6b7280' }}>
              Confirm password
              <input
                type="password"
                value={password2}
                onChange={(e) => setPassword2(e.target.value)}
                style={{
                  marginTop: 6,
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 10,
                  border: '1px solid #d1d5db',
                  outline: 'none',
                }}
                placeholder="••••••••"
              />
            </label>

            {passwordMismatch && (
              <p style={{ marginTop: 8, color: '#dc2626', fontSize: 14 }}>
                Passwords don’t match.
              </p>
            )}

            <button
              onClick={save}
              disabled={saving || !password || passwordMismatch}
              style={{
                marginTop: 14,
                width: '100%',
                padding: '10px 12px',
                borderRadius: 10,
                border: '1px solid #096aa6',
                background: '#0ea5e9',
                color: '#fff',
                fontWeight: 600,
                cursor: saving ? 'not-allowed' : 'pointer',
                opacity: saving ? 0.7 : 1,
              }}
            >
              {saving ? 'Saving…' : 'Update password'}
            </button>
          </>
        )}

        {phase === 'done' && (
          <p style={{ marginTop: 12, color: '#059669' }}>
            Password updated! You can close this tab or return to the app.
          </p>
        )}

        {phase === 'error' && (
          <p style={{ marginTop: 12, color: '#dc2626' }}>
            {message || 'Something went wrong.'}
          </p>
        )}
      </div>
    </div>
  );
}
