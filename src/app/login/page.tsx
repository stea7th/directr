"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${location.origin}/` },
    });
    setLoading(false);
    if (error) setErr(error.message); else setSent(true);
  }

  return (
    <main className="container" style={{ maxWidth: 420, marginTop: 48 }}>
      <h1 className="title">Sign in</h1>
      {sent ? (
        <div className="card">Check your inbox for the magic link.</div>
      ) : (
        <form onSubmit={onSubmit} className="card" style={{ display: "grid", gap: 12 }}>
          <input
            className="input"
            type="email"
            placeholder="you@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button className="btn btn--primary" disabled={loading}>
            {loading ? "Sending..." : "Send magic link"}
          </button>
          {err && <div className="job__err">{err}</div>}
        </form>
      )}
    </main>
  );
}
