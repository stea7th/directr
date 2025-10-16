'use client';

import { useEffect, useState } from 'react';

export default function ConfirmClient() {
  const [message, setMessage] = useState('Verifying reset link…');

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    const params = new URLSearchParams(hash);
    const type = params.get('type');
    const access_token = params.get('access_token');

    // ✅ Supabase automatically sets session for recovery links
    if (type === 'recovery' && access_token) {
      setMessage('Link verified. Redirecting to password reset form…');
      setTimeout(() => window.location.replace('/reset/new'), 1200);
    } else {
      setMessage('Missing or invalid reset link.');
    }
  }, []);

  return (
    <main
      style={{
        minHeight: '70vh',
        display: 'grid',
        placeItems: 'center',
        color: '#e9eef3',
      }}
    >
      <div
        style={{
          maxWidth: 520,
          width: '92%',
          background: '#121214',
          border: '1px solid #1b1d21',
          borderRadius: 16,
          padding: 20,
        }}
      >
        <h1 style={{ margin: '0 0 6px', fontSize: 22, fontWeight: 700 }}>
          Reset your password
        </h1>
        <p style={{ margin: 0, color: '#9aa4af' }}>{message}</p>
      </div>
    </main>
  );
}
