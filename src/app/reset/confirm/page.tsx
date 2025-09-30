'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
);

function getAuthCodeFromUrl(): string | null {
  if (typeof window === 'undefined') return null;
  const url = new URL(window.location.href);

  // Check query param ?code=
  const q = url.searchParams.get('code');
  if (q) return q;

  // Also check hash fragment #access_token=...&code=...
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''));
  return hash.get('code') || null;
}

export default function ConfirmResetPage() {
  const [status, setStatus] = useState<'checking' | 'ready' | 'saving' | 'done' | 'error'>('checking');
  const [message, setMessage] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const code = getAuthCodeFromUrl();
        if (!code) {
          setStatus('error');
          setMessage('No reset code found in the URL.');
          return;
        }

        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (cancelled) return;

        if (error) {
          setStatus('error');
          setMessage(error.message);
        } else {
          setStatus('ready');
        }
      } catch (err: any) {
        if (!cancelled) {
          setStatus('error');
          setMessage(err.message || 'Something went wrong.');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const save = async () => {
    if (!password) return;
    setStatus('saving');
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setStatus('error');
      setMessage(error.message);
    } else {
      setStatus('done');
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '4rem auto', padding: 20, background: '#111', color: '#fff', borderRadius: 12 }}>
      <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Reset your password</h1>

      {status === 'checking' && <p>Checking reset link…</p>}

      {status === 'ready' && (
        <>
          <input
            type="password"
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: 8,
              border: '1px solid #333',
              marginBottom: '1rem',
              background: '#222',
              color: '#fff'
            }}
          />
          <button
            onClick={save}
            disabled={status === 'saving'}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: 8,
              background: '#0ea5e9',
              color: '#fff',
              fontWeight: 600,
              cursor: 'pointer',
              opacity: status === 'saving' ? 0.7 : 1
            }}
          >
            {status === 'saving' ? 'Saving…' : 'Update password'}
          </button>
        </>
      )}

      {status === 'done' && <p>Password updated successfully. You can now log in.</p>}
      {status === 'error' && <p style={{ color: 'red' }}>{message}</p>}
    </div>
  );
}
