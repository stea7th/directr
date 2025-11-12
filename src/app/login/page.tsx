"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Tab = "password" | "magic" | "google";

export default function LoginPage() {
  const supabase = createClient();
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/";

  const [tab, setTab] = useState<Tab>("password");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function handlePassword(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setErr(null); setMsg(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password: pw });
    setLoading(false);
    if (error) setErr(error.message);
    else router.replace(next);
  }

  async function handleMagic(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setErr(null); setMsg(null);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    setLoading(false);
    if (error) setErr(error.message);
    else setMsg("Magic link sent. Check your email.");
  }

  async function handleGoogle() {
    setLoading(true); setErr(null); setMsg(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: { access_type: "offline", prompt: "consent" },
      },
    });
    setLoading(false);
    if (error) setErr(error.message);
  }

  return (
    <div className="container" style={{maxWidth: 520}}>
      <div className="card">
        <div className="card__head">
          <div className="title">Sign in</div>
          <div className="badge">directr</div>
        </div>

        <div className="menu" style={{gap:12, marginBottom:12}}>
          <button className={`btn ${tab==="password"?"btn--primary":""}`} onClick={() => setTab("password")}>Password</button>
          <button className={`btn ${tab==="magic"?"btn--primary":""}`} onClick={() => setTab("magic")}>Magic link</button>
          <button className={`btn ${tab==="google"?"btn--primary":""}`} onClick={() => setTab("google")}>Google</button>
        </div>

        {tab === "password" && (
          <form onSubmit={handlePassword} className="field" style={{gap:12}}>
            <div className="field">
              <span>Email</span>
              <input className="input" type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
            </div>
            <div className="field">
              <span>Password</span>
              <input className="input" type="password" value={pw} onChange={e=>setPw(e.target.value)} required />
            </div>
            <div className="actions">
              <button className="btn btn--primary" disabled={loading} type="submit">
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </div>
          </form>
        )}

        {tab === "magic" && (
          <form onSubmit={handleMagic} className="field" style={{gap:12}}>
            <div className="field">
              <span>Email</span>
              <input className="input" type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
            </div>
            <div className="actions">
              <button className="btn btn--primary" disabled={loading} type="submit">
                {loading ? "Sending..." : "Send magic link"}
              </button>
            </div>
          </form>
        )}

        {tab === "google" && (
          <div className="actions">
            <button className="btn btn--primary" disabled={loading} onClick={handleGoogle}>
              {loading ? "Redirecting…" : "Continue with Google"}
            </button>
          </div>
        )}

        {msg && <div className="badge badge--ok" style={{marginTop:12}}>{msg}</div>}
        {err && <div className="job__err" style={{marginTop:12}}>{err}</div>}
      </div>
    </div>
  );
}
