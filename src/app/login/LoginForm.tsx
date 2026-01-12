"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Mode = "signin" | "signup" | "reset";

function getSiteUrl() {
  if (typeof window !== "undefined") return window.location.origin;
  return process.env.NEXT_PUBLIC_SITE_URL || "";
}

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const nextPath = useMemo(() => {
    const n = searchParams.get("next");
    if (n && n.startsWith("/")) return n;
    return "/create";
  }, [searchParams]);

  const didRedirectRef = useRef(false);

  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true); // ✅ prevents weird flash states
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  function clearNotices() {
    setErr(null);
    setMsg(null);
  }

  function goNext() {
    if (didRedirectRef.current) return;
    didRedirectRef.current = true;
    router.replace(nextPath);
    router.refresh();
  }

  // ✅ Only redirect if the user is REAL (server-verified)
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setChecking(true);

        // getUser() verifies the JWT with Supabase (more reliable than getSession())
        const { data, error } = await supabase.auth.getUser();
        if (!mounted) return;

        if (!error && data?.user) {
          goNext();
          return;
        }
      } catch {
        // ignore
      } finally {
        if (mounted) setChecking(false);
      }
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      // Only redirect on actual sign-in (prevents random redirects)
      if (
        (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") &&
        session?.user
      ) {
        goNext();
      }
    });

    return () => {
      mounted = false;
      sub?.subscription?.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nextPath]);

  async function onEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    clearNotices();

    if (!email) {
      setErr("Enter your email.");
      return;
    }

    if (mode !== "reset" && !password) {
      setErr("Enter email and password.");
      return;
    }

    if (mode === "signup" && password.length < 6) {
      setErr("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || getSiteUrl();
      const redirectTo = `${siteUrl}/auth/callback?next=${encodeURIComponent(
        nextPath
      )}`;

      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;

        // ✅ verify real user session (prevents “signed in but not signed in”)
        const { data, error: uErr } = await supabase.auth.getUser();
        if (uErr || !data?.user) {
          throw new Error("Sign-in didn’t stick. Refresh and try again.");
        }

        goNext();
        return;
      }

      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: redirectTo },
        });

        if (error) throw error;

        setMsg("Account created. Check your email to confirm, then sign in.");
        setMode("signin");
        setPassword("");
        return;
      }

      // RESET PASSWORD
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
      });

      if (error) throw error;

      setMsg("Password reset link sent. Check your email.");
    } catch (e: any) {
      setErr(e?.message ?? "Authentication failed");
    } finally {
      setLoading(false);
    }
  }

  async function onGoogle() {
    clearNotices();
    setLoading(true);
    try {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || getSiteUrl();
      const redirectTo = `${siteUrl}/auth/callback?next=${encodeURIComponent(
        nextPath
      )}`;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo },
      });

      if (error) throw error;
    } catch (e: any) {
      setErr(e?.message ?? "Google login failed");
      setLoading(false);
    }
  }

  const title =
    mode === "signin"
      ? "Sign in"
      : mode === "signup"
      ? "Create account"
      : "Reset password";

  const subtitle =
    mode === "signin"
      ? "Access your Directr account."
      : mode === "signup"
      ? "Create your Directr account in seconds."
      : "We’ll email you a reset link.";

  // Optional: while checking auth, keep the card so it doesn't “flash away”
  // (it'll redirect only if truly authed)
  if (checking) {
    return (
      <div className="card" style={{ maxWidth: 520, margin: "0 auto" }}>
        <div className="card__head">
          <div>
            <div className="title">Sign in</div>
            <div className="subtitle">Checking session…</div>
          </div>
        </div>
        <div style={{ fontSize: 13, opacity: 0.7 }}> </div>
      </div>
    );
  }

  return (
    <div className="card" style={{ maxWidth: 520, margin: "0 auto" }}>
      <div className="card__head">
        <div>
          <div className="title">{title}</div>
          <div className="subtitle">{subtitle}</div>
        </div>
      </div>

      {/* GOOGLE (hide on reset) */}
      {mode !== "reset" && (
        <button
          type="button"
          className="btn btn--primary"
          style={{ width: "100%", marginBottom: 12 }}
          onClick={onGoogle}
          disabled={loading}
        >
          Continue with Google
        </button>
      )}

      {/* EMAIL FORM */}
      <form onSubmit={onEmailSubmit} className="field" style={{ gap: 10 }}>
        <input
          className="input"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          disabled={loading}
        />

        {mode !== "reset" && (
          <input
            className="input"
            placeholder={
              mode === "signin" ? "Password" : "Create password (6+ chars)"
            }
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            disabled={loading}
          />
        )}

        <button className="btn" type="submit" disabled={loading}>
          {loading
            ? mode === "signin"
              ? "Signing in…"
              : mode === "signup"
              ? "Creating account…"
              : "Sending link…"
            : mode === "signin"
            ? "Sign in"
            : mode === "signup"
            ? "Create account"
            : "Send reset link"}
        </button>

        {err && <div style={{ color: "#fecaca", fontSize: 13 }}>{err}</div>}
        {msg && <div style={{ color: "#bbf7d0", fontSize: 13 }}>{msg}</div>}

        {/* Forgot password (only on signin) */}
        {mode === "signin" && (
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 2 }}>
            <button
              type="button"
              className="btn btn--ghost"
              style={{ padding: 0, fontSize: 13, opacity: 0.9 }}
              onClick={() => {
                clearNotices();
                setMode("reset");
              }}
              disabled={loading}
            >
              Forgot password?
            </button>
          </div>
        )}
      </form>

      {/* TOGGLE */}
      <div
        style={{
          marginTop: 14,
          fontSize: 13,
          textAlign: "center",
          opacity: 0.85,
        }}
      >
        {mode === "signin" ? (
          <>
            New here?{" "}
            <button
              type="button"
              className="btn btn--ghost"
              style={{ padding: 0 }}
              onClick={() => {
                clearNotices();
                setMode("signup");
              }}
              disabled={loading}
            >
              Create an account
            </button>
          </>
        ) : mode === "signup" ? (
          <>
            Already have an account?{" "}
            <button
              type="button"
              className="btn btn--ghost"
              style={{ padding: 0 }}
              onClick={() => {
                clearNotices();
                setMode("signin");
              }}
              disabled={loading}
            >
              Sign in
            </button>
          </>
        ) : (
          <>
            Remembered it?{" "}
            <button
              type="button"
              className="btn btn--ghost"
              style={{ padding: 0 }}
              onClick={() => {
                clearNotices();
                setMode("signin");
              }}
              disabled={loading}
            >
              Back to sign in
            </button>
          </>
        )}
      </div>
    </div>
  );
}
