'use client'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function ResetConfirmPage() {
  const supabase = createClientComponentClient()
  const qp = useSearchParams()
  const [status, setStatus] = useState<'verifying'|'need-password'|'saving'|'done'|'error'>('verifying')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState<string>('')

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const token_hash = qp.get('token') || qp.get('code') || qp.get('token_hash')
      const type = qp.get('type') || 'recovery'

      if (!token_hash) { setStatus('error'); setErr('Missing token'); return }

      // Verify the email recovery token -> creates a session
      const { error } = await supabase.auth.verifyOtp({ type: 'recovery', token_hash })
      if (cancelled) return

      if (error) { setStatus('error'); setErr(error.message); return }
      setStatus('need-password')
    })()
    return () => { cancelled = true }
  }, [qp, supabase])

  const save = async () => {
    setStatus('saving')
    const { error } = await supabase.auth.updateUser({ password })
    if (error) { setStatus('error'); setErr(error.message); return }
    setStatus('done')
  }

  if (status === 'verifying') return <p>Verifying link…</p>
  if (status === 'error')    return <p>There was a problem: {err}</p>
  if (status === 'done')     return <p>Password updated! You can now <a href="/login">sign in</a>.</p>

  // need-password
  return (
    <div style={{maxWidth:420,margin:'40px auto',padding:20,background:'#111',borderRadius:12}}>
      <h1>Set a new password</h1>
      <input
        type="password"
        value={password}
        onChange={(e)=>setPassword(e.target.value)}
        placeholder="New password"
        style={{width:'100%',padding:'10px 12px',borderRadius:8,marginTop:12,marginBottom:12}}
      />
      <button onClick={save} disabled={status==='saving'} style={{width:'100%',padding:'10px 12px',borderRadius:8}}>
        {status==='saving' ? 'Saving…' : 'Update password'}
      </button>
    </div>
  )
}
