'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';

type Tab = 'password' | 'magic' | 'phone';

export default function SignIn() {
  const supabase = createBrowserClient();
  const router = useRouter();
  const qs = useSearchParams();
  const redirectTo = qs.get('redirect') ?? '/';

  const [tab, setTab] = useState<Tab>('password');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  // email/password
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function onPassword(e: React.FormEvent) {
    e.preventDefault();
    setErr(null); setMsg(null); setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) setErr(error.message);
    else router.replace(redirectTo);
  }

  // magic link (email OTP link)
  async function onMagic(e: React.FormEvent) {
    e.preventDefault();
    setErr(null); setMsg(null); setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirectTo)}`
      }
    });
    setLoading(false);
    if (error) setErr(error.message);
    else setMsg('Magic link sent. Check your email.');
  }

  // phone (SMS)
  const [phone, setPhone] = useState('');   // +1XXXXXXXXXX
  const [code, setCode] = useState('');
  const [phase, setPhase] = useState<'enter' | 'verify'>('enter');

  async function onSendCode(e: React.FormEvent) {
    e.preventDefault();
    setErr(null); setMsg(null); setLoading(true);

    const value = phone.trim();
    if (!value.startsWith('+')) {
      setLoading(false);
      setErr('Use full phone with country code, e.g. +12065551212');
      return;
    }

    const { error } = await supabase.auth.signInWithOtp({
      phone: value,
      options: { channel: 'sms' }
    });

    setLoading(false);
    if (error) setErr(error.message);
    else {
      setMsg('Code sent via SMS.');
      setPhase('verify');
    }
  }

  async function onVerifyCode(e: React.FormEvent) {
    e.preventDefault();
    setErr(null); setMsg(null); setLoading(true);

    const { error } = await supabase.auth.verifyOtp({
      phone: phone.trim(),
      token: code.trim(),
      type: 'sms'
    });

    setLoading(false);
    if (error) setErr(error.message);
    else router.replace(redirectTo);
  }

  return (
    <main style={{ maxWidth: 420, margin: '64px auto', padding: 16 }}>
      <h1 className="title">Sign in</h1>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <button className={tab==='password'?'btn btn--primary':'btn'} onClick={()=>setTab('password')}>Email + Password</button>
        <button className={tab==='magic'?'btn btn--primary':'btn'} onClick={()=>setTab('magic')}>Magic Link</button>
        <button className={tab==='phone'?'btn btn--primary':'btn'} onClick={()=>{setTab('phone'); setPhase('enter'); setErr(null); setMsg(null);}}>Phone (SMS)</button>
      </div>

      {tab === 'password' && (
        <form onSubmit={onPassword} style={{ display:'grid', gap:12 }}>
          <input className="input" type="email" placeholder="you@example.com" required value={email} onChange={e=>setEmail(e.target.value)} />
          <input className="input" type="password" placeholder="Your password" required minLength={6} value={password} onChange={e=>setPassword(e.target.value)} />
          <button className="btn btn--primary" disabled={loading} type="submit">{loading?'Working…':'Continue'}</button>
        </form>
      )}

      {tab === 'magic' && (
        <form onSubmit={onMagic} style={{ display:'grid', gap:12 }}>
          <input className="input" type="email" placeholder="you@example.com" required value={email} onChange={e=>setEmail(e.target.value)} />
          <button className="btn btn--primary" disabled={loading} type="submit">{loading?'Sending…':'Send magic link'}</button>
        </form>
      )}

      {tab === 'phone' && (
        <>
          {phase === 'enter' && (
            <form onSubmit={onSendCode} style={{ display:'grid', gap:12 }}>
              <input className="input" type="tel" placeholder="+12065551212" required value={phone} onChange={e=>setPhone(e.target.value)} />
              <button className="btn btn--primary" disabled={loading} type="submit">{loading?'Sending…':'Send code'}</button>
            </form>
          )}
          {phase === 'verify' && (
            <form onSubmit={onVerifyCode} style={{ display:'grid', gap:12 }}>
              <input className="input" inputMode="numeric" pattern="[0-9]*" placeholder="6-digit code" required value={code} onChange={e=>setCode(e.target.value)} />
              <button className="btn btn--primary" disabled={loading} type="submit">{loading?'Verifying…':'Verify & continue'}</button>
              <button className="btn btn--ghost" type="button" onClick={()=>{ setPhase('enter'); setCode(''); }}>Resend / change number</button>
            </form>
          )}
        </>
      )}

      {err && <p style={{ color:'#ef4444', marginTop:12 }}>{err}</p>}
      {msg && <p style={{ color:'#22c55e', marginTop:12 }}>{msg}</p>}

      <p style={{ marginTop:16, color:'var(--muted)' }}>
        New here? <a href="/signup">Create an account</a>
      </p>
    </main>
  );
}
