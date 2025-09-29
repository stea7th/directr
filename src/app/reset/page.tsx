'use client';

import { useEffect, useMemo, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Stage = 'checking' | 'need' | 'saving' | 'done' | 'error';

export default function ResetConfirm() {
  const [stage, setStage] = useState<Stage>('checking');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');

  // Supabase sends tokens in the URL **hash** (#access_token=...)
  const tokens = useMemo(() => {
    if (typeof window === 'undefined') return {};
    const hash = window.location.hash.replace(/^#/, '');
    const sp = new URLSearchParams(hash);
    return {
      access_token: sp.get('access_token'),
      refresh_token: sp.get('refresh_token'),
    };
  }, []);

  useEffect(() => {
    (async () => {
      if (!tokens.access_token || !tokens.refresh_token) {
        setStage('error'); setMsg('Invalid or expired link.'); return;
      }
      const { error } = await supabase.auth.setSession({
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
      });
      if (error) { setStage('error'); setMsg(error.message); return; }
      setStage('need');
    })();
  }, [tokens.access_token, tokens.refresh_token]);

  const save = async () => {
    if (password.length < 8) { setMsg('Min 8 characters.'); return; }
    setStage('saving');
    const { error } = await supabase.auth.updateUser({ password });
    if (error) { setStage('error'); setMsg(error.message); return; }
    setStage('done');
    setMsg('Password updated. You can sign in now.');
  };

  // simple inline UI (no Tailwind)
  return (
    <div style={{minHeight:'100vh',display:'grid',placeItems:'center',background:'#0b0b0b',color:'#fff'}}>
      <div style={{width:380,maxWidth:'90vw',background:'#141414',border:'1px solid #222',borderRadius:12,padding:18}}>
        <h2 style={{margin:'0 0 10px'}}>Reset your password</h2>

        {stage === 'checking' && <p>Validating link…</p>}

        {stage === 'need' && (
          <>
            <label style={{fontSize:12,opacity:.7}}>New password</label>
            <input
              type="password"
              value={password}
              onChange={e=>setPassword(e.target.value)}
              style={{width:'100%',marginTop:6,marginBottom:12,padding:'10px 12px',borderRadius:10,border:'1px solid #2a2a2a',background:'#0e0e0e',color:'#fff'}}
              placeholder="••••••••"
            />
            <button
              onClick={save}
              disabled={stage === 'saving'}
              style={{width:'100%',padding:'10px 12px',borderRadius:10,border:'1px solid #096aa6',background:'#0ea5e9',color:'#fff',fontWeight:600,opacity:stage==='saving'?0.7:1,cursor:'pointer'}}
            >
              {stage === 'saving' ? 'Saving…' : 'Update password'}
            </button>
          </>
        )}

        {stage === 'done' && <p style={{marginTop:8}}>✅ {msg}</p>}
        {stage === 'error' && <p style={{marginTop:8,color:'#f87171'}}>❌ {msg}</p>}
        {msg && stage === 'need' && <p style={{marginTop:8,opacity:.8,fontSize:12}}>{msg}</p>}
      </div>
    </div>
  );
}
