// src/app/reset/new/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ResetNewPage() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [msg, setMsg] = useState<string>('');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      // If we already have a session, great. If not, try to restore from storage
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        const access_token = localStorage.getItem('supabase_recovery_access_token');
        const refresh_token = localStorage.getItem('supabase_recovery_refresh_token') || '';
        if (access_token) {
          await supabase.auth.setSession({ access_token, refresh_token });
        }
      }
      setReady(true);
    })();
  }, []);

  async function submit() {
    setMsg('');
    if (password.length < 8) {
      setMsg('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setMsg('Passwords do not match.');
      return;
    }

    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      setMsg('We couldn’t find an active recovery session. Please open the password reset link from your email again.');
      return;
    }

    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setMsg(error.message);
      return;
    }

    // clear temp tokens
    localStorage.removeItem('supabase_recovery_access_token');
    localStorage.removeItem('supabase_recovery_refresh_token');

    // optional: redirect to sign-in
    window.location.replace('/signin?reset=success');
  }

  if (!ready) return null;

  return (
    <div style={{ minHeight: '60vh', display: 'grid', placeItems: 'center', color: '#e9eef3' }}>
      <div style={{ background: '#121214', border: '1px solid #1b1d21', padding: 20, borderRadius: 12, width: 360 }}>
        <h1 style={{ margin: 0, fontSize: 22 }}>Reset your password</h1>
        <p style={{ color: '#9aa4af', marginTop: 8 }}>Enter a new password for your account.</p>

        <label style={{ display: 'block', marginTop: 16, fontSize: 14 }}>New password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={inputStyle}
        />

        <label style={{ display: 'block', marginTop: 12, fontSize: 14 }}>Confirm password</label>
        <input
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          style={inputStyle}
        />

        <button onClick={submit} style={buttonStyle}>Update password</button>

        {msg && <p style={{ color: '#9aa4af', marginTop: 10 }}>{msg}</p>}
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  marginTop: 6,
  padding: '10px 12px',
  borderRadius: 10,
  background: '#0f1113',
  border: '1px solid #1b1d21',
  color: '#e9eef3',
  outline: 'none',
};

const buttonStyle: React.CSSProperties = {
  marginTop: 18,
  width: '100%',
  padding: '10px 12px',
  borderRadius: 999,
  background: 'linear-gradient(180deg, #1a2430, #161b22)',
  border: '1px solid rgba(124,211,255,0.5)',
  color: '#eaf6ff',
  fontWeight: 700,
};
