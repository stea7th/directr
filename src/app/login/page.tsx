'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

type Tab = 'google' | 'magic' | 'password';

export default function LoginPage() {
  const router = useRouter();
  const search = useSearchParams();
  const [tab, setTab] = useState<Tab>('google');

  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const supabase = useMemo(() => createClient(), []);
  const nextPath = search?.get('next') || '/';

  const redirectTo =
    typeof window !== 'undefined'
      ? (() => {
          const u = new URL(window.location.href);
          u.pathname = '/auth/callback';
          u.search = `next=${encodeURIComponent(nextPath)}`;
          return u.toString();
        })()
      : undefined;

  // ---- helpers
  async function ensureSignedOutIfNeeded() {
    // If you arrived here with an old session, show the form instead of bouncing
    const { data } = await supabase.auth.getUser();
    if (data.user) {
      // do NOT redirect; let user choose to sign out
      setNote(`You're already signed in as ${data.user.email ?? data.user.id}.`);
    }
  }
  // fire once after first paint, but don’t redirect
  React.useEffect(() => {
    // no await needed; best-effort check
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    ensureSignedOutIfNeeded();
  }, []);

  async function handleGoogle() {
    setErr(null); setNote(null); setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo, queryParams: { prompt: 'select_account' } }
    });
    setLoading(false);
    if (error) setErr(error.message);
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setErr(null); setNote(null); setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo }
    });
    setLoading(false);
    if (error) setErr(error.message);
    else setNote('Magic link sent! Check your email.');
  }

  async function handlePassword(e: React.FormEvent) {
    e.preventDefault();
    setErr(null); setNote(null); setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password: pw });
    setLoading(false);
    if (error) { setErr(error.message); return; }
    if (data.user) router.replace(nextPath);
  }

  async function handleSignOut() {
    setLoading(true);
    await supabase.auth.signOut();
    setLoading(false);
    setNote('Signed out. You can log in below.');
  }

  return (
    <main className="page">
      <div className="auth">
        <h1>Sign in to Directr</h1>
        <p className="sub">Choose a method below.</p>

        {note && <p style={{ color: 'var(--muted)', marginTop: 8 }}>{note}</p>}
        {err && <p style={{ color: 'var(--err)', marginTop: 8 }}>{err}</p>}

        <div className="tabs" role="tablist" aria-label="Sign-in methods">
          <button className={`tab ${tab === 'google' ? 'tab--active' : ''}`} onClick={() => setTab('google')}>Google</button>
          <button className={`tab ${tab === 'magic' ? 'tab--active' : ''}`} onClick={() => setTab('magic')}>Magic Link</button>
          <button className={`tab ${tab === 'password' ? 'tab--active' : ''}`} onClick={() => setTab('password')}>Password</button>
        </div>

        {tab === 'google' && (
          <div className="mt-12">
            <button className="btn btn--primary btn--full" onClick={handleGoogle} disabled={loading}>
              {loading ? 'Redirecting…' : 'Continue with Google'}
            </button>
            <div className="links">
              <Link href="/signup">Create one</Link>
              <Link href="/reset">Reset password</Link>
              <button className="linklike" onClick={handleSignOut} disabled={loading}>Sign out</button>
              <Link href="/">Back to home</Link>
            </div>
          </div>
        )}

        {tab === 'magic' && (
          <form onSubmit={handleMagicLink} className="mt-12">
            <label className="field">
              <span>Email</span>
              <input className="input" type="email" inputMode="email" placeholder="you@example.com"
                     value={email} onChange={(e) => setEmail(e.target.value)} required />
            </label>
            <div className="actions">
              <button className="btn btn--primary btn--full" disabled={loading}>
                {loading ? 'Sending…' : 'Send link'}
              </button>
            </div>
            <div className="links">
              <Link href="/signup">Create one</Link>
              <Link href="/reset">Reset password</Link>
              <button className="linklike" onClick={handleSignOut} disabled={loading}>Sign out</button>
              <Link href="/">Back to home</Link>
            </div>
          </form>
        )}

        {tab === 'password' && (
          <form onSubmit={handlePassword} className="mt-12">
            <label className="field">
              <span>Email</span>
              <input className="input" type="email" inputMode="email" placeholder="you@example.com"
                     value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
            </label>
            <label className="field mt-12">
              <span>Password</span>
              <input className="input" type="password" placeholder="••••••••"
                     value={pw} onChange={(e) => setPw(e.target.value)} required autoComplete="current-password" />
            </label>
            <div className="actions">
              <button className="btn btn--primary btn--full" disabled={loading}>
                {loading ? 'Signing in…' : 'Sign in'}
              </button>
            </div>
            <div className="links">
              <Link href="/reset">Reset password</Link>
              <Link href="/signup">Create one</Link>
              <button className="linklike" onClick={handleSignOut} disabled={loading}>Sign out</button>
              <Link href="/">Back to home</Link>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
