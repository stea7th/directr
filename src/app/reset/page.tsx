'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ResetNewPage() {
  const [pw1, setPw1] = useState('');
  const [pw2, setPw2] = useState('');
  const [msg, setMsg] = useState('');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        const access = localStorage.getItem('sb-access');
        const refresh = localStorage.getItem('sb-refresh');
        if (access) {
          await supabase.auth.setSession({
            access_token: access,
            refresh_token: refresh || '',
          });
        }
      }
      setReady(true);
    })();
  }, []);

  async function updatePassword() {
    setMsg('');
    if (pw1.length < 8) return setMsg('Password must be at least 8 characters.');
    if (pw1 !== pw2) return setMsg('Passwords do not match.');

    const { data, error } = await supabase.auth.updateUser({ password: pw1 });
    if (error) return setMsg(error.message);
    if (data.user) {
      localStorage.removeItem('sb-access');
      localStorage.removeItem('sb-refresh');
      setMsg('Password updated! Redirecting…');
      setTimeout(() => (window.location.href = '/signin'), 1200);
    }
  }

  if (!ready) return null;

  return (
    <div style={styles.center}>
      <div style={styles.card}>
        <h1 style={styles.title}>Set a New Password</h1>
        <input
          type="password"
          placeholder="New password"
          value={pw1}
          onChange={(e) => setPw1(e.target.value)}
          style={styles.input}
        />
        <input
          type="password"
          placeholder="Confirm password"
          value={pw2}
          onChange={(e) => setPw2(e.target.value)}
          style={styles.input}
        />
        <button onClick={updatePassword} style={styles.button}>
          Update Password
        </button>
        {msg && <p style={styles.msg}>{msg}</p>}
      </div>
    </div>
  );
}

const styles = {
  center: {
    display: 'grid',
    placeItems: 'center',
    minHeight: '100vh',
    background: '#0c0c0d',
    color: '#e9eef3',
  },
  card: {
    background: '#121214',
    borderRadius: 12,
    border: '1px solid #1b1d21',
    padding: 24,
    width: 360,
    textAlign: 'center' as const,
  },
  title: { fontSize: 22, marginBottom: 20 },
  input: {
    width: '100%',
    padding: '10px 12px',
    borderRadius: 10,
    background: '#0f1113',
    border: '1px solid #1b1d21',
    color: '#e9eef3',
    marginBottom: 12,
  },
  button: {
    width: '100%',
    padding: '10px 12px',
    borderRadius: 999,
    background: 'linear-gradient(180deg, #1a2430, #161b22)',
    border: '1px solid rgba(124,211,255,0.5)',
    color: '#eaf6ff',
    fontWeight: 700,
    cursor: 'pointer',
  },
  msg: { color: '#9aa4af', marginTop: 10 },
};
