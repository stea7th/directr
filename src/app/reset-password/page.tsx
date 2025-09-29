// src/app/reset-password/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
);

export default function ResetPasswordPage() {
  const [ready, setReady] = useState(false);
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [loading, setLoading] = useState(false);

  // 1) Exchange token from the email link for a session
  useEffect(() => {
    async function run() {
      try {
        if (typeof window === 'undefined') return;
        const hash = window.location.hash;
        if (hash.includes('access_token')) {
          const { error } = await supabase.auth.exchangeCodeForSession(hash);
          if (error) throw error;
        }
      } catch (e: any) {
        setErr(e?.message || 'Invalid or expired link.');
      } finally {
        setReady(true);
      }
    }
    run();
  }, []);

  // 2) Update password
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);

    if (pw.length < 8) {
      setErr('Password must be at least 8 characters.');
      return;
    }
    if (pw !== pw2) {
      setErr('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: pw });
      if (error) throw error;
      setOk(true);
    } catch (e: any) {
      setErr(e?.message || 'Could not update password.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-wrap">
      <section className="card auth-card">
        <h1 className="h1">Set a new password</h1>

        {!ready ? (
          <div className="notice">Checking your reset link…</div>
        ) : ok ? (
          <div className="notice ok">Password updated. You can now sign in.</div>
        ) : (
          <form className="form" onSubmit={onSubmit}>
            <label className="ctl">
              <span className="label">New password</span>
              <input
                type="password"
                className="input"
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                placeholder="••••••••"
                required
              />
            </label>

            <label className="ctl">
              <span className="label">Confirm password</span>
              <input
                type="password"
                className="input"
                value={pw2}
                onChange={(e) => setPw2(e.target.value)}
                placeholder="••••••••"
                required
              />
            </label>

            {err && <div className="notice err">{err}</div>}

            <div className="actions">
              <button className="btn btn-primary" disabled={loading}>
                {loading ? 'Saving…' : 'Save new password'}
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}
