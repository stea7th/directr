// src/app/reset/confirm/ConfirmClient.tsx
"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabase"; // adjust if your supabase helper lives elsewhere

export default function ConfirmClient() {
  const sp = useSearchParams();
  const router = useRouter();

  const [status, setStatus] = useState<"checking" | "need-password" | "saving" | "done" | "error">("checking");
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");

  // 1) Exchange the code from the URL for a session
  useEffect(() => {
    const code = sp.get("code");
    if (!code) {
      setError("Missing code in URL.");
      setStatus("error");
      return;
    }

    (async () => {
      try {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) throw error;
        setStatus("need-password");
      } catch (e: any) {
        setError(e?.message ?? "Could not verify the reset code.");
        setStatus("error");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once on mount

  // 2) Submit new password
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!password || password.length < 8) {
      setError("Please enter a password of at least 8 characters.");
      return;
    }
    if (password !== password2) {
      setError("Passwords do not match.");
      return;
    }

    setStatus("saving");
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setError(error.message);
      setStatus("need-password");
      return;
    }
    setStatus("done");
    // send them to your app/dashboard after a beat
    setTimeout(() => router.replace("/app"), 800);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#eaeaea", display: "grid", placeItems: "center", padding: 24 }}>
      <div style={{ width: 360, maxWidth: "100%", background: "#141414", border: "1px solid #2a2a2a", borderRadius: 12, padding: 20, boxShadow: "0 8px 30px rgba(0,0,0,.35)" }}>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 600, marginBottom: 12 }}>Reset your password</h1>

        {status === "checking" && (
          <p style={{ marginTop: 8, opacity: 0.8 }}>Validating your reset link…</p>
        )}

        {status === "need-password" && (
          <form onSubmit={onSubmit}>
            <label style={{ display: "block", fontSize: 13, opacity: 0.8, marginBottom: 6 }}>New password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter a new password"
              style={{
                width: "100%",
                background: "#0f0f0f",
                color: "#fff",
                border: "1px solid #2a2a2a",
                borderRadius: 8,
                padding: "10px 12px",
                marginBottom: 10,
                outline: "none",
              }}
            />
            <label style={{ display: "block", fontSize: 13, opacity: 0.8, marginBottom: 6 }}>Confirm password</label>
            <input
              type="password"
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
              placeholder="Re-enter your new password"
              style={{
                width: "100%",
                background: "#0f0f0f",
                color: "#fff",
                border: "1px solid #2a2a2a",
                borderRadius: 8,
                padding: "10px 12px",
                marginBottom: 12,
                outline: "none",
              }}
            />

            {error && <p style={{ color: "#fca5a5", fontSize: 13, marginTop: 4, marginBottom: 10 }}>{error}</p>}

            <button
              type="submit"
              disabled={status === "saving"}
              style={{
                width: "100%",
                background: "#0ea5e9",
                color: "#fff",
                border: 0,
                borderRadius: 8,
                padding: "10px 12px",
                cursor: "pointer",
                opacity: status === "saving" ? 0.6 : 1,
              }}
            >
              {status === "saving" ? "Saving…" : "Save password"}
            </button>
          </form>
        )}

        {status === "done" && <p style={{ marginTop: 8 }}>Password updated ✓ Redirecting…</p>}

        {status === "error" && (
          <>
            <p style={{ marginTop: 8, color: "#fca5a5" }}>{error}</p>
            <p style={{ marginTop: 8 }}>
              You can request a new reset link on the{" "}
              <a href="/reset" style={{ color: "#0ea5e9" }}>reset page</a>.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
