"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type AuthMode = "signin" | "signup" | "reset";

export default function LoginForm() {
  const params = useSearchParams();
  const next = useMemo(() => {
    const value = params.get("next");
    return value && value.startsWith("/") && !value.startsWith("//") ? value : "/today";
  }, [params]);
  const [mode, setMode] = useState<AuthMode>(params.get("mode") === "signup" ? "signup" : "signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(params.get("err") || "");
  const [notice, setNotice] = useState("");

  function changeMode(value: AuthMode) {
    setMode(value);
    setError("");
    setNotice("");
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ action: mode, email, password, next }),
      });
      const result = await response.json() as { success?: boolean; error?: string; next?: string; message?: string; requiresConfirmation?: boolean };
      if (!response.ok || !result.success) throw new Error(result.error || "Could not sign you in.");
      if (mode === "reset" || result.requiresConfirmation) {
        setNotice(result.message || "Check your email.");
        if (mode === "signup") setMode("signin");
        setPassword("");
        return;
      }
      // A full navigation makes the server-issued cookie immediately visible to middleware.
      window.location.assign(result.next || next);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not sign you in.");
    } finally {
      setBusy(false);
    }
  }

  async function signInWithGoogle() {
    setBusy(true);
    setError("");
    try {
      const supabase = createClient();
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
      });
      if (oauthError) throw oauthError;
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Google sign-in is unavailable.");
      setBusy(false);
    }
  }

  const heading = mode === "signup" ? "Meet your director." : mode === "reset" ? "Reset your password." : "Welcome back.";
  const detail = mode === "signup" ? "Know what to film before you open your camera." : mode === "reset" ? "We’ll send you a link to get back in." : "Your next direction is waiting.";

  return (
    <section className="auth-experience" aria-labelledby="auth-heading">
      <span className="auth-experience__eyebrow">{mode === "signup" ? "Start with three free directions" : "DIRECTR"}</span>
      <h1 id="auth-heading">{heading}</h1>
      <p className="auth-experience__intro">{detail}</p>

      {mode !== "reset" && (
        <button type="button" className="auth-google" onClick={signInWithGoogle} disabled={busy}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M21.8 12.2c0-.7-.1-1.3-.2-2H12v3.8h5.5c-.2 1.2-.9 2.3-1.9 3v2.5h3.1c1.8-1.7 3.1-4.2 3.1-7.3z"/><path fill="#34A853" d="M12 22c2.7 0 5-.9 6.7-2.5l-3.1-2.5c-.9.6-2.1 1-3.6 1-2.7 0-5-1.8-5.8-4.2H3v2.6C4.7 19.7 8.1 22 12 22z"/><path fill="#FBBC05" d="M6.2 13.8a6.2 6.2 0 0 1 0-3.7V7.5H3a10 10 0 0 0 0 9l3.2-2.7z"/><path fill="#EA4335" d="M12 6c1.5 0 2.8.5 3.8 1.5l2.8-2.8C17 3 14.7 2 12 2 8 2 4.7 4.3 3 7.5l3.2 2.6C7 7.8 9.3 6 12 6z"/></svg>
          Continue with Google
        </button>
      )}

      {mode !== "reset" && <div className="auth-divider"><span />or use email<span /></div>}

      <form className="auth-form" onSubmit={submit}>
        <label htmlFor="directr-email">Email address</label>
        <input id="directr-email" type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(event) => setEmail(event.target.value)} required disabled={busy} />
        {mode !== "reset" && <><label htmlFor="directr-password">Password</label><input id="directr-password" type="password" autoComplete={mode === "signup" ? "new-password" : "current-password"} minLength={6} placeholder={mode === "signup" ? "At least 6 characters" : "Your password"} value={password} onChange={(event) => setPassword(event.target.value)} required disabled={busy} /></>}
        {error && <p className="auth-feedback auth-feedback--error" role="alert">{error}</p>}
        {notice && <p className="auth-feedback auth-feedback--notice" role="status">{notice}</p>}
        <button type="submit" className="auth-submit" disabled={busy}>{busy ? "One moment…" : mode === "signup" ? "Create my account" : mode === "reset" ? "Send reset link" : "Sign in"}<span aria-hidden="true">→</span></button>
      </form>

      <div className="auth-experience__bottom">
        {mode === "signin" ? <><button type="button" onClick={() => changeMode("reset")}>Forgot password?</button><button type="button" onClick={() => changeMode("signup")}>Create an account</button></> : <button type="button" onClick={() => changeMode("signin")}>Already have an account? Sign in</button>}
      </div>
    </section>
  );
}
