// src/app/login/LoginForm.tsx
"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase/client";

export default function LoginForm() {
  const router = useRouter();
  const sp = useSearchParams();

  const supabase = useMemo(() => createBrowserClient(), []);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [busy, setBusy] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);
  const [err, setErr] = useState<string | null>(sp.get("err"));

  async function onEmailPassword(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setErr(error.message);
        return;
      }
      router.replace("/");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function onGoogle() {
    setErr(null);
    setGoogleBusy(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          // ✅ absolute URL so it works on prod + previews
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) setErr(error.message);
    } finally {
      setGoogleBusy(false);
    }
  }

  return (
    <div className="card" style={{ maxWidth: 420, margin: "0 auto" }}>
      <div className="title">Sign in</div>
      <p className="subtitle">Access your Directr account.</p>

      <button
        type="button"
        className="btn btn--primary"
        style={{ width: "100%", height: 44, borderRadius: 14, lineHeight: "44px" }}
        onClick={onGoogle}
        disabled={googleBusy || busy}
      >
        {googleBusy ? "Opening Google…" : "Continue with Google"}
      </button>

      <div style={{ height: 14 }} />

      <form onSubmit={onEmailPassword}>
        <div className="field">
          <span>Email</span>
          <input
            className="input"
            style={{ height: 44, borderRadius: 14 }}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
          />
        </div>

        <div style={{ height: 12 }} />

        <div className="field">
          <span>Password</span>
          <input
            className="input"
            style={{ height: 44, borderRadius: 14 }}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
          />
        </div>

        {err ? (
          <p style={{ margin: "10px 0 0", fontSize: 13, color: "#fecaca" }}>
            {err}
          </p>
        ) : null}

        <div style={{ height: 12 }} />

        <button
          className="btn"
          style={{ width: "100%", height: 44, borderRadius: 14, lineHeight: "44px" }}
          type="submit"
          disabled={busy || googleBusy}
        >
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
