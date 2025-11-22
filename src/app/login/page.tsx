// src/app/login/page.tsx
"use client";

import { FormEvent, useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase =
  typeof window !== "undefined"
    ? createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
    : (null as any);

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // When you land on /login *from the magic link*,
  // this checks if Supabase already has a session for you.
  useEffect(() => {
    if (!supabase) return;

    (async () => {
      const { data, error } = await supabase.auth.getUser();
      console.log("Supabase getUser on /login:", { data, error });

      if (data?.user) {
        // Already signed in -> send to main app
        window.location.replace("/create");
      }
    })();
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);

    const trimmed = email.trim();
    if (!trimmed) {
      setError("Enter your email first.");
      return;
    }

    setSending(true);
    try {
      const origin =
        typeof window !== "undefined" ? window.location.origin : "";

      const { error } = await supabase.auth.signInWithOtp({
        email: trimmed,
        options: {
          // ✅ IMPORTANT: send the user through /auth/callback,
          // which will set the cookie, THEN redirect to /create.
          emailRedirectTo: `${origin}/auth/callback?next=/create`,
        },
      });

      if (error) {
        setError(error.message);
      } else {
        setMessage("Magic link sent. Check your email.");
      }
    } catch (err: any) {
      console.error("Magic link error:", err);
      setError(err?.message || "Something went wrong.");
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="login-root">
      <section className="login-card">
        <h1>Sign in</h1>
        <p className="login-sub">
          Drop your email and we&apos;ll send you a magic link.
        </p>

        <form onSubmit={handleSubmit} className="login-form">
          <label className="login-label">
            Email
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </label>

          <button type="submit" disabled={sending}>
            {sending ? "Sending..." : "Send Magic Link"}
          </button>
        </form>

        {error && <p className="login-error">{error}</p>}
        {message && !error && <p className="login-message">{message}</p>}
      </section>

      <style jsx>{`
        .login-root {
          min-height: calc(100vh - 64px);
          padding: 72px 16px 80px;
          background: radial-gradient(
              circle at top,
              rgba(255, 255, 255, 0.03),
              transparent 55%
            ),
            #050506;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .login-card {
          width: 100%;
          max-width: 420px;
          border-radius: 24px;
          padding: 28px 24px 24px;
          background: radial-gradient(
                circle at 0% 0%,
                rgba(111, 146, 255, 0.08),
                transparent 45%
              ),
            #101014;
          border: 1px solid rgba(255, 255, 255, 0.05);
          box-shadow:
            0 28px 60px rgba(0, 0, 0, 0.85),
            inset 0 0 0 0.5px rgba(255, 255, 255, 0.02);
        }

        .login-card h1 {
          font-size: 24px;
          font-weight: 600;
          color: #f5f5f7;
          margin-bottom: 6px;
        }

        .login-sub {
          font-size: 13px;
          color: rgba(255, 255, 255, 0.6);
          margin-bottom: 18px;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .login-label {
          display: flex;
          flex-direction: column;
          gap: 6px;
          font-size: 12px;
          color: rgba(255, 255, 255, 0.7);
        }

        .login-label input {
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: rgba(5, 6, 9, 0.95);
          padding: 9px 14px;
          font-size: 13px;
          color: #f5f5f7;
          outline: none;
        }

        .login-label input::placeholder {
          color: rgba(255, 255, 255, 0.38);
        }

        .login-card button {
          margin-top: 6px;
          border-radius: 999px;
          border: 1px solid rgba(139, 187, 255, 0.7);
          background: radial-gradient(
                circle at 0% 0%,
                rgba(139, 187, 255, 0.45),
                rgba(50, 80, 130, 0.6)
              ),
            #171c26;
          color: #f5f7ff;
          font-weight: 500;
          font-size: 14px;
          padding: 10px 20px;
          cursor: pointer;
          box-shadow:
            0 0 0 1px rgba(20, 40, 70, 0.7),
            0 12px 30px rgba(0, 0, 0, 0.9);
          transition:
            transform 0.18s ease-out,
            box-shadow 0.18s ease-out,
            filter 0.18s ease-out;
        }

        .login-card button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow:
            0 0 0 1px rgba(148, 202, 255, 0.8),
            0 18px 45px rgba(0, 0, 0, 1);
          filter: brightness(1.03);
        }

        .login-card button:disabled {
          opacity: 0.75;
          cursor: default;
        }

        .login-error {
          margin-top: 10px;
          font-size: 12px;
          color: #ff7b7b;
        }

        .login-message {
          margin-top: 10px;
          font-size: 12px;
          color: #8fd68f;
        }
      `}</style>
    </main>
  );
}
