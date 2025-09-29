'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/app/lib/supabase';

export default function AuthNav() {
  const [email, setEmail] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (active) {
        setEmail(user?.email ?? null);
        setReady(true);
      }
    })();
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setEmail(session?.user?.email ?? null);
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  if (!ready) {
    return (
      <div className="h-8 w-24 rounded-lg border border-white/10 bg-neutral-900/50" />
    );
  }

  if (!email) {
    return (
      <>
        <Link
          href="/signup"
          className="rounded-lg border border-white/10 px-3 py-1.5 text-white/90 hover:bg-white/5"
        >
          Create account
        </Link>
        <Link
          href="/login"
          className="rounded-lg border border-white/10 px-3 py-1.5 text-white/90 hover:bg-white/5"
        >
          Sign in
        </Link>
      </>
    );
  }

  return (
    <>
      <span className="hidden sm:inline text-white/60">{email}</span>
      <Link
        href="/logout"
        className="rounded-lg border border-white/10 px-3 py-1.5 text-white/90 hover:bg-white/5"
      >
        Sign out
      </Link>
    </>
  );
}
