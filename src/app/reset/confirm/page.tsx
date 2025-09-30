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

  // ?code=... (query)
  const q = url.searchParams.get('code');
  if (q) return q;

  // #...&code=... (hash)
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''));
  return hash.get('code') || null;
}

export default function ConfirmResetPage() {
  type Phase = 'checking' | 'ready' | 'done' | 'error';

  const [phase, setPhase] = useState<Phase>('checking');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const code = getAuthCodeFromUrl();
        if (!code) {
          setPhase('error');
          setMessage('No reset code found in the URL.');
          return;
        }

        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (cancelled) return;

        if (error) {
          setPhase('error');
          setMessage(error.message);
        } else {
          setPhase('ready');
        }
      } catch (err: any) {
        if (!cancelled) {
          setPhase('error');
          setMessage(err?.message || 'Something went wrong.');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const save = async () => {
    if (!password) return;
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setPhase('error');
      setMessage(error.message);
    } else {
      setPhase('done');
    }
    setSaving(false);
  };

  return (
    <div style={{ maxWidth: 400, margin: '4rem auto', padding: 20, background: '#111', color: '#fff', borderRadius: 12 }}>
      <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Reset your password</h1>

      {phase === 'checking' && <p>Checking reset link…</p>}

      {phase === 'ready' && (
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
            disabled={saving}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: 8,
              background: '#0ea5e9',
              color: '#fff',
              fontWeight: 600,
              cursor: 'pointer',
              opacity: saving ? 0.7 : 1
            }}
          >
            {saving ? 'Saving…' : 'Update password'}
          </button>
        </>
      )}

      {phase === 'done' && <p>Password updated successfully. You can now log in.</p>}
      {phase === 'error' && <p style={{ color: 'red' }}>{message}</p>}
    </div>
  );
}
