// src/app/reset/confirm/page.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useSearchParams, useRouter } from "next/navigation";

export default function ResetConfirmPage() {
  const params = useSearchParams();
  const router = useRouter();

  const [stage, setStage] = useState<"checking" | "ready" | "done">("checking");
  const [error, setError] = useState<string | null>(null);
  const [pw1, setPw1] = useState("");
  const [pw2, setPw2] = useState("");
  const [busy, setBusy] = useState(false);

  // When Supabase redirects here, the URL has ?code=... (PKCE)
  useEffect(() => {
    const code = params.get("code");
    if (!code) {
      setError("Missing code in URL.");
      setStage("ready"); // still show form so user sees error
      return;
    }

    (async () => {
      try {
        // Exchange the one-time code for a session
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) throw error;
        if (!data.session) throw new Error("No session created");
        setStage("ready");
      } catch (e: any) {
        setError(e?.message ?? "Could not verify reset link.");
        setStage("ready");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (pw1.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (pw1 !== pw2) {
      setError("Passwords do not match.");
      return;
    }
    setBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: pw1 });
      if (error) throw error;
      setStage("done");
      setTimeout(() => router.push("/login"), 1200);
    } catch (e: any) {
      setError(e?.message ?? "Could not set new password.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container">
      <h1 className="title">Set a new password</h1>
      <p className="subtitle">Choose a strong password you don’t use elsewhere.</p>

      {stage === "checking" ? (
        <div className="card"><p>Validating your reset link…</p></div>
      ) : stage === "done" ? (
        <div className="card"><p>✅ Password updated. Redirecting to sign in…</p></div>
      ) : (
        <form className="card" onSubmit={onSubmit} style={{maxWidth:480}}>
          <label className="field">
            <span>New password</span>
            <input
              className="input"
              type="password"
              value={pw1}
              onChange={(e) => setPw1(e.target.value)}
              required
            />
          </label>

          <label className="field" style={{marginTop:10}}>
            <span>Confirm password</span>
            <input
              className="input"
              type="password"
              value={pw2}
              onChange={(e) => setPw2(e.target.value)}
              required
            />
          </label>

          {error && <p className="job__err" style={{marginTop:10}}>{error}</p>}

          <div className="actions" style={{marginTop:14}}>
            <button className="btn btn--primary" disabled={busy}>
              {busy ? "Saving…" : "Save new password"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
