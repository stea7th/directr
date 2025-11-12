// src/app/login/page.tsx
"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Tab = "magic" | "password" | "google";

export default function LoginPage() {
  const supabase = createClient();
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/create";

  const [tab, setTab] = useState<Tab>("google");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function signInGoogle() {
    setErr(null); setMsg(null); setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${location.origin}/auth/callback?next=${encodeURIComponent(next)}` }
      });
      if (error) throw error;
      // will redirect to Google; no further code runs
    } catch (e: any) {
      setErr(e.message || "Google sign-in failed");
    } finally {
      setLoading(false);
    }
  }

  async function sendMagic() {
    setErr(null); setMsg(null); setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${location.origin}/auth/callback?next=${encodeURIComponent(next)}` }
      });
      if (error) throw error;
      setMsg("Magic link sent. Check your email.");
    } catch (e: any) {
      setErr(e.message || "Could not send magic link");
    } finally {
      setLoading(false);
    }
  }

  async function signInPw() {
    setErr(null); setMsg(null); setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password: pw });
      if (error) throw error;
      if (data.user) router.replace(next);
    } catch (e: any) {
      setErr(e.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="container" style={{ maxWidth: 520 }}>
      <h1 className="title">Sign in</h1>
      <p className="subtitle">Choose a method to continue.</p>

      <div className="card" style={{ padding: 20 }}>
        <div className="actions" style={{ marginTop: 0 }}>
          <button className={`btn ${tab === "google" ? "btn--primary" : ""}`} onClick={() => setTab("google")}>Google</button>
          <button className={`btn ${tab === "magic" ? "btn--primary" : ""}`} onClick={() => setTab("magic")}>Magic link</button>
          <button className={`btn ${tab === "password" ? "btn--primary" : ""}`} onClick={() => setTab("password")}>Password</button>
        </div>

        {tab === "google" && (
          <div className="actions" style={{ marginTop: 16 }}>
            <button className="btn btn--primary" onClick={signInGoogle} disabled={loading}>
              {loading ? "Redirecting…" : "Continue with Google"}
            </button>
          </div>
        )}

        {tab === "magic" && (
          <div style={{ marginTop: 16 }}>
            <label className="field">
              <span>Email</span>
              <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com" />
            </label>
            <div className="actions">
              <button className="btn btn--primary" onClick={sendMagic} disabled={loading || !email}>
                {loading ? "Sending…" : "Send magic link"}
              </button>
            </div>
          </div>
        )}

        {tab === "password" && (
          <div style={{ marginTop: 16 }}>
            <label className="field">
              <span>Email</span>
              <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} />
            </label>
            <label className="field" style={{ marginTop: 10 }}>
              <span>Password</span>
              <input className="input" type="password" value={pw} onChange={e => setPw(e.target.value)} />
            </label>
            <div className="actions">
              <button className="btn btn--primary" onClick={signInPw} disabled={loading || !email || !pw}>
                {loading ? "Signing in…" : "Sign in"}
              </button>
            </div>
          </div>
        )}

        {msg && <div className="badge badge--ok" style={{ marginTop: 12 }}>{msg}</div>}
        {err && <div className="job__err" style={{ marginTop: 12 }}>{err}</div>}
      </div>
    </main>
  );
}
