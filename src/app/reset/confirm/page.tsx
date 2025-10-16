'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ConfirmPage() {
  const [message, setMessage] = useState('Finishing sign-in…');

  useEffect(() => {
    async function run() {
      try {
        // Read tokens from hash first, then from query (?code=) as a fallback
        const hash = typeof window !== 'undefined' ? window.location.hash.slice(1) : '';
        const query = typeof window !== 'undefined' ? window.location.search.slice(1) : '';

        const hashParams = new URLSearchParams(hash);
        const qsParams = new URLSearchParams(query);

        const access_token = hashParams.get('access_token') || '';
        const refresh_token = hashParams.get('refresh_token') || '';
        const type =
          hashParams.get('type') ||
          qsParams.get('type') ||
          '';

        const code = qsParams.get('code'); // for OTP/magic-link flow

        if (access_token && refresh_token) {
          const { error } = await supabase.auth.setSession({ access_token, refresh_token });
          if (error) throw error;
          setMessage('Signed in. Redirecting…');
          window.location.replace('/account'); // or wherever
          return;
        }

        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
          setMessage('Signed in. Redirecting…');
          window.location.replace('/account');
          return;
        }

        setMessage('Missing code or tokens in the URL.');
      } catch (err: any) {
        console.error(err);
        setMessage(err?.message || 'Link invalid or expired.');
      }
    }

    run();
  }, []);

  return (
    <main style={{
      minHeight: '70vh',
      display: 'grid',
      placeItems: 'center',
      color: '#e9eef3'
    }}>
      <div style={{
        maxWidth: 520,
        width: '92%',
        background: '#121214',
        border: '1px solid #1b1d21',
        borderRadius: 16,
        padding: 20
      }}>
        <h1 style={{ margin: '0 0 6px', fontSize: 22, fontWeight: 700 }}>Reset your password</h1>
        <p style={{ margin: 0, color: '#9aa4af' }}>{message}</p>
      </div>
    </main>
  );
}
