// src/app/login/LoginForm.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase/client";

export default function LoginForm() {
  const router = useRouter();
  const sp = useSearchParams();

  const nextPath = useMemo(() => sp.get("next") || "/create", [sp]);

  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [err, setErr] = useState<string | null>(sp.get("err"));

  // ✅ Handles the OAuth return when Supabase puts tokens in the URL hash (#...)
  useEffect(() => {
    const run = async () => {
      if (typeof window === "undefined") return;

      const hash = window.location.hash || "";
      const hasOAuthReturn =
        hash.includes("access_token=") ||
        hash.includes("refresh_token=") ||
        hash.includes("error=");

      if (!hasOAuthReturn) return;

      const supabase = createBrowserClient();
      setOauthLoading(true);
      setErr(null);

      try {
        const { data, error } = await supabase.auth.getSessionFromUrl({
          storeSession: true,
        });

        // clean the hash so refresh doesn't re-run it
        window.history.replaceState({}, document.title, window.location.pathname + window.location.search);

        if (error) {
          setErr(error.message);
          return;
        }

        if (!data?.session) {
          setErr("OAuth returned, but no session was created.");
          return;
        }

        router.push(nextPath);
        router.refresh();
      } catch (e: any) {
        setErr(e?.message || "Google sign-in failed.");
      } finally {
        setOauthLoading(false);
      }
    };

    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    try {
      const supabase = createBrowserClient();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password: pw,
      });

      if (error) {
        setErr(error.message);
        return;
      }

      router.push(nextPath);
      router.refresh();
    } catch (e: any) {
      setErr(e?.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  }

  async function onGoogle() {
    setErr(null);
    setOauthLoading(true);

    try {
      const supabase = createBrowserClient();
      const origin = window.location.origin;

      // ✅ redirect back to /login so the client can read the hash and store session
      const redirectTo = `${origin}/login?next=${encodeURIComponent(nextPath)}`;

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo },
      });

      if (error) {
        setErr(error.message);
        setOauthLoading(false);
        return;
      }

      // ✅ force navigation
      if (data?.url) window.location.assign(data.url);
    } catch (e: any) {
      setErr(e?.message || "Google sign-in failed.");
      setOauthLoading(false);
    }
  }

  return (
    <div className="card" style={{ maxWidth: 520, margin: "0 auto" }}>
      <div className="card__head">
        <div>
          <div className="title">Sign in</div>
          <p className="subtitle">Access your Directr dashboard.</p>
        </div>
      </div>

      <button
        type="button"
        className="btn btn--primary"
        onClick={onGoogle}
        disabled={oauthLoading || loading}
        style={{ width: "100%", height: 44, borderRadius: 14 }}
      >
        {oauthLoading ? "Connecting to Google…" : "Continue with Google"}
      </button>

      <div style={{ height: 14 }} />

      <div style={{ display: "flex", alignItems: "center", gap: 12, opacity: 0.7, fontSize: 12 }}>
        <div style={{ height: 1, flex: 1, background: "rgba(255,255,255,.10)" }} />
        or
        <div style={{ height: 1, flex: 1, background: "rgba(255,255,255,.10)" }} />
      </div>

      <div style={{ height: 14 }} />

      <form onSubmit={onEmailLogin}>
        <div className="field">
          <span>Email</span>
          <input
            className="input"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            required
          />
        </div>

        <div style={{ height: 12 }} />

        <div className="field">
          <span>Password</span>
          <input
            className="input"
            type="password"
            autoComplete="current-password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            placeholder="••••••••"
            required
          />
        </div>

        <div style={{ height: 14 }} />

        <button
          className="btn btn--ghost"
          type="submit"
          disabled={loading || oauthLoading}
          style={{ width: "100%", height: 44, borderRadius: 14 }}
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>

        {err ? (
          <p style={{ marginTop: 12, fontSize: 13, color: "#ff6b6b" }}>{err}</p>
        ) : null}
      </form>
    </div>
  );
}
