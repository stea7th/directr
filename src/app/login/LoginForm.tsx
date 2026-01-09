"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Mode = "signin" | "signup";

export default function LoginForm() {
  const router = useRouter();
  const supabase = createClient();

  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  async function onEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setMsg(null);

    if (!email || !password) {
      setErr("Enter email and password.");
      return;
    }

    if (mode === "signup" && password.length < 6) {
      setErr("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;

        router.push("/create");
        router.refresh();
        return;
      }

      // SIGN UP
      const redirectTo = `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=/create`;

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: redirectTo },
      });

      if (error) throw error;

      setMsg("Account created. Check your email to confirm, then sign in.");
      setMode("signin");
      setPassword("");
    } catch (e: any) {
      setErr(e?.message ?? "Authentication failed");
    } finally {
      setLoading(false);
    }
  }

  async function onGoogle() {
    setErr(null);
    setLoading(true);
    try {
      const redirectTo = `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=/create`;

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

  return (
    <div className="card" style={{ maxWidth: 520, margin: "0 auto" }}>
      <div className="card__head">
        <div>
          <div className="title">
            {mode === "signin" ? "Sign in" : "Create account"}
          </div>
          <div className="subtitle">
            {mode === "signin"
              ? "Access your Directr account."
              : "Create your Directr account in seconds."}
          </div>
        </div>
      </div>

      {/* GOOGLE */}
      <button
        type="button"
        className="btn btn--primary"
        style={{ width: "100%", marginBottom: 12 }}
        onClick={onGoogle}
        disabled={loading}
      >
        Continue with Google
      </button>

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

        <input
          className="input"
          placeholder={
            mode === "signin" ? "Password" : "Create password (6+ chars)"
          }
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete={
            mode === "signin" ? "current-password" : "new-password"
          }
          disabled={loading}
        />

        <button className="btn" type="submit" disabled={loading}>
          {loading
            ? mode === "signin"
              ? "Signing in…"
              : "Creating account…"
            : mode === "signin"
            ? "Sign in"
            : "Create account"}
        </button>

        {err && <div style={{ color: "#fecaca", fontSize: 13 }}>{err}</div>}
        {msg && <div style={{ color: "#bbf7d0", fontSize: 13 }}>{msg}</div>}
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
                setErr(null);
                setMsg(null);
                setMode("signup");
              }}
              disabled={loading}
            >
              Create an account
            </button>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <button
              type="button"
              className="btn btn--ghost"
              style={{ padding: 0 }}
              onClick={() => {
                setErr(null);
                setMsg(null);
                setMode("signin");
              }}
              disabled={loading}
            >
              Sign in
            </button>
          </>
        )}
      </div>
    </div>
  );
}
