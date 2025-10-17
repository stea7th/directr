'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter, useSearchParams } from 'next/navigation';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { auth: { autoRefreshToken: true, persistSession: true, detectSessionInUrl: false } }
);

export default function ConfirmRecoveryPage() {
  const router = useRouter();
  const qp = useSearchParams();

  const [status, setStatus] = useState<'checking' | 'ok' | 'error'>('checking');
  const [message, setMessage] = useState<string>('Verifying your reset link…');

  useEffect(() => {
    (async () => {
      try {
        const type = qp.get('type'); // should be "recovery"
        const tokenHash = qp.get('token_hash');
        const code = qp.get('code'); // some projects send ?code= instead

        if (type !== 'recovery') {
          setStatus('error');
          setMessage('Invalid recovery link.');
          return;
        }

        // Prefer token_hash; fall back to code
        if (tokenHash) {
          const { data, error } = await supabase.auth.verifyOtp({
            type: 'recovery',
            token_hash: tokenHash,
          });
          if (error) throw error;
          if (!data?.user) throw new Error('Could not establish a session.');
        } else if (code) {
          // If a "code" param is present (PKCE), exchange it for a session
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
          if (!data?.session) throw new Error('Could not establish a session.');
        } else {
          setStatus('error');
          setMessage('Missing tokens in URL.');
          return;
        }

        setStatus('ok');
        setMessage('Verified. Redirecting…');
        router.replace('/reset/new');
      } catch (err: any) {
        setStatus('error');
        setMessage(err?.message || 'Verification failed.');
      }
    })();
  }, [qp, router]);

  return (
    <main style={{ minHeight: '70vh', display: 'grid', placeItems: 'center' }}>
      <div
        style={{
          background: '#161a20',
          border: '1px solid #252c36',
          padding: 20,
          borderRadius: 12,
          width: 420,
          maxWidth: '90%',
          color: '#e9eef3',
          textAlign: 'center',
        }}
      >
        <h1 style={{ margin: 0, marginBottom: 8, fontSize: 22, fontWeight: 800 }}>
          Choose a new password
        </h1>
        <p style={{ margin: 0, opacity: 0.85 }}>{message}</p>
        {status === 'error' && (
          <p style={{ marginTop: 16 }}>
            <a href="/login" style={{ color: '#78b4ff', textDecoration: 'underline' }}>
              Back to sign in
            </a>
          </p>
        )}
      </div>
    </main>
  );
}
