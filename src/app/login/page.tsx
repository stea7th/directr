"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setErr(error.message);
      return;
    }

    // refresh so server components pick up the session cookie
    window.location.href = "/create";
  }

  return (
    <div className="container" style={{ maxWidth: 520 }}>
      <h1 className="title">Sign in</h1>
      <p className="subtitle">Access your Directr account.</p>

      <form onSubmit={onSubmit} className="card" style={{ display: "grid", gap: 12 }}>
        <div className="field">
          <span>Email</span>
          <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>

        <div className="field">
          <span>Password</span>
          <input
            className="input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {err ? <div style={{ color: "#fecaca", fontSize: 13 }}>{err}</div> : null}

        <button className={`btn btn--primary ${loading ? "btn--disabled" : ""}`} disabled={loading}>
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </div>
  );
}
