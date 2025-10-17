'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { auth: { autoRefreshToken: true, persistSession: true, detectSessionInUrl: false } }
);

type Status = 'checking' | 'ready' | 'saving' | 'done' | 'error';

export default function ResetPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<Status>('checking');
  const [msg, setMsg] = useState<string>('Checking session…');

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        setStatus('error');
        setMsg('We couldn’t find an active recovery session. Open the latest email link again.');
        return;
      }
      setStatus('ready');
      setMsg('');
    })();
  }, []);

  async function save() {
    if (!password || password.length < 8) {
      setMsg('Password must be at least 8 characters.');
      return;
    }
    setStatus('saving');
    setMsg('Updating password…');
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setStatus('error');
      setMsg(error.message);
      return;
    }
    setStatus('done');
    setMsg('Password updated. Redirecting…');
    setTimeout(() => router.replace('/'), 900);
  }

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
        }}
      >
        <h1 style={{ margin: 0, marginBottom: 8, fontSize: 22, fontWeight: 800 }}>
          Choose a new password
        </h1>

        {status === 'ready' && (
          <>
            <input
              type="password"
              placeholder="New password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                marginTop: 10,
                padding: '12px 14px',
                borderRadius: 10,
                border: '1px solid #2a3745',
                background: '#17202a',
                color: '#e9eef3',
              }}
            />
            <button
              type="button"
              onClick={save}
              disabled={status === 'saving'}
              style={{
                width: '100%',
                marginTop: 12,
                padding: '12px 16px',
                borderRadius: 10,
                fontWeight: 700,
                border: '1px solid #2a3745',
                background: '#1e3a8a',
                color: '#e9eef3',
                opacity: status === 'saving' ? 0.7 : 1,
              }}
            >
              {status === 'saving' ? 'Saving…' : 'Save password'}
            </button>
          </>
        )}

        {msg && <p style={{ marginTop: 12, opacity: 0.9 }}>{msg}</p>}

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
