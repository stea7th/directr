"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase/client";

export default function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();

  const supabase = useMemo(() => createBrowserClient(), []);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onEmailLogin(e: React.FormEvent) {
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

      // force refresh of server components / cookies
      router.refresh();
      router.push(search.get("next") || "/create");
    } finally {
      setBusy(false);
    }
  }

  async function onGoogle() {
    setErr(null);
    setBusy(true);

    try {
      const origin =
        process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
        (typeof window !== "undefined" ? window.location.origin : "");

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${origin}/auth/callback`,
        },
      });

      if (error) setErr(error.message);
      // If successful, Supabase redirects away, so no need to do anything else.
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card" style={{ maxWidth: 520, margin: "0 auto" }}>
      <div className="card__head">
        <div>
          <div className="title">Sign in</div>
          <div className="subtitle">Access your Directr workspace.</div>
        </div>
      </div>

      {/* Google */}
      <button
        type="button"
        className="btn btn--primary"
        onClick={onGoogle}
        disabled={busy}
        style={{ width: "100%", height: 44, borderRadius: 14 }}
      >
        Continue with Google
      </button>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          margin: "16px 0",
          opacity: 0.8,
        }}
      >
        <div style={{ height: 1, background: "rgba(255,255,255,.10)", flex: 1 }} />
        <div style={{ fontSize: 12, color: "rgba(255,255,255,.65)" }}>or</div>
        <div style={{ height: 1, background: "rgba(255,255,255,.10)", flex: 1 }} />
      </div>

      {/* Email / Password */}
      <form onSubmit={onEmailLogin}>
        <div className="field">
          <span>Email</span>
          <input
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@domain.com"
            autoComplete="email"
            inputMode="email"
          />
        </div>

        <div className="field" style={{ marginTop: 12 }}>
          <span>Password</span>
          <input
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
            type="password"
          />
        </div>

        <div className="actions" style={{ marginTop: 14 }}>
          <button className="btn btn--ghost" type="button" onClick={() => router.push("/signup")} disabled={busy}>
            Create account
          </button>
          <button className="btn btn--primary" type="submit" disabled={busy}>
            {busy ? "Signing in..." : "Sign in"}
          </button>
        </div>

        {err && (
          <div style={{ marginTop: 12, fontSize: 13, color: "#fecaca" }}>
            {err}
          </div>
        )}
      </form>
    </div>
  );
}
