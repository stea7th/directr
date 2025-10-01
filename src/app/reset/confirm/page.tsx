'use client';

import React, { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Status = 'waiting-code' | 'exchanging' | 'need-password' | 'saving' | 'done' | 'error';

function ConfirmClient() {
  const sp = useSearchParams();
  const code = sp.get('code') || '';
  const [status, setStatus] = useState<Status>(code ? 'exchanging' : 'waiting-code');
  const [err, setErr] = useState<string>('');
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');

  // Show incoming params for debugging (so we KNOW we’re on the right page)
  const debugQuery = useMemo(
    () => Array.from(sp.entries()).map(([k, v]) => `${k}=${v}`).join('&'),
    [sp]
  );

  // Exchange the one-time code for a session
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!code) return;

      try {
        setStatus('exchanging');
        setErr('');

        // Important: Next Auth helper requires a string arg (the code)
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (cancelled) return;
        if (error) {
          setErr(error.message || 'Could not verify code.');
          setStatus('error');
          return;
        }
        // We’re now "logged in" (temporary), so we can set a new password.
        setStatus('need-password');
      } catch (e: any) {
        if (!cancelled) {
          setErr(e?.message || 'Unexpected error while exchanging code.');
          setStatus('error');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [code]);

  const save = async () => {
    if (status !== 'need-password') return;
    if (!pw || pw.length < 8) {
      setErr('Password must be at least 8 characters.');
      return;
    }
    if (pw !== pw2) {
      setErr('Passwords do not match.');
      return;
    }
    try {
      setStatus('saving');
      setErr('');

      const { error } = await supabase.auth.updateUser({ password: pw });
      if (error) {
        setErr(error.message || 'Failed to update password.');
        setStatus('need-password');
        return;
      }

      setStatus('done');
    } catch (e: any) {
      setErr(e?.message || 'Unexpected error while updating password.');
      setStatus('need-password');
    }
  };

  // —— UI (no Tailwind; simple inline styles) ——
  return (
    <div style={{minHeight:'100dvh', display:'flex', alignItems:'center', justifyContent:'center', background:'#0a0a0a', color:'#fff'}}>
      <div style={{width:'100%', maxWidth:420, padding:20}}>
        <h1 style={{margin:0, fontSize:22, fontWeight:700}}>Reset your password</h1>
        <p style={{margin:'8px 0 16px', color:'#cbd5e1'}}>
          Query: <code>{debugQuery || '(none)'}</code>
        </p>

        {status === 'waiting-code' && (
          <div style={{padding:12, border:'1px solid #334155', borderRadius:10, background:'#0f172a'}}>
            No <code>code</code> in the URL. Open the link from your email so it looks like:
            <div style={{marginTop:6, fontFamily:'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize:12, color:'#93c5fd'}}>
              https://your-domain/reset/confirm?<b>code=...</b>
            </div>
          </div>
        )}

        {status === 'exchanging' && (
          <div style={{padding:12, border:'1px solid #334155', borderRadius:10, background:'#0f172a'}}>Verifying link…</div>
        )}

        {status === 'error' && (
          <div style={{padding:12, border:'1px solid #7f1d1d', borderRadius:10, background:'#1f2937', color:'#fecaca'}}>
            {err || 'Something went wrong.'}
          </div>
        )}

        {status === 'need-password' && (
          <div style={{marginTop:12}}>
            <label style={{display:'block', fontSize:12, color:'#cbd5e1'}}>New password</label>
            <input
              type="password"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              style={{width:'100%', padding:'10px 12px', borderRadius:10, border:'1px solid #334155', background:'#0b1220', color:'#fff', marginTop:6}}
              placeholder="••••••••"
            />

            <label style={{display:'block', fontSize:12, color:'#cbd5e1', marginTop:10}}>Confirm password</label>
            <input
              type="password"
              value={pw2}
              onChange={(e) => setPw2(e.target.value)}
              style={{width:'100%', padding:'10px 12px', borderRadius:10, border:'1px solid #334155', background:'#0b1220', color:'#fff', marginTop:6}}
              placeholder="••••••••"
            />

            {err && <div style={{marginTop:10, fontSize:12, color:'#fca5a5'}}>{err}</div>}

            <button
              onClick={save}
              disabled={status === 'saving'}
              style={{
                width:'100%', padding:'10px 12px', borderRadius:10,
                background:'#0ea5e9', color:'#fff', fontWeight:600,
                border:'1px solid #096aa6', marginTop:14, opacity: status === 'saving' ? 0.7 : 1, cursor:'pointer'
              }}
            >
              {status === 'saving' ? 'Saving…' : 'Update password'}
            </button>
          </div>
        )}

        {status === 'done' && (
          <div style={{padding:12, border:'1px solid #14532d', borderRadius:10, background:'#052e16', color:'#bbf7d0', marginTop:12}}>
            Password updated. You can close this tab and sign in.
          </div>
        )}
      </div>
    </div>
  );
}

export default function Page() {
  // Next requires a Suspense boundary around useSearchParams
  return (
    <Suspense fallback={<div style={{padding:20, color:'#fff'}}>Loading…</div>}>
      <ConfirmClient />
    </Suspense>
  );
}
