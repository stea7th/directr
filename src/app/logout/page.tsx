'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/app/lib/supabase';

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      await supabase.auth.signOut();
      router.replace('/login');
    })();
  }, [router]);

  return (
    <div className="min-h-screen bg-neutral-950 text-white grid place-items-center">
      <div className="text-sm text-white/70">Signing you out…</div>
    </div>
  );
}
