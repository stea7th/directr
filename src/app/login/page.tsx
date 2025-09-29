// src/app/login/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const signin = async () => {
    setErr(null);
    setMsg(null);
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password: pw });
    setBusy(false);
    if (error) setErr(error.message);
    else setMsg('Signed in. You can close this and go to the app.');
  };

  const forgot = async () => {
    setErr(null);
    setMsg(null);
    if (!email) {
      setErr('Enter your email first.');
      return;
    }
    setBusy(true);
    const redirectTo =
      (process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || window.location.origin) +
      '/reset/confirm';
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
    setBusy(false);
    if (error) setErr(error.message);
    else setMsg('Reset link sent. Check your email.');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff' }}>
      <div style={{ maxWidth: 400, margin: '0 auto', padding: '64px 16px' }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>
          Sign in to <span style={{ color: '#0ea5e9' }}>directr</span>.
        </h1>
        <p style={{ color: '#a3a3a3', marginBottom: 24 }}>
          Use your email and password. Forgot it? Send a reset link.
        </p>

        <label style={{ display: 'block', fontSize: 12, color: '#cfcfcf' }}>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            width: '100%', marginTop: 6, marginBottom: 14, padding: '10px 12px',
            borderRadius: 10, border: '1px solid #1f2937', background: '#0f1115', color: '#fff'
          }}
          placeholder="you@email.com"
        />

        <label style={{ display: 'block', fontSize: 12, color: '#cfcfcf' }}>Password</label>
        <input
          type="password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          style={{
            width: '100%', marginTop: 6, marginBottom: 20, padding: '10px 12px',
            borderRadius: 10, border: '1px solid #1f2937', background: '#0f1115', color: '#fff'
          }}
          placeholder="••••••••"
        />

        <button
          onClick={signin}
          disabled={busy}
          style={{
            width: '100%', padding: '10px 12px', borderRadius: 10,
            background: '#0ea5e9', color: '#fff', fontWeight: 600,
            border: '0', cursor: 'pointer', opacity: busy ? 0.6 : 1
          }}
        >
          {busy ? 'Working…' : 'Sign in'}
        </button>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12 }}>
          <button
            onClick={forgot}
            disabled={busy}
            style={{
              background: 'transparent', border: '0', color: '#60a5fa',
              cursor: 'pointer', padding: 0
            }}
          >
            Forgot password?
          </button>
          <Link href="/signup" style={{ color: '#9ca3af', textDecoration: 'underline' }}>
            Create an account
          </Link>
        </div>

        {err ? (
          <div style={{ marginTop: 16, color: '#f87171', fontSize: 14 }}>{err}</div>
        ) : null}
        {msg ? (
          <div style={{ marginTop: 16, color: '#34d399', fontSize: 14 }}>{msg}</div>
        ) : null}
      </div>
    </div>
  );
}
