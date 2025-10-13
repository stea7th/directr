'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
);

type Status = 'loading' | 'need-password' | 'saving' | 'done' | 'error';

export default function ResetConfirmPage() {
  const [status, setStatus] = useState<Status>('loading');
  const [msg, setMsg] = useState<string>('');
  const [pw1, setPw1] = useState('');
  const [pw2, setPw2] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const url = new URL(window.location.href);
        const code = url.searchParams.get('code');
        if (!code) {
          setMsg('Missing code in URL.');
          setStatus('error');
          return;
        }

        // Support both signatures across supabase-js versions.
        const fn: unknown = (supabase as any)?.auth?.exchangeCodeForSession;
        if (typeof fn === 'function') {
          // Try function(code)
          let res = await (fn as (c: string) => Promise<{ error?: any } | void>)(code);
          // If that returned an error or nothing, try function({ code })
          if (!res || (res as any)?.error) {
            res = await (fn as (o: { code: string }) => Promise<{ error?: any } | void>)({ code });
            if ((res as any)?.error) throw (res as any).error;
          }
        } else {
          throw new Error('exchangeCodeForSession not available on this client.');
        }

        if (!cancelled) {
          setStatus('need-password');
        }
      } catch (e: any) {
        if (!cancelled) {
          setMsg(e?.message || 'Could not start password reset.');
          setStatus('error');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function save() {
    if (pw1.length < 8) {
      setMsg('Password must be at least 8 characters.');
      return;
    }
    if (pw1 !== pw2) {
      setMsg('Passwords do not match.');
      return;
    }
    setStatus('saving');
    setMsg('');
    try {
      const { error } = await supabase.auth.updateUser({ password: pw1 });
      if (error) throw error;
      setStatus('done');
      setMsg('Password updated. You can close this tab or continue.');
    } catch (e: any) {
      setStatus('need-password');
      setMsg(e?.message || 'Failed to update password.');
    }
  }

  // ---- minimal styles (no Tailwind) ----
  const page: React.CSSProperties = {
    minHeight: '100vh', background: '#0a0a0a', color: '#e5e7eb',
    display: 'grid', placeItems: 'center', padding: 16,
  };
  const card: React.CSSProperties = {
    width: 'min(520px, 100%)', border: '1px solid rgba(255,255,255,0.08)',
    background: 'rgba(24,24,27,0.8)', borderRadius: 14, padding: 16,
  };
  const input: React.CSSProperties = {
    width: '100%', padding: '10px 12px', borderRadius: 10,
    border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(2,6,23,0.3)',
    color: '#e5e7eb', outline: 'none',
  };
  const button = (disabled = false): React.CSSProperties => ({
    width: '100%', padding: '10px 12px', borderRadius: 10,
    border: '1px solid #096aa6', background: '#0ea5e9',
    color: '#fff', fontWeight: 600, cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.6 : 1,
  });
  const note: React.CSSProperties = { marginTop: 10, fontSize: 13, color: '#a5b4fc' };

  return (
    <div style={page}>
      <div style={card}>
        <h2 style={{ margin: 0, color: '#fff' }}>Reset your password</h2>
        <p style={{ marginTop: 6, color: '#cbd5e1', fontSize: 14 }}>
          Finish your password reset here.
        </p>

        {status === 'loading' && (
          <div style={{ marginTop: 12, color: '#9ca3af' }}>Checking link…</div>
        )}

        {status === 'error' && (
          <div style={{ marginTop: 12, color: '#fecaca' }}>
            {msg || 'Something went wrong.'}
          </div>
        )}

        {status === 'need-password' && (
          <div style={{ marginTop: 12, display: 'grid', gap: 10 }}>
            <div>
              <label style={{ fontSize: 12, color: '#9ca3af' }}>New password</label>
              <input type="password" style={input} value={pw1} onChange={(e) => setPw1(e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: '#9ca3af' }}>Confirm password</label>
              <input type="password" style={input} value={pw2} onChange={(e) => setPw2(e.target.value)} />
            </div>
            <button onClick={save} disabled={status === 'saving'} style={button(status === 'saving')}>
              {status === 'saving' ? 'Saving…' : 'Update password'}
            </button>
            {msg ? <div style={note}>{msg}</div> : null}
          </div>
        )}

        {status === 'done' && (
          <div style={{ marginTop: 12, color: '#86efac' }}>
            {msg || 'Password updated.'}
          </div>
        )}
      </div>
    </div>
  );
}
