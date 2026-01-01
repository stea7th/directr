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
        window.location.origin;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${origin}/auth/callback`,
        },
      });

      if (error) setErr(error.message);
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

      {/* Google button */}
      <button
        type="button"
        onClick={onGoogle}
        disabled={busy}
        className="btn google-btn"
      >
        <span className="google-icon">
          <svg viewBox="0 0 48 48" width="18" height="18">
            <path
              fill="#EA4335"
              d="M24 9.5c3.54 0 6.69 1.22 9.18 3.6l6.85-6.85C35.82 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.44 13.53 17.77 9.5 24 9.5z"
            />
            <path
              fill="#4285F4"
              d="M46.1 24.5c0-1.64-.15-3.21-.43-4.73H24v9.02h12.4c-.54 2.92-2.19 5.39-4.67 7.05l7.22 5.6C43.98 37.02 46.1 31.27 46.1 24.5z"
            />
            <path
              fill="#FBBC05"
              d="M10.54 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24s.92 7.54 2.56 10.78l7.98-6.19z"
            />
            <path
              fill="#34A853"
              d="M24 48c6.48 0 11.93-2.13 15.9-5.79l-7.22-5.6c-2.01 1.35-4.58 2.15-8.68 2.15-6.23 0-11.56-4.03-13.46-9.41l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
            />
          </svg>
        </span>
        <span>Continue with Google</span>
      </button>

      {/* Divider */}
      <div className="auth-divider">
        <span>or</span>
      </div>

      {/* Email login */}
      <form onSubmit={onEmailLogin}>
        <div className="field">
          <span>Email</span>
          <input
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@domain.com"
            autoComplete="email"
          />
        </div>

        <div className="field" style={{ marginTop: 12 }}>
          <span>Password</span>
          <input
            className="input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
          />
        </div>

        <div className="actions" style={{ marginTop: 14 }}>
          <button
            type="button"
            className="btn btn--ghost"
            onClick={() => router.push("/signup")}
            disabled={busy}
          >
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
