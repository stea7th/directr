// src/app/login/page.tsx
"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMsg(null);

    if (!email.trim()) {
      setError("Enter your email first.");
      return;
    }

    setSending(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          // ✅ both email + OAuth come back through /auth/callback
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        setError(error.message);
      } else {
        setMsg("Magic link sent. Check your email.");
      }
    } catch (err: any) {
      setError(err?.message || "Unexpected error");
    } finally {
      setSending(false);
    }
  }

  async function handleGoogle() {
    setError(null);
    setMsg(null);

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (error) {
        console.error("Google sign-in error:", error);
        setError(error.message);
      } else {
        console.log("Google sign-in started:", data);
        // Supabase will redirect you, no need to do anything else here
      }
    } catch (err: any) {
      console.error("Google sign-in unexpected error:", err);
      setError(err?.message || "Unexpected error");
    }
  }

  return (
    <main
      style={{
        minHeight: "calc(100vh - 64px)",
        padding: "72px 24px",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          padding: 24,
          borderRadius: 24,
          background: "#050506",
          border: "1px solid rgba(255,255,255,0.06)",
          boxShadow: "0 20px 45px rgba(0,0,0,0.9)",
        }}
      >
        <h1
          style={{
            fontSize: 24,
            fontWeight: 600,
            color: "#f5f5f7",
            marginBottom: 16,
          }}
        >
          Sign in
        </h1>

        <button
          type="button"
          onClick={handleGoogle}
          style={{
            width: "100%",
            padding: "10px 16px",
            borderRadius: 999,
            border: "1px solid rgba(255,255,255,0.12)",
            background: "#11131a",
            color: "#f5f5f7",
            fontSize: 14,
            cursor: "pointer",
            marginBottom: 16,
          }}
        >
          Continue with Google
        </button>

        <div
          style={{
            height: 1,
            background: "rgba(255,255,255,0.08)",
            margin: "16px 0",
          }}
        />

        <form onSubmit={handleMagicLink}>
          <label
            style={{
              display: "block",
              fontSize: 12,
              color: "rgba(255,255,255,0.6)",
              marginBottom: 6,
            }}
          >
            Or sign in with a magic link
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            style={{
              width: "100%",
              padding: "9px 12px",
              borderRadius: 999,
              border: "1px solid rgba(255,255,255,0.16)",
              background: "#090b10",
              color: "#f5f5f7",
              fontSize: 13,
              marginBottom: 10,
              outline: "none",
            }}
          />
          <button
            type="submit"
            disabled={sending}
            style={{
              width: "100%",
              padding: "9px 16px",
              borderRadius: 999,
              border: "none",
              background: sending ? "#333745" : "#2563eb",
              color: "#f5f5f7",
              fontSize: 14,
              cursor: sending ? "default" : "pointer",
            }}
          >
            {sending ? "Sending..." : "Send magic link"}
          </button>
        </form>

        {error && (
          <p
            style={{
              marginTop: 10,
              fontSize: 12,
              color: "#ff7b7b",
            }}
          >
            {error}
          </p>
        )}
        {msg && !error && (
          <p
            style={{
              marginTop: 10,
              fontSize: 12,
              color: "rgba(180,255,180,0.8)",
            }}
          >
            {msg}
          </p>
        )}
      </div>
    </main>
  );
}
