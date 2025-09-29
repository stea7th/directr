// src/app/forgot-password/page.tsx
'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
);

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr(null);

    try {
      const url =
        typeof window !== 'undefined'
          ? `${window.location.origin}/reset-password`
          : '/reset-password';

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: url,
      });
      if (error) throw error;
      setSent(true);
    } catch (e: any) {
      setErr(e?.message || 'Could not send reset email');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-wrap">
      <section className="card auth-card">
        <h1 className="h1">Reset your password</h1>
        <p className="muted">Enter your account email and we’ll send a reset link.</p>

        {sent ? (
          <div className="notice ok">Check your email for a password reset link.</div>
        ) : (
          <form className="form" onSubmit={onSubmit}>
            <label className="ctl">
              <span className="label">Email</span>
              <input
                type="email"
                required
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </label>

            {err && <div className="notice err">{err}</div>}

            <div className="actions">
              <button className="btn btn-primary" disabled={loading}>
                {loading ? 'Sending…' : 'Send reset link'}
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}
