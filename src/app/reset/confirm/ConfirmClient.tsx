'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);

type Status = 'checking' | 'ready' | 'done' | 'error';

export default function ClientConfirm() {
  const [status, setStatus] = useState<Status>('checking');
  const [msg, setMsg] = useState('');
  const [pw1, setPw1] = useState('');
  const [pw2, setPw2] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const qs = new URLSearchParams(window.location.search);
        const code = qs.get('code');
        if (!code) {
          setStatus('error');
          setMsg('Missing recovery code in the URL.');
          return;
        }

        // version-safe: works for all supabase-js versions
        const res: any =
          (await (supabase.auth as any).exchangeCodeForSession?.(code)) ??
          (await (supabase.auth as any).exchangeCodeForSession?.({ code }));

        if (res?.error) {
          setStatus('error');
          setMsg(res.error.message || 'Could not validate reset link.');
          return;
        }

        setStatus('ready');
      } catch (e: any) {
        setStatus('error');
        setMsg(e?.message || 'Unexpected error.');
      }
    })();
  }, []);

  async function save() {
    if (status !== 'ready' || saving) return;

    if (!pw1 || pw1.length < 8) {
      setMsg('Password must be at least 8 characters.');
      return;
    }
    if (pw1 !== pw2) {
      setMsg('Passwords do not match.');
      return;
    }

    setSaving(true);
    setMsg('Saving your new password…');

    const { error } = await supabase.auth.updateUser({ password: pw1 });
    if (error) {
      setSaving(false);
      setStatus('error');
      setMsg(error.message);
      return;
    }

    setSaving(false);
    setStatus('done');
    setMsg('Password updated. You can close this tab or go to the app.');
    // optional: redirect after 2s
    // setTimeout(() => (window.location.href = '/'), 2000);
  }

  return (
    <main style={{ minHeight: '70vh', display: 'grid', placeItems: 'center' }}>
      <div
        style={{
          background: '#161a20',
          border: '1px solid #252c36',
          padding: 20,
          borderRadius: 12,
          width: 420,
          maxWidth: '90%',
          color: '#e9eef3',
        }}
      >
        <h1 style={{ margin: 0, marginBottom: 8, fontSize: 22, fontWeight: 800 }}>
          {status === 'done' ? 'All set' : 'Set a new password'}
        </h1>

        {status === 'checking' && <p>Validating your reset link…</p>}

        {status === 'ready' && (
          <>
            <div style={{ display: 'grid', gap: 10 }}>
              <input
                type="password"
                placeholder="New password"
                value={pw1}
                onChange={(e) => setPw1(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: 10,
                  border: '1px solid #2a3745',
                  background: '#17202a',
                  color: '#e9eef3',
                }}
              />
              <input
                type="password"
                placeholder="Repeat new password"
                value={pw2}
                onChange={(e) => setPw2(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: 10,
                  border: '1px solid #2a3745',
                  background: '#17202a',
                  color: '#e9eef3',
                }}
              />
            </div>

            <button
              type="button"
              onClick={save}
              disabled={saving}
              style={{
                width: '100%',
                marginTop: 12,
                padding: '12px 16px',
                borderRadius: 10,
                fontWeight: 700,
                border: '1px solid #2a3745',
                background: '#1e3a8a',
                color: '#e9eef3',
                opacity: saving ? 0.7 : 1,
                cursor: saving ? 'not-allowed' : 'pointer',
              }}
            >
              {saving ? 'Saving…' : 'Save password'}
            </button>
          </>
        )}

        {(status === 'error' || status === 'done') && (
          <p style={{ marginTop: 12, opacity: 0.9 }}>{msg}</p>
        )}
      </div>
    </main>
  );
}
