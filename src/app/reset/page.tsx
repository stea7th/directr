// src/app/reset/page.tsx
"use client";

import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function ResetRequestPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      const redirectTo = `${window.location.origin}/reset/confirm`;
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
      });
      if (error) throw error;
      setSent(true);
    } catch (e: any) {
      setErr(e?.message ?? "Could not send reset email");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container">
      <h1 className="title">Reset your password</h1>
      <p className="subtitle">We’ll email you a secure link to set a new password.</p>

      {sent ? (
        <div className="card" role="status">
          <p>✅ Check <strong>{email}</strong> for a reset link.</p>
          <p className="subtitle" style={{marginTop:8}}>
            Didn’t get it? Check spam/promotions, or try again in a minute.
          </p>
        </div>
      ) : (
        <form className="card" onSubmit={onSubmit}>
          <label className="field" style={{maxWidth:420}}>
            <span>Email</span>
            <input
              className="input"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          {err && <p className="job__err" style={{marginTop:10}}>{err}</p>}

          <div className="actions" style={{marginTop:14}}>
            <button className="btn btn--primary" disabled={busy}>
              {busy ? "Sending…" : "Send reset link"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
