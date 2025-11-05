'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';

type Tab = 'phone' | 'password' | 'magic';

export default function SignInPage() {
  const supabase = createBrowserClient();
  const router = useRouter();
  const sp = useSearchParams();
  const redirectTo = sp.get('redirectTo') || '/';

  const [tab, setTab] = useState<Tab>('phone');

  // shared UI state
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  // phone state
  const [phone, setPhone] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [otp, setOtp] = useState('');

  // email/password state
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');

  // magic link state (re-use email)
  const [magicEmail, setMagicEmail] = useState('');

  async function handlePhoneSend() {
    setErr(null); setOk(null);
    if (!phone.trim()) { setErr('Enter your phone number.'); return; }
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOtp({
        phone,
        options: { channel: 'sms' }, // use SMS
      });
      if (error) throw error;
      setCodeSent(true);
      setOk('Code sent. Check your SMS.');
    } catch (e: any) {
      setErr(e?.message || 'Failed to send code.');
    } finally {
      setLoading(false);
    }
  }

  async function handlePhoneVerify() {
    setErr(null); setOk(null);
    if (!phone.trim() || !otp.trim()) {
      setErr('Enter phone and the 6-digit code.'); return;
    }
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.verifyOtp({
        phone,
        token: otp,
        type: 'sms',
      });
      if (error) throw error;
      if (data?.session) {
        setOk('Signed in!');
        router.replace(redirectTo);
      } else {
        setErr('Could not verify code.');
      }
    } catch (e: any) {
      setErr(e?.message || 'Invalid code.');
    } finally {
      setLoading(false);
    }
  }

  async function handleEmailPassword() {
    setErr(null); setOk(null);
    if (!email || !pw) { setErr('Enter email and password.'); return; }
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: pw,
      });
      if (error) throw error;
      if (data.session) {
        setOk('Signed in!');
        router.replace(redirectTo);
      } else {
        setErr('Sign in failed.');
      }
    } catch (e: any) {
      setErr(e?.message || 'Sign in failed.');
    } finally {
      setLoading(false);
    }
  }

  async function handleMagicLink() {
    setErr(null); setOk(null);
    if (!magicEmail) { setErr('Enter your email.'); return; }
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOtp({
        email: magicEmail,
        options: {
          emailRedirectTo:
            typeof window !== 'undefined'
              ? `${window.location.origin}/auth/callback`
              : undefined,
        },
      });
      if (error) throw error;
      setOk('Magic link sent. Check your email.');
    } catch (e: any) {
      setErr(e?.message || 'Could not send magic link.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={styles.wrap}>
      <div style={styles.card}>
        <h1 style={styles.h1}>Sign in to Directr</h1>

        <div style={styles.tabs}>
          <button
            onClick={() => setTab('phone')}
            style={{ ...styles.tab, ...(tab === 'phone' ? styles.tabActive : {}) }}
          >
            Phone
          </button>
          <button
            onClick={() => setTab('password')}
            style={{ ...styles.tab, ...(tab === 'password' ? styles.tabActive : {}) }}
          >
            Email + Password
          </button>
          <button
            onClick={() => setTab('magic')}
            style={{ ...styles.tab, ...(tab === 'magic' ? styles.tabActive : {}) }}
          >
            Magic Link
          </button>
        </div>

        {err && <div style={styles.err}>{err}</div>}
        {ok && <div style={styles.ok}>{ok}</div>}

        {tab === 'phone' && (
          <div style={styles.form}>
            <label style={styles.label}>Phone number</label>
            <input
              style={styles.input}
              placeholder="+1 555 123 4567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              inputMode="tel"
            />
            {!codeSent ? (
              <button style={styles.btn} onClick={handlePhoneSend} disabled={loading}>
                {loading ? 'Sending…' : 'Send code'}
              </button>
            ) : (
              <>
                <label style={{ ...styles.label, marginTop: 10 }}>6-digit code</label>
                <input
                  style={styles.input}
                  placeholder="••••••"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  inputMode="numeric"
                />
                <button style={styles.btn} onClick={handlePhoneVerify} disabled={loading}>
                  {loading ? 'Verifying…' : 'Verify & sign in'}
                </button>
                <button
                  style={styles.linkBtn}
                  onClick={handlePhoneSend}
                  disabled={loading}
                  aria-label="Resend code"
                >
                  Resend code
                </button>
              </>
            )}
          </div>
        )}

        {tab === 'password' && (
          <div style={styles.form}>
            <label style={styles.label}>Email</label>
            <input
              style={styles.input}
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
            <label style={styles.label}>Password</label>
            <input
              style={styles.input}
              type="password"
              placeholder="••••••••"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              autoComplete="current-password"
            />
            <button style={styles.btn} onClick={handleEmailPassword} disabled={loading}>
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </div>
        )}

        {tab === 'magic' && (
          <div style={styles.form}>
            <label style={styles.label}>Email</label>
            <input
              style={styles.input}
              type="email"
              placeholder="you@example.com"
              value={magicEmail}
              onChange={(e) => setMagicEmail(e.target.value)}
            />
            <button style={styles.btn} onClick={handleMagicLink} disabled={loading}>
              {loading ? 'Sending…' : 'Send magic link'}
            </button>
          </div>
        )}

        <p style={styles.small}>
          Don’t have an account?{' '}
          <a href="/signup" style={styles.a}>Create one</a>
        </p>
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrap: { minHeight: '100svh', display: 'grid', placeItems: 'center', padding: 24 },
  card: {
    width: '100%', maxWidth: 440, background: 'var(--panel,#111)', borderRadius: 16,
    border: '1px solid var(--border,rgba(255,255,255,.1))', padding: 20,
  },
  h1: { margin: '2px 0 12px', fontSize: 20, fontWeight: 700 },
  tabs: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, marginBottom: 12 },
  tab: {
    height: 36, borderRadius: 10, border: '1px solid var(--border,rgba(255,255,255,.1))',
    background: 'var(--panel-2,#0f0f0f)', color: '#e5e7eb', cursor: 'pointer',
  },
  tabActive: { outline: '2px solid var(--accent,#0ea5e9)' },
  form: { display: 'flex', flexDirection: 'column', gap: 10, marginTop: 6 },
  label: { fontSize: 12, color: 'var(--muted,#b6bcc6)' },
  input: {
    height: 40, borderRadius: 12, border: '1px solid var(--border,rgba(255,255,255,.1))',
    background: 'var(--panel-2,#0f0f0f)', color: '#fff', padding: '0 12px',
  },
  btn: {
    height: 40, borderRadius: 12, background: 'var(--accent,#0ea5e9)', color: '#fff',
    border: 'none', cursor: 'pointer', fontWeight: 600, marginTop: 6,
  },
  linkBtn: {
    background: 'transparent', border: 'none', color: 'var(--accent,#0ea5e9)',
    cursor: 'pointer', marginTop: 6, textDecoration: 'underline',
  },
  err: {
    margin: '8px 0', fontSize: 13, color: '#fecaca',
    border: '1px solid #7f1d1d', background: 'rgba(239,68,68,.12)', borderRadius: 10, padding: 8,
  },
  ok: {
    margin: '8px 0', fontSize: 13, color: '#86efac',
    border: '1px solid #14532d', background: 'rgba(34,197,94,.12)', borderRadius: 10, padding: 8,
  },
  small: { marginTop: 14, fontSize: 12, color: 'var(--muted,#b6bcc6)' },
  a: { color: 'var(--accent,#0ea5e9)', textDecoration: 'underline' },
};
