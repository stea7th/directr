'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function ResetConfirm() {
  const router = useRouter();

  useEffect(() => {
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) router.push('/'); // redirect to dashboard/home
    });
  }, [router]);

  return (
    <main style={{ textAlign: 'center', marginTop: '20vh' }}>
      <h2>Reset your password</h2>
      <p>Finishing password reset…</p>
    </main>
  );
}
