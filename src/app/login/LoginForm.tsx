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

  // ✅ Finish Google OAuth on return (supports BOTH code + hash)
  useEffect(() => {
    const run = async () => {
      if (typeof window === "undefined") return;

      const supabase = createBrowserClient();

      const url = new URL(window.location.href);
      const code = url.searchParams.get("code");

      const hash = window.location.hash?.startsWith("#")
        ? window.location.hash.slice(1)
        : "";
      const hashParams = new URLSearchParams(hash);

      const hashError =
        hashParams.get("error_description") || hashParams.get("error");
      const access_token = hashParams.get("access_token");
      const refresh_token = hashParams.get("refresh_token");

      const hasSomethingToHandle =
        !!code || !!hashError || (!!access_token && !!refresh_token);

      if (!hasSomethingToHandle) return;

      setOauthLoading(true);
      setErr(null);

      try {
        if (hashError) {
          throw new Error(hashError);
        }

        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;

          // clean URL (remove code)
          url.searchParams.delete("code");
          window.history.replaceState({}, document.title, url.toString());
        } else if (access_token && refresh_token) {
          const { error } = await supabase.auth.setSession({
            access_token,
            refresh_token,
          });
          if (error) throw error;

          // clean URL (remove hash tokens)
          window.history.replaceState(
            {},
            document.title,
            window.location.pathname + window.location.search
          );
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

      // ✅ Always come back to /login so this file can finish the session
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

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          opacity: 0.7,
          fontSize: 12,
        }}
      >
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
