'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/app/lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get('next') || '/app';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      router.replace(next);
    } catch (e: any) {
      setErr(e?.message ?? 'Failed to sign in');
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
          Sign in to <span className="tracking-tight">directr</span>
          <span className="text-sky-400">.</span>
        </h1>
        <p className="mt-1 text-sm text-white/60">
          Use your email and password to continue.
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
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </label>

          {err && (
            <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
              {err}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-sky-500 px-4 py-2 text-sm font-medium text-white hover:bg-sky-400 disabled:opacity-50"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="mt-4 text-sm text-white/60">
          Don’t have an account?{' '}
          <Link href={`/signup?next=${encodeURIComponent(next)}`} className="text-sky-400 hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
