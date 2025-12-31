"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase/client";

export default function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();

  const supabase = useMemo(() => createBrowserClient(), []);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"password" | "magic">("password");

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(params.get("msg"));
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setMsg(null);
    setLoading(true);

    try {
      if (!email.trim()) throw new Error("Enter your email.");

      // Magic link mode
      if (mode === "magic") {
        const { error } = await supabase.auth.signInWithOtp({
          email: email.trim(),
          options: { emailRedirectTo: `${window.location.origin}/create` },
        });
        if (error) throw error;

        setMsg("Check your email for a sign-in link.");
        return;
      }

      // Email + password mode
      if (!password) throw new Error("Enter your password.");

      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) throw error;

      router.push("/create");
      router.refresh();
    } catch (e: any) {
      setErr(e?.message || "Sign in failed.");
    } finally {
      setLoading(false);
    }
  }

  async function onSignup() {
    setErr(null);
    setMsg(null);
    setLoading(true);

    try {
      if (!email.trim()) throw new Error("Enter your email.");
      if (!password) throw new Error("Enter a password.");

      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { emailRedirectTo: `${window.location.origin}/create` },
      });

      if (error) throw error;
      setMsg("Account created. Check email to confirm if required.");
    } catch (e: any) {
      setErr(e?.message || "Sign up failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="field" style={{ gap: 10 }}>
      <div className="field">
        <span>Email</span>
        <input
          className="input"
          autoComplete="email"
          inputMode="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@domain.com"
        />
      </div>

      {mode === "password" && (
        <div className="field">
          <span>Password</span>
          <input
            className="input"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>
      )}

      <div className="actions" style={{ marginTop: 6 }}>
        <button
          type="submit"
          className={`btn btn--primary ${loading ? "btn--disabled" : ""}`}
          disabled={loading}
        >
          {loading ? "Working..." : mode === "magic" ? "Send link" : "Sign in"}
        </button>

        {mode === "password" && (
          <button
            type="button"
            className={`btn ${loading ? "btn--disabled" : ""}`}
            disabled={loading}
            onClick={onSignup}
          >
            Sign up
          </button>
        )}
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 2 }}>
        <button
          type="button"
          className="btn btn--ghost"
          onClick={() => setMode(mode === "password" ? "magic" : "password")}
          disabled={loading}
        >
          {mode === "password" ? "Use magic link" : "Use password"}
        </button>
      </div>

      {err && <div style={{ color: "#fecaca", fontSize: 13 }}>{err}</div>}
      {msg && <div style={{ color: "#86efac", fontSize: 13 }}>{msg}</div>}
    </form>
  );
}
