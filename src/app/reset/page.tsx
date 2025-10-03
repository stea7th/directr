'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
const supabase = createClient(supabaseUrl, supabaseAnon);

export default function ResetPage() {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState<string>('');
  const [busy, setBusy] = useState(false);

  async function send() {
    setMsg('');
    if (!email) { setMsg('Enter your email.'); return; }
    setBusy(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'https://directr-beta.vercel.app/reset/confirm',
      });
      if (error) throw error;
      setMsg('Check your email for the reset link.');
    } catch (e: any) {
      setMsg(e?.message || 'Could not send reset email.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{minHeight:'100vh',display:'grid',placeItems:'center',background:'#0a0a0a',color:'#fff',padding:24}}>
      <div style={{maxWidth:420,width:'100%',background:'#111214',border:'1px solid rgba(255,255,255,.08)',borderRadius:12,padding:20}}>
        <h1 style={{margin:0,fontSize:20,fontWeight:700}}>Forgot your password?</h1>
        <p style={{opacity:.7,marginTop:8}}>Enter your email and we’ll send a reset link.</p>

        <label style={{display:'block',fontSize:12,opacity:.8,marginTop:12,marginBottom:6}}>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
          style={{width:'100%',padding:'10px 12px',borderRadius:10,border:'1px solid #262b31',background:'#0f1115',color:'#fff'}}
        />

        <button
          onClick={send}
          disabled={busy}
          style={{
            width:'100%',marginTop:14,padding:'10px 12px',borderRadius:10,fontWeight:600,
            background:'#0ea5e9',border:'1px solid #096aa6',color:'#fff',
            cursor: busy ? 'not-allowed':'pointer', opacity: busy ? .75 : 1
          }}
        >
          {busy ? 'Sending…' : 'Send reset link'}
        </button>

        {msg ? <p style={{marginTop:12,color:'#9ca3af'}}>{msg}</p> : null}
      </div>
    </div>
  );
}
      {message ? <div style={note}>{message}</div> : null}
    </div>
  );
}
