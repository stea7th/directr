"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginForm() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      router.push("/create");
      router.refresh();
    } catch (e: any) {
      setErr(e?.message ?? "Login failed");
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
      // Google will redirect away; no more code here
    } catch (e: any) {
      setErr(e?.message ?? "Google login failed");
      setLoading(false);
    }
  }

  return (
    <div className="card" style={{ maxWidth: 520, margin: "0 auto" }}>
      <div className="card__head">
        <div>
          <div className="title">Sign in</div>
          <div className="subtitle">Access your Directr account.</div>
        </div>
      </div>

      <button
        type="button"
        className="btn btn--primary"
        style={{ width: "100%", marginBottom: 12 }}
        onClick={onGoogle}
        disabled={loading}
      >
        Continue with Google
      </button>

      <form onSubmit={onEmailLogin} className="field" style={{ gap: 10 }}>
        <input
          className="input"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
        <input
          className="input"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />

        <button className="btn" type="submit" disabled={loading}>
          Sign in
        </button>

        {err && <div style={{ color: "#fecaca", fontSize: 13 }}>{err}</div>}
      </form>
    </div>
  );
}
