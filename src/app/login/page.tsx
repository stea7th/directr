"use client";

import { useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export default function LoginPage() {
  const supabase = useMemo(
    () =>
      createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: { persistSession: true },
      }),
    []
  );

  const [mode, setMode] = useState<"signin" | "reset">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function handleSignIn() {
    setLoading(true);
    setMsg(null);
    setErr(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setErr(error.message || "Could not sign in.");
    } else {
      setMsg("Signed in! Redirecting…");
      // optionally push to dashboard: window.location.href = "/planner";
    }
  }

  async function handleReset() {
    setLoading(true);
    setMsg(null);
    setErr(null);
    try {
      const origin =
        typeof window !== "undefined" ? window.location.origin : process.env.NEXT_PUBLIC_SITE_URL;
      const redirectTo = `${origin}/reset/confirm`;
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
      setLoading(false);
      if (error) setErr(error.message || "Could not send reset email.");
      else setMsg("Reset link sent. Check your email.");
    } catch (e: any) {
      setLoading(false);
      setErr(e?.message || "Something went wrong.");
    }
  }

  const buttonStyle: React.CSSProperties = {
    opacity: loading ? 0.8 : 1,
    cursor: loading ? "not-allowed" : "pointer",
    padding: "10px 14px",
    borderRadius: 8,
    border: "1px solid #e5e7eb",
    background: "white",
    fontWeight: 600,
  };

  return (
    <main className="mx-auto max-w-md p-6">
      <h1 className="text-2xl font-semibold">
        {mode === "signin" ? "Sign in" : "Reset password"}
      </h1>

      <div className="mt-4 space-y-3">
        <label className="block">
          <span className="text-sm text-gray-300">Email</span>
          <input
            type="email"
            className="mt-1 w-full rounded-lg border border-gray-600 bg-black p-2 text-white"
            placeholder="you@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>

        {mode === "signin" && (
          <label className="block">
            <span className="text-sm text-gray-300">Password</span>
            <input
              type="password"
              className="mt-1 w-full rounded-lg border border-gray-600 bg-black p-2 text-white"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
        )}

        {err && <p className="text-red-500 text-sm">{err}</p>}
        {msg && <p className="text-green-500 text-sm">{msg}</p>}

        {mode === "signin" ? (
          <button type="button" onClick={handleSignIn} disabled={loading} style={buttonStyle}>
            {loading ? "Signing in…" : "Sign in"}
          </button>
        ) : (
          <button type="button" onClick={handleReset} disabled={loading} style={buttonStyle}>
            {loading ? "Sending…" : "Send reset link"}
          </button>
        )}

        <div className="text-sm text-gray-400">
          {mode === "signin" ? (
            <>
              <button
                type="button"
                className="underline"
                onClick={() => {
                  setErr(null);
                  setMsg(null);
                  setMode("reset");
                }}
              >
                Forgot password?
              </button>
              <span className="mx-2">•</span>
              <Link href="/create" className="underline">
                Create account
              </Link>
            </>
          ) : (
            <>
              <button
                type="button"
                className="underline"
                onClick={() => {
                  setErr(null);
                  setMsg(null);
                  setMode("signin");
                }}
              >
                Back to sign in
              </button>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
