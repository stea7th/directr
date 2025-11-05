"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Tab = "google" | "magic" | "password";

export default function LoginPage() {
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get("next") || "/";

  const supabase = createClient();
  const [tab, setTab] = useState<Tab>("google");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  // shared fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function signInWithGoogle() {
    try {
      setErr(null); setMsg(null); setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`
        }
      });
      if (error) throw error;
      // OAuth will redirect — nothing else to do
    } catch (e: any) {
      setErr(e.message || "Google sign-in failed.");
      setLoading(false);
    }
  }

  async function sendMagicLink() {
    try {
      setErr(null); setMsg(null); setLoading(true);
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`
        }
      });
      if (error) throw error;
      setMsg("Check your email for a magic link.");
    } catch (e: any) {
      setErr(e.message || "Could not send magic link.");
    } finally {
      setLoading(false);
    }
  }

  async function signInWithPassword() {
    try {
      setErr(null); setMsg(null); setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      router.replace(next);
      router.refresh();
    } catch (e: any) {
      setErr(e.message || "Sign-in failed.");
    } finally {
      setLoading(false);
    }
  }

  async function resetPassword() {
    try {
      setErr(null); setMsg(null); setLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`
      });
      if (error) throw error;
      setMsg("Password reset email sent.");
    } catch (e: any) {
      setErr(e.message || "Could not send reset email.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--bg,#0a0a0a)] text-white">
      {/* Simple header */}
      <header className="sticky top-0 z-10 border-b border-white/10 bg-black/40 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <a href="/" className="font-semibold tracking-tight">directr<span className="text-sky-400">.</span></a>
          <a href="/" className="rounded-xl border border-white/10 px-3 py-1.5 text-sm text-white/80 hover:bg-white/5">Home</a>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4">
        <div className="mx-auto mt-14 w-full max-w-md rounded-2xl border border-white/10 bg-zinc-900/70 p-6 shadow-xl">
          <h1 className="mb-2 text-2xl font-semibold">Sign in to Directr</h1>
          <p className="mb-6 text-sm text-white/60">Choose a method below.</p>

          {/* Tabs */}
          <div className="mb-5 flex gap-2">
            <button
              onClick={() => setTab("google")}
              className={`rounded-lg px-3 py-1.5 text-sm ${tab === "google" ? "bg-white text-black" : "border border-white/15 text-white/80 hover:bg-white/5"}`}
            >
              Google
            </button>
            <button
              onClick={() => setTab("magic")}
              className={`rounded-lg px-3 py-1.5 text-sm ${tab === "magic" ? "bg-white text-black" : "border border-white/15 text-white/80 hover:bg-white/5"}`}
            >
              Magic Link
            </button>
            <button
              onClick={() => setTab("password")}
              className={`rounded-lg px-3 py-1.5 text-sm ${tab === "password" ? "bg-white text-black" : "border border-white/15 text-white/80 hover:bg-white/5"}`}
            >
              Password
            </button>
          </div>

          {/* Alerts */}
          {err && <div className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">{err}</div>}
          {msg && <div className="mb-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">{msg}</div>}

          {/* Panels */}
          {tab === "google" && (
            <div className="space-y-4">
              <button
                onClick={signInWithGoogle}
                disabled={loading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-medium text-black hover:opacity-95 disabled:opacity-60"
              >
                Continue with Google
              </button>
            </div>
          )}

          {tab === "magic" && (
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs text-white/70">Email</label>
                <input
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-white/10 bg-zinc-800/80 px-3 py-2 text-sm outline-none ring-0 placeholder:text-white/40 focus:border-white/20 focus:ring-2 focus:ring-sky-500/40"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <button
                onClick={sendMagicLink}
                disabled={loading || !email}
                className="w-full rounded-xl bg-white px-4 py-3 text-sm font-medium text-black hover:opacity-95 disabled:opacity-60"
              >
                Send magic link
              </button>
            </div>
          )}

          {tab === "password" && (
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs text-white/70">Email</label>
                <input
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  className="w-full rounded-xl border border-white/10 bg-zinc-800/80 px-3 py-2 text-sm outline-none focus:border-white/20 focus:ring-2 focus:ring-sky-500/40"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-white/70">Password</label>
                <input
                  type="password"
                  autoComplete="current-password"
                  className="w-full rounded-xl border border-white/10 bg-zinc-800/80 px-3 py-2 text-sm outline-none focus:border-white/20 focus:ring-2 focus:ring-sky-500/40"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
              <button
                onClick={signInWithPassword}
                disabled={loading || !email || !password}
                className="w-full rounded-xl bg-white px-4 py-3 text-sm font-medium text-black hover:opacity-95 disabled:opacity-60"
              >
                Sign in
              </button>

              <div className="text-center">
                <button
                  onClick={resetPassword}
                  className="text-sm text-sky-400 hover:underline"
                  type="button"
                >
                  Reset password
                </button>
              </div>
            </div>
          )}

          <div className="mt-6 flex items-center justify-between text-sm text-white/60">
            <a href="/signup" className="text-sky-400 hover:underline">Create one</a>
            <a href="/" className="text-white/60 hover:text-white">Back to home</a>
          </div>
        </div>
      </main>
    </div>
  );
}
