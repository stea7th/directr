"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase/client";

export default function LoginForm() {
  const router = useRouter();
  const sp = useSearchParams();

  const supabase = useMemo(() => createBrowserClient(), []);
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password: pw,
      });

      if (error) {
        setErr(error.message);
        return;
      }

      router.push(sp.get("next") || "/");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function onGoogle() {
    setErr(null);
    setLoading(true);

    try {
      const origin = window.location.origin;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${origin}/auth/callback`,
        },
      });

      if (error) setErr(error.message);
      // On success, Supabase redirects away automatically
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card" style={{ maxWidth: 520, margin: "0 auto" }}>
      <div className="card__head">
        <div>
          <div className="title">Sign in</div>
          <div className="subtitle">Access your Directr account</div>
        </div>
      </div>

      <button
        type="button"
        className="btn btn--primary"
        onClick={onGoogle}
        disabled={loading}
        style={{ width: "100%", height: 44, borderRadius: 14 }}
      >
        Continue with Google
      </button>

      <div style={{ display: "flex", gap: 12, alignItems: "center", margin: "16px 0" }}>
        <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,.10)" }} />
        <div style={{ color: "rgba(255,255,255,.55)", fontSize: 12 }}>or</div>
        <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,.10)" }} />
      </div>

      <form onSubmit={onEmailLogin} className="field" style={{ gap: 10 }}>
        <span>Email</span>
        <input
          className="input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@email.com"
          autoComplete="email"
        />

        <span>Password</span>
        <input
          className="input"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          placeholder="••••••••"
          type="password"
          autoComplete="current-password"
        />

        <div className="actions" style={{ marginTop: 8 }}>
          <button className={`btn ${loading ? "btn--disabled" : ""}`} type="submit" disabled={loading}>
            Sign in
          </button>
        </div>

        {err ? <div style={{ color: "#fecaca", fontSize: 13 }}>{err}</div> : null}
      </form>
    </div>
  );
}
