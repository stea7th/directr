'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export default function ResetNewPage() {
  // --- lightweight browser client (uses your public env vars)
  const supabase = useMemo<SupabaseClient>(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    return createClient(url, anon, { auth: { persistSession: true, autoRefreshToken: true } });
  }, []);

  const [status, setStatus] = useState<'checking' | 'ready' | 'missing' | 'done'>('checking');
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  // Make sure the recovery session exists (Supabase creates it from the email link)
  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) setStatus('ready');
      else setStatus('missing');
    })();
  }, [supabase]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy || status !== 'ready') return;

    setErr(null);
    setOk(null);

    // very light validation
    if (!pw || pw.length < 8) {
      setErr('Password must be at least 8 characters.');
      return;
    }
    if (pw !== pw2) {
      setErr('Passwords do not match.');
      return;
    }

    setBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: pw });
      if (error) throw error;

      setOk('Password updated! You can now sign in with your new password.');
      setStatus('done');

      // Optional: sign the user out of the temporary recovery session,
      // then send to sign-in.
      setTimeout(async () => {
        await supabase.auth.signOut();
        window.location.href = '/signin';
      }, 1200);
    } catch (e: any) {
      setErr(e?.message || 'Failed to update password.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main style={styles.wrap}>
      <section style={styles.card} aria-label="Reset password">
        <h1 style={styles.h1}>Reset your password</h1>

        {status === 'checking' && (
          <p style={styles.muted}>Checking your reset link…</p>
        )}

        {status === 'missing' && (
          <>
            <p style={styles.muted}>
              We couldn’t find an active recovery session. Please open the password reset link from
              your email again. If it expired, request a new one.
            </p>
            <div style={{ height: 8 }} />
            <a href="/signin" style={styles.link}>Back to sign in</a>
          </>
        )}

        {status === 'ready' && (
          <form onSubmit={onSubmit} style={styles.form}>
            <label style={styles.label}>
              New password
              <input
                type="password"
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                placeholder="At least 8 characters"
                style={styles.input}
              />
            </label>

            <label style={styles.label}>
              Confirm password
              <input
                type="password"
                value={pw2}
                onChange={(e) => setPw2(e.target.value)}
                style={styles.input}
              />
            </label>

            {err && <p style={styles.err}>{err}</p>}
            {ok && <p style={styles.ok}>{ok}</p>}

            <button
              type="submit"
              disabled={busy}
              style={{
                ...styles.button,
                ...(busy ? styles.buttonDisabled : {}),
              }}
            >
              {busy ? 'Updating…' : 'Update password'}
            </button>
          </form>
        )}

        {status === 'done' && (
          <p style={styles.ok}>Password updated — redirecting…</p>
        )}
      </section>
    </main>
  );
}

/** ——— inline styles to match your dark UI ——— */
const styles: Record<string, React.CSSProperties> = {
  wrap: {
    minHeight: '70vh',
    display: 'grid',
    placeItems: 'center',
    background: 'transparent',
    color: '#e9eef3',
    padding: '48px 16px',
  },
  card: {
    width: '100%',
    maxWidth: 560,
    background:
      'linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.02))',
    border: '1px solid #1b1d21',
    borderRadius: 16,
    padding: 20,
    boxShadow: '0 18px 36px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.03)',
  },
  h1: { margin: '0 0 14px', fontSize: 22, fontWeight: 700, letterSpacing: 0.2 },
  muted: { margin: 0, color: '#9aa4af' },
  form: { display: 'grid', gap: 14, marginTop: 4 },
  label: { display: 'grid', gap: 6, fontSize: 14, color: '#cfd7df' },
  input: {
    height: 44,
    borderRadius: 12,
    border: '1px solid #1b1d21',
    background: '#0f1113',
    color: '#e9eef3',
    padding: '0 12px',
    outline: 'none',
  },
  err: { color: '#ff7b7b', margin: '4px 0 0' },
  ok: { color: '#67e8f9', margin: '4px 0 0' },
  button: {
    height: 46,
    borderRadius: 999,
    border: '1px solid rgba(124,211,255,0.5)',
    background: 'linear-gradient(180deg, #1a2430, #161b22)',
    color: '#eaf6ff',
    fontWeight: 700,
    letterSpacing: 0.2,
    cursor: 'pointer',
  },
  buttonDisabled: { opacity: 0.6, cursor: 'not-allowed' },
  link: { color: '#7cd3ff', textDecoration: 'none' },
};
