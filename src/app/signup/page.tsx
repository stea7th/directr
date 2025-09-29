'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/app/lib/supabase';

export default function SignupPage() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get('next') || '/app';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setOk(null);

    if (password.length < 8) {
      setErr('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setErr('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo:
            typeof window !== 'undefined'
              ? `${window.location.origin}/login?next=${encodeURIComponent(next)}`
              : undefined,
        },
      });
      if (error) throw error;

      // If email confirmations are ON in Supabase, the user must verify.
      // If confirmations are OFF, user is signed in already — bounce to /app.
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        router.replace(next);
        return;
      }

      setOk('Check your inbox to confirm your email, then sign in.');
    } catch (e: any) {
      setErr(e?.message ?? 'Failed to sign up');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <div className="mx-auto max-w-md px-4 py-12">
        <Link href="/" className="text-white/70 hover:text-white text-sm">
          ← Back
        </Link>
        <h1 className="mt-4 text-2xl font-semibold">
          Create your <span className="tracking-tight">directr</span>
          <span className="text-sky-400">.</span> account
        </h1>
        <p className="mt-1 text-sm text-white/60">
          Use an email and password you’ll remember.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <label className="block text-sm">
            <span className="text-white/70">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-xl border border-white/10 bg-neutral-900/70 px-3 py-2 text-white outline-none ring-1 ring-white/5 focus:ring-sky-500/50"
              placeholder="you@email.com"
              autoComplete="email"
            />
          </label>

          <label className="block text-sm">
            <span className="text-white/70">Password</span>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-xl border border-white/10 bg-neutral-900/70 px-3 py-2 text-white outline-none ring-1 ring-white/5 focus:ring-sky-500/50"
              placeholder="Minimum 8 characters"
              autoComplete="new-password"
            />
          </label>

          <label className="block text-sm">
            <span className="text-white/70">Confirm password</span>
            <input
              type="password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="mt-1 w-full rounded-xl border border-white/10 bg-neutral-900/70 px-3 py-2 text-white outline-none ring-1 ring-white/5 focus:ring-sky-500/50"
              placeholder="Re-enter password"
              autoComplete="new-password"
            />
          </label>

          {err && (
            <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
              {err}
            </div>
          )}
          {ok && (
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
              {ok}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-sky-500 px-4 py-2 text-sm font-medium text-white hover:bg-sky-400 disabled:opacity-50"
          >
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="mt-4 text-sm text-white/60">
          Already have an account?{' '}
          <Link href={`/login?next=${encodeURIComponent(next)}`} className="text-sky-400 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
