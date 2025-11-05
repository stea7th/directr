"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

type Tab = "google" | "magic" | "password";

export default function LoginPage() {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const params = useSearchParams();

  const [tab, setTab] = useState<Tab>("google");
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  // optional: switch tab via URL like /login?tab=password
  useEffect(() => {
    const t = params.get("tab");
    if (t === "magic" || t === "password" || t === "google") setTab(t);
  }, [params]);

  // if already signed in, bounce home
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) router.replace("/");
    });
  }, [router, supabase]);

  const onGoogle = async () => {
    setErr(null); setMsg(null); setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
      // user will be redirected by Google → Supabase → /auth/callback
    } catch (e: any) {
      setErr(e.message ?? "Google sign-in failed");
      setLoading(false);
    }
  };

  const onMagic = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null); setMsg(null); setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
      setMsg("Magic link sent. Check your email.");
    } catch (e: any) {
      setErr(e.message ?? "Failed to send magic link");
    } finally {
      setLoading(false);
    }
  };

  const onPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null); setMsg(null); setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password: pwd });
      if (error) throw error;
      router.replace("/");
    } catch (e: any) {
      setErr(e.message ?? "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-zinc-900/60 p-6">
        <h1 className="text-xl font-semibold mb-2">Sign in to Directr</h1>
        <p className="text-sm text-zinc-400 mb-6">Choose a method below.</p>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setTab("google")}
            className={`px-3 py-2 rounded-lg text-sm border ${tab==="google" ? "bg-white text-black border-white" : "border-white/15 hover:bg-white/10"}`}
          >
            Google
          </button>
          <button
            onClick={() => setTab("magic")}
            className={`px-3 py-2 rounded-lg text-sm border ${tab==="magic" ? "bg-white text-black border-white" : "border-white/15 hover:bg-white/10"}`}
          >
            Magic Link
          </button>
          <button
            onClick={() => setTab("password")}
            className={`px-3 py-2 rounded-lg text-sm border ${tab==="password" ? "bg-white text-black border-white" : "border-white/15 hover:bg-white/10"}`}
          >
            Password
          </button>
        </div>

        {/* Messages */}
        {err && <div className="mb-4 text-sm text-red-400">{err}</div>}
        {msg && <div className="mb-4 text-sm text-emerald-400">{msg}</div>}

        {/* Panels */}
        {tab === "google" && (
          <div className="space-y-4">
            <button
              onClick={onGoogle}
              disabled={loading}
              className="w-full h-11 rounded-xl bg-white text-black font-medium hover:opacity-90 disabled:opacity-60"
            >
              {loading ? "Redirecting…" : "Continue with Google"}
            </button>
            <p className="text-xs text-zinc-400">
              We’ll redirect you to Google to continue.
            </p>
          </div>
        )}

        {tab === "magic" && (
          <form onSubmit={onMagic} className="space-y-3">
            <label className="block text-sm text-zinc-300">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full h-11 rounded-xl bg-zinc-800 border border-white/10 px-3 outline-none focus:ring-2 focus:ring-sky-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl bg-sky-500 font-medium hover:brightness-110 disabled:opacity-60"
            >
              {loading ? "Sending…" : "Send Magic Link"}
            </button>
          </form>
        )}

        {tab === "password" && (
          <form onSubmit={onPassword} className="space-y-3">
            <label className="block text-sm text-zinc-300">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full h-11 rounded-xl bg-zinc-800 border border-white/10 px-3 outline-none focus:ring-2 focus:ring-sky-500"
            />
            <label className="block text-sm text-zinc-300 mt-2">Password</label>
            <input
              type="password"
              required
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
              placeholder="••••••••"
              className="w-full h-11 rounded-xl bg-zinc-800 border border-white/10 px-3 outline-none focus:ring-2 focus:ring-sky-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl bg-white text-black font-medium hover:opacity-90 disabled:opacity-60"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
        )}

        {/* Helper links */}
        <div className="mt-6 text-xs text-zinc-400 space-y-1">
          <p>
            Don’t have an account?{" "}
            <a href="/signup" className="text-sky-400 hover:underline">Create one</a>
          </p>
          <p>
            Trouble?{" "}
            <a href="/reset" className="text-sky-400 hover:underline">Reset password</a>
          </p>
        </div>
      </div>
    </main>
  );
}
