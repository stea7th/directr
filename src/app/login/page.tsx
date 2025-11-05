'use client';

import React, { useEffect, useMemo, useState } from 'react';
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
  const redirectTo = useMemo(() => {
    // return to ?next=/foo or default to /
    const next = search?.get('next') || '/';
    // full absolute URL is best for OAuth providers
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.pathname = '/auth/callback';
      url.search = `next=${encodeURIComponent(next)}`;
      return url.toString();
    }
    return undefined;
  }, [search]);

  // If already signed in, bounce away
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!cancelled && data.user) router.replace(search?.get('next') || '/');
    })();
    return () => {
      cancelled = true;
    };
  }, [router, search, supabase]);

  async function handleGoogle() {
    setErr(null);
    setNote(null);
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo, // must be whitelisted in Supabase Auth -> URL Configuration
        queryParams: { prompt: 'select_account' },
      },
    });
    setLoading(false);
    if (error) setErr(error.message);
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setNote(null);
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo },
    });
    setLoading(false);
    if (error) setErr(error.message);
    else setNote('Magic link sent! Check your email.');
  }

  async function handlePassword(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setNote(null);
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: pw,
    });
    setLoading(false);
    if (error) {
      // If the user doesn’t exist yet, suggest creating one
      setErr(error.message);
      return;
    }
    if (data.user) router.replace(search?.get('next') || '/');
  }

  return (
    <main className="page">
      <div className="auth">
        <h1>Sign in to Directr</h1>
        <p className="sub">Choose a method below.</p>

        <div className="tabs" role="tablist" aria-label="Sign-in methods">
          <button
            className={`tab ${tab === 'google' ? 'tab--active' : ''}`}
            onClick={() => setTab('google')}
            role="tab"
            aria-selected={tab === 'google'}
          >
            Google
          </button>
          <button
            className={`tab ${tab === 'magic' ? 'tab--active' : ''}`}
            onClick={() => setTab('magic')}
            role="tab"
            aria-selected={tab === 'magic'}
          >
            Magic Link
          </button>
          <button
            className={`tab ${tab === 'password' ? 'tab--active' : ''}`}
            onClick={() => setTab('password')}
            role="tab"
            aria-selected={tab === 'password'}
          >
            Password
          </button>
        </div>

        {/* Google */}
        {tab === 'google' && (
          <div className="mt-12">
            <button
              className="btn btn--primary btn--full"
              onClick={handleGoogle}
              disabled={loading}
            >
              {loading ? 'Redirecting…' : 'Continue with Google'}
            </button>
            <div className="links">
              <Link href="/signup">Create one</Link>
              <Link href="/">Back to home</Link>
            </div>
          </div>
        )}

        {/* Magic Link */}
        {tab === 'magic' && (
          <form onSubmit={handleMagicLink} className="mt-12">
            <label className="field">
              <span>Email</span>
              <input
                className="input"
                type="email"
                inputMode="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>
            <div className="actions">
              <button className="btn btn--primary btn--full" disabled={loading}>
                {loading ? 'Sending…' : 'Send link'}
              </button>
            </div>
            <div className="links">
              <Link href="/signup">Create one</Link>
              <Link href="/reset">Reset password</Link>
              <Link href="/">Back to home</Link>
            </div>
          </form>
        )}

        {/* Password */}
        {tab === 'password' && (
          <form onSubmit={handlePassword} className="mt-12">
            <label className="field">
              <span>Email</span>
              <input
                className="input"
                type="email"
                inputMode="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </label>
            <label className="field mt-12">
              <span>Password</span>
              <input
                className="input"
                type="password"
                placeholder="••••••••"
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                required
                autoComplete="current-password"
              />
            </label>
            <div className="actions">
              <button className="btn btn--primary btn--full" disabled={loading}>
                {loading ? 'Signing in…' : 'Sign in'}
              </button>
            </div>
            <div className="links">
              <Link href="/reset">Reset password</Link>
              <Link href="/signup">Create one</Link>
              <Link href="/">Back to home</Link>
            </div>
          </form>
        )}

        {/* Messages */}
        {err && (
          <p style={{ color: 'var(--err)', marginTop: 12, fontSize: 13 }}>
            {err}
          </p>
        )}
        {note && (
          <p style={{ color: 'var(--muted)', marginTop: 12, fontSize: 13 }}>
            {note}
          </p>
        )}
      </div>
    </main>
  );
}
