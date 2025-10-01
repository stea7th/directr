'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
);

export const dynamic = 'force-dynamic';

export default function ResetRequestPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    setError(null);

    // Build the redirect URL safely for both local & Vercel
    const origin =
      typeof window !== 'undefined'
        ? window.location.origin
        : process.env.NEXT_PUBLIC_SITE_URL;

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${origin}/reset/confirm`,
      });
      if (error) {
        setError(error.message);
        setStatus('error');
      } else {
        setStatus('sent');
      }
    } catch (e: any) {
      setError(e?.message || 'Something went wrong');
      setStatus('error');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
      <form
        onSubmit={onSubmit}
        style={{
          width: 360,
          padding: 20,
          borderRadius: 12,
          border: '1px solid #e5e7eb',
        }}
      >
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Reset your password</h1>
        <p style={{ color: '#6b7280', fontSize: 14, marginTop: 8 }}>
          Enter your account email. We’ll send a reset link.
        </p>

        <label style={{ display: 'block', marginTop: 16, fontSize: 12, color: '#6b7280' }}>
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              marginTop: 6,
              width: '100%',
              padding: '10px 12px',
              borderRadius: 10,
              border: '1px solid #d1d5db',
              outline: 'none',
            }}
            placeholder="you@example.com"
          />
        </label>

        <button
          type="submit"
          disabled={status === 'sending' || !email}
          style={{
            marginTop: 14,
            width: '100%',
            padding: '10px 12px',
            borderRadius: 10,
            border: '1px solid #096aa6',
            background: '#0ea5e9',
            color: '#fff',
            fontWeight: 600,
            cursor: status === 'sending' ? 'not-allowed' : 'pointer',
            opacity: status === 'sending' ? 0.7 : 1,
          }}
        >
          {status === 'sending' ? 'Sending…' : 'Send reset link'}
        </button>

        {status === 'sent' && (
          <p style={{ marginTop: 10, color: '#059669', fontSize: 14 }}>
            Email sent! Check your inbox.
          </p>
        )}
        {error && (
          <p style={{ marginTop: 10, color: '#dc2626', fontSize: 14 }}>
            {error}
          </p>
        )}
      </form>
    </div>
  );
}
      {message ? <div style={note}>{message}</div> : null}
    </div>
  );
}
