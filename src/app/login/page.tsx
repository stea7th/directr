'use client';

import { useState, FormEvent, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase'; // adjust path if your supabase client lives elsewhere

// Opt out of static prerendering so the hook runs only on the client.
export const dynamic = 'force-dynamic';

function LoginInner() {
  const search = useSearchParams();
  const router = useRouter();
  const next = search.get('next') ?? '/app';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      if (data.session) router.push(next);
    } catch (e: any) {
      setErr(e?.message ?? 'Sign-in failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-6 py-12 text-white">
      <h1 className="mb-6 text-2xl font-semibold">Sign in</h1>
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

        <button
          type="submit"
          disabled={busy}
          className="inline-flex h-10 items-center justify-center rounded-lg bg-sky-500 px-4 font-medium text-white hover:bg-sky-400 disabled:opacity-50"
        >
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}

export default function LoginPage() {
  // Wrap the hook usage in Suspense to satisfy Next’s requirement.
  return (
    <Suspense fallback={<div className="p-6 text-white/60">Loading…</div>}>
      <LoginInner />
    </Suspense>
  );
}
