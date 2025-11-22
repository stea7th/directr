"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const supabase = createBrowserClient();
  const searchParams = useSearchParams();

  const callbackError = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const error = localError || callbackError;

  async function sendMagicLink() {
    setLocalError(null);
    setMagicLinkSent(false);

    if (!email.trim()) {
      setLocalError("Add your email first.");
      return;
    }

    setLoading(true);
    try {
      const redirectTo = `${window.location.origin}/auth/callback`;

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: redirectTo },
      });

      if (error) {
        console.error("Magic link error:", error);
        setLocalError(error.message);
        return;
      }

      setMagicLinkSent(true);
    } catch (err: any) {
      console.error("Magic link error:", err);
      setLocalError(err?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function signInWithGoogle() {
    setLocalError(null);

    try {
      const redirectTo = `${window.location.origin}/auth/callback`;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo },
      });

      if (error) {
        console.error("Google sign-in error:", error);
        setLocalError(error.message);
      }
      // Supabase will redirect; no need to do anything else here.
    } catch (err: any) {
      console.error("Google sign-in error:", err);
      setLocalError(err?.message || "Something went wrong.");
    }
  }

  return (
    <main className="login-root">
      <section className="login-card">
        <h1 className="login-title">Sign in</h1>
        <p className="login-subtitle">
          Use a magic link or Google to get into Directr.
        </p>

        <div className="login-field">
          <label>Email</label>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <button
          type="button"
          className="login-btn login-btn--primary"
          onClick={sendMagicLink}
          disabled={loading}
        >
          {loading ? "Sending..." : "Send magic link"}
        </button>

        <div className="login-divider">
          <span />
          <p>or</p>
          <span />
        </div>

        <button
          type="button"
          className="login-btn login-btn--ghost"
          onClick={signInWithGoogle}
        >
          Continue with Google
        </button>

        {magicLinkSent && (
          <p className="login-success">
            Magic link sent. Check your email on this device.
          </p>
        )}

        {error && (
          <p className="login-error">
            {error}
          </p>
        )}
      </section>

      <style jsx>{`
        .login-root {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 32px 16px;
          background: radial-gradient(
              circle at top,
              rgba(255, 255, 255, 0.03),
              transparent 55%
            ),
            #050506;
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
          border: 1px solid rgba(255, 255, 255, 0.06);
          box-shadow:
            0 28px 60px rgba(0, 0, 0, 0.9),
            inset 0 0 0 0.5px rgba(255, 255, 255, 0.02);
          color: #f5f5f7;
        }

        .login-title {
          font-size: 22px;
          font-weight: 600;
          margin-bottom: 6px;
        }

        .login-subtitle {
          font-size: 13px;
          color: rgba(255, 255, 255, 0.6);
          margin-bottom: 20px;
        }

        .login-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-bottom: 14px;
          font-size: 12px;
          color: rgba(255, 255, 255, 0.7);
        }

        .login-field label {
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .login-field input {
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(5, 6, 9, 0.9);
          padding: 9px 12px;
          font-size: 13px;
          color: #f5f5f7;
          outline: none;
        }

        .login-field input::placeholder {
          color: rgba(255, 255, 255, 0.35);
        }

        .login-btn {
          width: 100%;
          border-radius: 999px;
          padding: 10px 16px;
          font-size: 14px;
          font-weight: 500;
          border: 1px solid transparent;
          cursor: pointer;
          margin-top: 6px;
          transition:
            transform 0.18s ease-out,
            box-shadow 0.18s ease-out,
            filter 0.18s ease-out,
            background 0.18s ease-out;
        }

        .login-btn--primary {
          background: radial-gradient(
                circle at 0% 0%,
                rgba(139, 187, 255, 0.45),
                rgba(50, 80, 130, 0.6)
              ),
            #171c26;
          border-color: rgba(139, 187, 255, 0.7);
          box-shadow:
            0 0 0 1px rgba(20, 40, 70, 0.7),
            0 12px 30px rgba(0, 0, 0, 0.9);
          color: #f5f7ff;
        }

        .login-btn--primary:hover:not(:disabled),
        .login-btn--ghost:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow:
            0 0 0 1px rgba(148, 202, 255, 0.8),
            0 18px 45px rgba(0, 0, 0, 1);
          filter: brightness(1.05);
        }

        .login-btn--ghost {
          background: rgba(7, 8, 12, 0.95);
          border-color: rgba(255, 255, 255, 0.14);
          color: rgba(255, 255, 255, 0.85);
        }

        .login-btn:disabled {
          opacity: 0.7;
          cursor: default;
          transform: none;
          box-shadow: none;
        }

        .login-divider {
          margin: 18px 0 10px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 11px;
          color: rgba(255, 255, 255, 0.45);
        }

        .login-divider span {
          flex: 1;
          height: 1px;
          background: rgba(255, 255, 255, 0.1);
        }

        .login-success {
          margin-top: 10px;
          font-size: 12px;
          color: #7ce38b;
        }

        .login-error {
          margin-top: 10px;
          font-size: 12px;
          color: #ff7b7b;
        }
      `}</style>
    </main>
  );
}
