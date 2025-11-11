'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import './page.css';

export default function LoginPage() {
  const supa = createClient();
  const [tab, setTab] = useState<'google' | 'magic' | 'password'>('google');

  const signInWithGoogle = async () => {
    await supa.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${location.origin}/auth/callback` },
    });
  };

  const sendMagic = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const email = (new FormData(e.currentTarget).get('email') as string) || '';
    const { error } = await supa.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${location.origin}/auth/callback` },
    });
    if (error) alert(error.message);
    else alert('Magic link sent.');
  };

  const signInWithPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = fd.get('email') as string;
    const password = fd.get('password') as string;
    const { error } = await supa.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
  };

  return (
    <div className="page">
      <div className="auth">
        <h1>Sign in to Directr</h1>
        <p className="sub">Choose a method below.</p>

        <div className="tabs">
          <button className={`tab ${tab === 'google' ? 'tab--active' : ''}`} onClick={() => setTab('google')}>
            Google
          </button>
          <button className={`tab ${tab === 'magic' ? 'tab--active' : ''}`} onClick={() => setTab('magic')}>
            Magic Link
          </button>
          <button className={`tab ${tab === 'password' ? 'tab--active' : ''}`} onClick={() => setTab('password')}>
            Password
          </button>
        </div>

        {tab === 'google' && (
          <div className="actions">
            <button className="btn btn--primary btn--full" onClick={signInWithGoogle}>
              Continue with Google
            </button>
          </div>
        )}

        {tab === 'magic' && (
          <form className="mt-12" onSubmit={sendMagic}>
            <div className="field">
              <span>Email</span>
              <input className="input" type="email" name="email" required />
            </div>
            <div className="actions">
              <button className="btn btn--primary btn--full" type="submit">
                Send magic link
              </button>
            </div>
          </form>
        )}

        {tab === 'password' && (
          <form className="mt-12" onSubmit={signInWithPassword}>
            <div className="field">
              <span>Email</span>
              <input className="input" type="email" name="email" required />
            </div>
            <div className="field">
              <span>Password</span>
              <input className="input" type="password" name="password" required />
            </div>
            <div className="actions">
              <button className="btn btn--primary btn--full" type="submit">
                Sign in
              </button>
            </div>
          </form>
        )}

        <div className="links">
          <Link href="/">Back to home</Link>
          <Link href="/signup">Create one</Link>
          <Link href="/reset">Reset password</Link>
        </div>
      </div>
    </div>
  );
}
