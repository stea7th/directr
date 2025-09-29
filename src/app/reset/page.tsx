// src/app/reset/confirm/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function ResetConfirmPage() {
  const [stage, setStage] = useState<'checking' | 'ready' | 'saving' | 'done' | 'error'>('checking');
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const url = typeof window !== 'undefined' ? new URL(window.location.href) : null;
        const hasCode = !!url?.searchParams.get('code');
        if (hasCode) {
          const { error } = await supabase.auth.exchangeCodeForSession(window.location.search);
          if (error) throw error;
        }
        const { data: sessionData, error: sErr } = await supabase.auth.getSession();
        if (sErr) throw sErr;
        if (!cancelled) setStage(sessionData.session ? 'ready' : 'error');
      } catch (e: any) {
        if (!cancelled) {
          setErr(e?.message || 'Unable to verify link.');
          setStage('error');
        }
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const save = async () => {
    setErr(null);
    if (!pw || pw.length < 8) {
      setErr('Password must be at least 8 characters.');
      return;
    }
    if (pw !== pw2) {
      setErr('Passwords do not match.');
      return;
    }
    setStage('saving');
    const { error } = await supabase.auth.updateUser({ password: pw });
    if (error) {
      setErr(error.message);
      setStage('ready');
    } else {
      setStage('done');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff' }}>
      <div style={{ maxWidth: 420, margin: '0 auto', padding: '64px 16px' }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>
          Reset your password
        </h1>
        {stage === 'checking' && (
          <p style={{ color: '#a3a3a3' }}>Checking your reset link…</p>
        )}
        {stage === 'error' && (
          <div style={{ color: '#f87171' }}>
            {err || 'Invalid or expired link.'}
          </div>
        )}
        {stage === 'done' && (
          <div style={{ color: '#34d399' }}>
            Password updated. You can close this tab and sign in.
          </div>
        )}
        {stage === 'ready' && (
          <div style={{ marginTop: 16 }}>
            <label style={{ display: 'block', fontSize: 12, color: '#cfcfcf' }}>New password</label>
            <input
              type="password"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              style={{
                width: '100%', marginTop: 6, marginBottom: 14, padding: '10px 12px',
                borderRadius: 10, border: '1px solid #1f2937', background: '#0f1115', color: '#fff'
              }}
              placeholder="••••••••"
            />
            <label style={{ display: 'block', fontSize: 12, color: '#cfcfcf' }}>Confirm password</label>
            <input
              type="password"
              value={pw2}
              onChange={(e) => setPw2(e.target.value)}
              style={{
                width: '100%', marginTop: 6, marginBottom: 20, padding: '10px 12px',
                borderRadius: 10, border: '1px solid #1f2937', background: '#0f1115', color: '#fff'
              }}
              placeholder="••••••••"
            />
            {err ? <div style={{ color: '#f87171', marginBottom: 12 }}>{err}</div> : null}
            <button
              onClick={save}
              disabled={stage === 'saving'}
              style={{
                width: '100%', padding: '10px 12px', borderRadius: 10,
                background: '#0ea5e9', color: '#fff', fontWeight: 600,
                border: '0', cursor: 'pointer', opacity: stage === 'saving' ? 0.6 : 1
              }}
            >
              {stage === 'saving' ? 'Saving…' : 'Save new password'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
