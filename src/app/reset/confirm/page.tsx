// src/app/reset/confirm/page.tsx
'use client';
export const dynamic = 'force-dynamic';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function parseHash(): Record<string, string> {
  // URL hash looks like: #access_token=...&refresh_token=...&type=recovery
  const hash = typeof window !== 'undefined' ? window.location.hash : '';
  const q = new URLSearchParams(hash.startsWith('#') ? hash.slice(1) : hash);
  const out: Record<string, string> = {};
  q.forEach((v, k) => (out[k] = v));
  return out;
}

export default function ConfirmResetPage() {
  const router = useRouter();
  const [msg, setMsg] = useState<'working' | 'error' | 'done'>('working');
  const [detail, setDetail] = useState<string>('');

  useEffect(() => {
    async function run() {
      try {
        const { access_token, refresh_token, type } = parseHash();

        if (!access_token || !refresh_token) {
          setMsg('error');
          setDetail('Missing tokens in the URL.');
          return;
        }
        if (type && type !== 'recovery') {
          setMsg('error');
          setDetail(`Unexpected link type "${type}".`);
          return;
        }

        // Turn the recovery link into an authenticated session
        const { error } = await supabase.auth.setSession({
          access_token,
          refresh_token,
        });
        if (error) {
          setMsg('error');
          setDetail(error.message || 'Could not start a session from the link.');
          return;
        }

        // Clean the hash and send user to the "new password" screen
        setMsg('done');
        router.replace('/reset/new');
      } catch (e: any) {
        setMsg('error');
        setDetail(e?.message || 'Unexpected error handling the reset link.');
      }
    }

    run();
  }, [router]);

  return (
    <main style={{ minHeight: '60vh', display: 'grid', placeItems: 'center' }}>
      <div
        style={{
          background: '#14171a',
          border: '1px solid #2a3745',
          borderRadius: 12,
          padding: 20,
          maxWidth: 560,
          width: '92%',
          color: '#e9eef3',
          textAlign: 'center',
        }}
      >
        <h1 style={{ margin: '0 0 8px', fontSize: 22, fontWeight: 800 }}>
          Choose a new password
        </h1>

        {msg === 'working' && <p>Checking your link…</p>}
        {msg === 'error' && (
          <>
            <p style={{ color: '#f19999' }}>Invalid or expired reset link.</p>
            <p style={{ opacity: 0.8 }}>{detail}</p>
            <p style={{ marginTop: 12 }}>
              <a href="/login" style={{ color: '#7cd3ff', fontWeight: 700 }}>
                Back to sign in
              </a>
            </p>
          </>
        )}
        {msg === 'done' && <p>Redirecting…</p>}
      </div>
    </main>
  );
}
