'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

type Status =
  | 'exchanging'        // exchanging the code in the URL for a session
  | 'need-password'     // show password inputs
  | 'saving'            // updating password
  | 'done'              // all set
  | 'error';            // something went wrong

export default function ConfirmClient() {
  const params = useSearchParams();
  const [status, setStatus] = useState<Status>('exchanging');
  const [error, setError] = useState<string>('');
  const [pw1, setPw1] = useState('');
  const [pw2, setPw2] = useState('');

  // Step 1: read the `code` from the URL and exchange for a session
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const code = params.get('code');
        const type = params.get('type'); // should be 'recovery' for password reset

        if (!code) {
          setStatus('error');
          setError('Missing code in the URL.');
          return;
        }

        // Needed so the user is "logged in" for updateUser()
       const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (cancelled) return;

        if (error) {
          setStatus('error');
          setError(error.message || 'Could not verify code.');
          return;
        }

        // If OK, show the password form
        setStatus('need-password');
      } catch (e: any) {
        if (!cancelled) {
          setStatus('error');
          setError(e?.message || 'Something went wrong.');
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [params]);

  async function saveNewPassword() {
    if (pw1.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (pw1 !== pw2) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setStatus('saving');
      setError('');

      const { error } = await supabase.auth.updateUser({ password: pw1 });
      if (error) {
        setStatus('error');
        setError(error.message || 'Failed to update password.');
        return;
      }
      setStatus('done');
    } catch (e: any) {
      setStatus('error');
      setError(e?.message || 'Failed to update password.');
    }
  }

  const wrap: React.CSSProperties = {
    maxWidth: 440,
    margin: '40px auto',
    padding: 20,
    borderRadius: 12,
    border: '1px solid #e5e7eb',
  };

  const h1: React.CSSProperties = {
    fontSize: 20,
    fontWeight: 700,
    marginBottom: 10,
  };

  const label: React.CSSProperties = {
    display: 'block',
    fontSize: 13,
    color: '#555',
    marginTop: 10,
    marginBottom: 6,
  };

  const input: React.CSSProperties = {
    width: '100%',
    padding: '10px 12px',
    borderRadius: 10,
    border: '1px solid #ddd',
    outline: 'none',
    fontSize: 14,
  };

  const btn: React.CSSProperties = {
    width: '100%',
    padding: '10px 12px',
    marginTop: 14,
    borderRadius: 10,
    border: '1px solid #096aa6',
    background: '#0ea5e9',
    color: '#fff',
    fontWeight: 600 as const,
    cursor: status === 'saving' ? 'not-allowed' : 'pointer',
    opacity: status === 'saving' ? 0.7 : 1,
  };

  const note: React.CSSProperties = {
    marginTop: 10,
    fontSize: 12,
    color: status === 'error' ? '#b91c1c' : '#111827',
    whiteSpace: 'pre-wrap',
  };

  // UI states
  if (status === 'exchanging') {
    return <div style={wrap}>Verifying link…</div>;
  }

  if (status === 'error') {
    return (
      <div style={wrap}>
        <h1 style={h1}>Reset password</h1>
        <div style={note}>{error || 'Something went wrong.'}</div>
      </div>
    );
  }

  if (status === 'done') {
    return (
      <div style={wrap}>
        <h1 style={h1}>Password updated ✅</h1>
        <div style={note}>You can close this page and sign in with your new password.</div>
      </div>
    );
  }

  // need-password / saving
  return (
    <div style={wrap}>
      <h1 style={h1}>Choose a new password</h1>

      <label style={label} htmlFor="pw1">New password</label>
      <input
        id="pw1"
        type="password"
        placeholder="••••••••"
        value={pw1}
        onChange={(e) => setPw1(e.target.value)}
        style={input}
      />

      <label style={label} htmlFor="pw2">Confirm password</label>
      <input
        id="pw2"
        type="password"
        placeholder="••••••••"
        value={pw2}
        onChange={(e) => setPw2(e.target.value)}
        style={input}
      />

      <button
        onClick={saveNewPassword}
        disabled={status === 'saving'}
        style={btn}
      >
        {status === 'saving' ? 'Saving…' : 'Update password'}
      </button>

      {error ? <div style={note}>{error}</div> : null}
    </div>
  );
}
