'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
);

// Narrow the union so TS is happy when comparing to 'saving'
type Status = 'loading' | 'need-password' | 'saving' | 'done' | 'error';

export default function ConfirmResetPage() {
  const sp = useSearchParams();
  const [status, setStatus] = useState<Status>('loading');
  const [error, setError] = useState<string>('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        // Works for email links that arrive with either ?code= or hash tokens
        const code = sp.get('code');

        if (code) {
          const { error: exErr } = await supabase.auth.exchangeCodeForSession(code);
          if (cancelled) return;
          if (exErr) throw exErr;
          setStatus('need-password');
          return;
        }

        // Fallback for hash-based links (access_token in URL fragment)
        const hash = typeof window !== 'undefined' ? window.location.hash : '';
        const m = hash.match(/access_token=([^&]+)/);
        if (m) {
          const access_token = decodeURIComponent(m[1]);
          const { data, error: setErr } = await supabase.auth.setSession({ access_token, refresh_token: '' });
          if (cancelled) return;
          if (setErr || !data?.session) throw setErr || new Error('No session');
          setStatus('need-password');
          return;
        }

        throw new Error('Missing confirmation token.');
      } catch (e: any) {
        if (cancelled) return;
        setError(e?.message || 'Could not validate token.');
        setStatus('error');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [sp]);

  async function save() {
    if (status !== 'need-password') return;
    if (!password || password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setBusy(true);
    setStatus('saving');
    try {
      const { error: upErr } = await supabase.auth.updateUser({ password });
      if (upErr) throw upErr;
      setStatus('done');
    } catch (e: any) {
      setError(e?.message || 'Could not update password.');
      setStatus('error');
    } finally {
      setBusy(false);
    }
  }

  // UI
  return (
    <div style={page}>
      <div style={card}>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Reset password</h1>

        {status === 'loading' && <p style={muted}>Validating your link…</p>}

        {status === 'need-password' && (
          <>
            <p style={muted}>Enter a new password for your account.</p>
            <label style={label}>New password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={input}
            />
            <button onClick={save} disabled={status === 'saving' || busy} style={button(status === 'saving' || busy)}>
              {status === 'saving' ? 'Saving…' : 'Update password'}
            </button>
          </>
        )}

        {status === 'done' && (
          <p style={{ marginTop: 12 }}>
            ✅ Password updated. You can now <a href="/login" style={link}>log in</a>.
          </p>
        )}

        {status === 'error' && (
          <p style={{ marginTop: 12, color: '#f87171' }}>
            {error || 'Something went wrong.'}
          </p>
        )}
      </div>
    </div>
  );
}

const page: React.CSSProperties = {
  minHeight: '100vh',
  display: 'grid',
  placeItems: 'center',
  background: '#0a0a0a',
  color: '#fff',
  padding: 24,
};

const card: React.CSSProperties = {
  maxWidth: 420,
  width: '100%',
  background: '#111214',
  border: '1px solid rgba(255,255,255,.08)',
  borderRadius: 12,
  padding: 20,
};

const label: React.CSSProperties = {
  display: 'block',
  fontSize: 12,
  opacity: 0.8,
  marginTop: 12,
  marginBottom: 6,
};

const input: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: 10,
  border: '1px solid #262b31',
  background: '#0f1115',
  color: '#fff',
} as const;

const button = (disabled: boolean): React.CSSProperties => ({
  width: '100%',
  marginTop: 14,
  padding: '10px 12px',
  borderRadius: 10,
  fontWeight: 600,
  background: '#0ea5e9',
  border: '1px solid #096aa6',
  color: '#fff',
  cursor: disabled ? 'not-allowed' : 'pointer',
  opacity: disabled ? 0.75 : 1,
});

const muted: React.CSSProperties = { opacity: 0.7, marginTop: 8 };
const link: React.CSSProperties = { color: '#0ea5e9', textDecoration: 'underline' };
