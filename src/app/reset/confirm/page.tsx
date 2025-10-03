'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function ConfirmResetPage() {
  const [status, setStatus] = useState<'checking' | 'need-password' | 'saving' | 'done' | 'error'>('checking');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState<string>('');

  // When arriving from the email, the URL fragment has access_token & refresh_token.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const hash = typeof window !== 'undefined' ? window.location.hash : '';
        const params = new URLSearchParams(hash.startsWith('#') ? hash.slice(1) : hash);

        const access_token = params.get('access_token');
        const refresh_token = params.get('refresh_token');
        const type = params.get('type'); // should be "recovery"

        if (!access_token || !refresh_token || type !== 'recovery') {
          if (!cancelled) {
            setStatus('error');
            setMsg('Invalid or missing recovery token.');
          }
          return;
        }

        // Establish a session so we can call updateUser()
        const { error: sessErr } = await supabase.auth.setSession({ access_token, refresh_token });
        if (sessErr) {
          if (!cancelled) {
            setStatus('error');
            setMsg(sessErr.message);
          }
          return;
        }

        if (!cancelled) setStatus('need-password');
      } catch (e: any) {
        if (!cancelled) {
          setStatus('error');
          setMsg(e?.message || 'Unexpected error.');
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  async function save() {
    if (!password) {
      setMsg('Enter a new password.');
      return;
    }
    setStatus('saving');
    setMsg('');
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setStatus('error');
      setMsg(error.message);
      return;
    }
    setStatus('done');
    setMsg('Password updated. You are signed in.');
  }

  // ---- styles ----
  const wrap: React.CSSProperties = { maxWidth: 420, margin: '40px auto', color: '#e5e7eb', fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Arial' };
  const h1: React.CSSProperties = { fontSize: 24, fontWeight: 700, marginBottom: 16 };
  const label: React.CSSProperties = { display: 'block', fontSize: 13, marginBottom: 6, color: '#a3a3a3' };
  const input: React.CSSProperties = { width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid #262626', background: '#0a0a0a', color: '#e5e7eb' };
  const btn: React.CSSProperties = { width: '100%', marginTop: 12, padding: '10px 12px', borderRadius: 10, border: '1px solid #096aa6', background: '#0ea5e9', color: '#fff', fontWeight: 600, cursor: 'pointer', opacity: status === 'saving' ? 0.7 : 1 };
  const note: React.CSSProperties = { marginTop: 12, fontSize: 13, color: status === 'error' ? '#fca5a5' : '#a3e635' };

  if (status === 'checking') {
    return <div style={wrap}><div style={h1}>Verifying reset link…</div></div>;
  }

  if (status === 'done') {
    return <div style={wrap}><div style={h1}>Password updated ✅</div><div style={note}>{msg}</div></div>;
  }

  if (status === 'error') {
    return <div style={wrap}><div style={h1}>Reset error</div><div style={note}>{msg}</div></div>;
  }

  return (
    <div style={wrap}>
      <div style={h1}>Set a new password</div>

      <label style={label} htmlFor="pw">New password</label>
      <input
        id="pw"
        type="password"
        placeholder="••••••••"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={input}
      />

      <button onClick={save} disabled={status === 'saving'} style={btn}>
        {status === 'saving' ? 'Saving…' : 'Update password'}
      </button>

      {msg ? <div style={note}>{msg}</div> : null}
    </div>
  );
}
