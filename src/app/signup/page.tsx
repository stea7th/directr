'use client';

import { Suspense, useState, FormEvent } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase'; // adjust the path if yours is different

// Make this page purely client-side so hooks don't run at build time
export const dynamic = 'force-dynamic';

function SignupInner() {
  const search = useSearchParams();
  const router = useRouter();
  const next = search.get('next') ?? '/app';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    setInfo(null);

    try {
      // Create the account
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`, // optional
        },
      });
      if (error) throw error;

      // If your project requires email confirmation, a session won't exist yet.
      if (!data.session) {
        setInfo('Check your email to confirm your account. After confirming, come back and sign in.');
        return;
      }

      // If confirmation is disabled and we already have a session, go in
      router.push(next);
    } catch (e: any) {
      setErr(e?.message ?? 'Sign-up failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-6 py-12 text-white">
      <h1 className="mb-6 text-2xl font-semibold">Create your account</h1>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm text-white/70">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-neutral-900/70 px-3 py-2 outline-none ring-1 ring-white/5 focus:ring-sky-500/50"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-white/70">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-neutral-900/70 px-3 py-2 outline-none ring-1 ring-white/5 focus:ring-sky-500/50"
          />
        </div>

        {err && <p className="text-sm text-rose-400">{err}</p>}
        {info && <p className="text-sm text-sky-400">{info}</p>}

        <button
          type="submit"
          disabled={busy}
          className="inline-flex h-10 items-center justify-center rounded-lg bg-sky-500 px-4 font-medium text-white hover:bg-sky-400 disabled:opacity-50"
        >
          {busy ? 'Creating account…' : 'Sign up'}
        </button>
      </form>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="p-6 text-white/60">Loading…</div>}>
      <SignupInner />
    </Suspense>
  );
}
