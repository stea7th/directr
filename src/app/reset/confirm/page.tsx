'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ResetConfirmPage() {
  const [message, setMessage] = useState('Verifying your link…');

  useEffect(() => {
    (async () => {
      try {
        const url = new URL(window.location.href);
        const params = new URLSearchParams(url.hash.replace('#', ''));

        const access_token = params.get('access_token');
        const refresh_token = params.get('refresh_token');
        const type = params.get('type');
        const code = url.searchParams.get('code');

        // --- Modern PKCE Recovery Flow ---
        if (code && url.searchParams.get('type') === 'recovery') {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
          setMessage('Redirecting to password reset…');
          window.location.replace('/reset/new');
          return;
        }

        // --- Legacy Token Recovery Flow ---
        if (type === 'recovery' && access_token) {
          await supabase.auth.setSession({
            access_token,
            refresh_token: refresh_token || '',
          });
          localStorage.setItem('sb-access', access_token);
          localStorage.setItem('sb-refresh', refresh_token || '');
          setMessage('Redirecting to password reset…');
          window.location.replace('/reset/new');
          return;
        }

        throw new Error('Invalid or missing recovery token.');
      } catch (err: any) {
        setMessage(err.message || 'Failed to process reset link.');
      }
    })();
  }, []);

  return (
    <div style={styles.center}>
      <div style={styles.card}>
        <h1 style={styles.title}>Password Reset</h1>
        <p style={styles.text}>{message}</p>
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
  title: { fontSize: 22, marginBottom: 10 },
  text: { color: '#9aa4af' },
};
