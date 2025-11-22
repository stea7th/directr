"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase/client";

type Tab = "password" | "magic";

export default function SignInPage() {
  const [tab, setTab] = useState<Tab>("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const urlError = searchParams.get("error");

  const supabase = createBrowserClient();

  function clearStatus() {
    setError(null);
    setMessage(null);
  }

  async function handlePasswordSignIn(e: React.FormEvent) {
    e.preventDefault();
    clearStatus();

    if (!email || !password) {
      setError("Email and password required.");
      return;
    }

    setLoading(true);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
        return;
      }

      // ✅ Signed in – go to /create
      router.push("/create");
      router.refresh();
    } catch (err: any) {
      setError(err?.message || "Unexpected error.");
    } finally {
      setLoading(false);
    }
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    clearStatus();

    if (!email) {
      setError("Add an email first.");
      return;
    }

    setLoading(true);
    try {
      const redirectTo = `${window.location.origin}/auth/callback`;

      const { error: otpError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectTo,
        },
      });

      if (otpError) {
        setError(otpError.message);
        return;
      }

      setMessage("Magic link sent. Check your email.");
    } catch (err: any) {
      setError(err?.message || "Unexpected error.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    clearStatus();
    setLoading(true);
    try {
      const redirectTo = `${window.location.origin}/auth/callback`;

      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
        },
      });

      if (oauthError) {
        setError(oauthError.message);
        setLoading(false);
      }
      // If no error: user is redirected out to Google, then back to /auth/callback
    } catch (err: any) {
      setError(err?.message || "Unexpected error.");
      setLoading(false);
    }
  }

  return (
    <main className="signin-root">
      <section className="signin-card">
        <h1 className="signin-title">Sign in to directr</h1>

        <div className="signin-tabs">
          <button
            type="button"
            onClick={() => setTab("password")}
            className={`signin-tab ${
              tab === "password" ? "signin-tab--active" : ""
            }`}
          >
            Password
          </button>
          <button
            type="button"
            onClick={() => setTab("magic")}
            className={`signin-tab ${
              tab === "magic" ? "signin-tab--active" : ""
            }`}
          >
            Magic link
          </button>
        </div>

        {urlError && !error && (
          <p className="signin-error">Auth error: {urlError}</p>
        )}

        {tab === "password" && (
          <form onSubmit={handlePasswordSignIn} className="signin-form">
            <label className="signin-field">
              <span>Email</span>
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </label>

            <label className="signin-field">
              <span>Password</span>
              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </label>

            <button
              type="submit"
              className="signin-btn"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>
        )}

        {tab === "magic" && (
          <form onSubmit={handleMagicLink} className="signin-form">
            <label className="signin-field">
              <span>Email</span>
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </label>

            <button
              type="submit"
              className="signin-btn"
              disabled={loading}
            >
              {loading ? "Sending link..." : "Send magic link"}
            </button>
          </form>
        )}

        <div className="signin-divider">
          <span />
          <p>or</p>
          <span />
        </div>

        <button
          type="button"
          className="signin-google"
          onClick={handleGoogle}
          disabled={loading}
        >
          Continue with Google
        </button>

        {error && <p className="signin-error">{error}</p>}
        {message && <p className="signin-message">{message}</p>}
      </section>

      <style jsx>{`
        .signin-root {
          min-height: calc(100vh - 64px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 64px 16px;
          background: radial-gradient(
              circle at top,
              rgba(255, 255, 255, 0.03),
              transparent 55%
            ),
            #050506;
        }

        .signin-card {
          width: 100%;
          max-width: 420px;
          border-radius: 28px;
          background: #101014;
          border: 1px solid rgba(255, 255, 255, 0.04);
          box-shadow:
            0 28px 60px rgba(0, 0, 0, 0.9),
            inset 0 0 0 0.5px rgba(255, 255, 255, 0.03);
          padding: 28px 24px 24px;
        }

        .signin-title {
          font-size: 22px;
          font-weight: 600;
          color: #f5f5f7;
          margin-bottom: 16px;
        }

        .signin-tabs {
          display: inline-flex;
          padding: 3px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.04);
          margin-bottom: 20px;
        }

        .signin-tab {
          border: none;
          background: transparent;
          color: rgba(255, 255, 255, 0.6);
          font-size: 12px;
          padding: 6px 14px;
          border-radius: 999px;
          cursor: pointer;
        }

        .signin-tab--active {
          background: #11131a;
          color: #f5f5f7;
        }

        .signin-form {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .signin-field {
          display: flex;
          flex-direction: column;
          gap: 4px;
          font-size: 12px;
          color: rgba(255, 255, 255, 0.7);
        }

        .signin-field span {
          text-transform: uppercase;
          letter-spacing: 0.08em;
          font-size: 11px;
        }

        .signin-field input {
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(5, 6, 9, 0.9);
          padding: 9px 12px;
          font-size: 13px;
          color: #f5f5f7;
          outline: none;
        }

        .signin-field input::placeholder {
          color: rgba(255, 255, 255, 0.35);
        }

        .signin-btn {
          margin-top: 6px;
          border-radius: 999px;
          border: 1px solid rgba(139, 187, 255, 0.7);
          padding: 10px 18px;
          background: radial-gradient(
                circle at 0% 0%,
                rgba(139, 187, 255, 0.45),
                rgba(50, 80, 130, 0.6)
              ),
            #171c26;
          color: #f5f7ff;
          font-weight: 500;
          font-size: 14px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition:
            transform 0.18s ease-out,
            box-shadow 0.18s ease-out,
            filter 0.18s ease-out;
        }

        .signin-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.9);
          filter: brightness(1.05);
        }

        .signin-btn:disabled {
          opacity: 0.75;
          cursor: default;
        }

        .signin-divider {
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 18px 0 12px;
          font-size: 11px;
          color: rgba(255, 255, 255, 0.5);
        }

        .signin-divider span {
          flex: 1;
          height: 1px;
          background: rgba(255, 255, 255, 0.08);
        }

        .signin-google {
          width: 100%;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.16);
          background: #0b0c10;
          padding: 10px 18px;
          color: #f5f5f7;
          font-size: 14px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition:
            transform 0.18s ease-out,
            box-shadow 0.18s ease-out,
            background 0.18s ease-out;
        }

        .signin-google:hover:not(:disabled) {
          transform: translateY(-1px);
          background: #10121a;
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.9);
        }

        .signin-google:disabled {
          opacity: 0.7;
          cursor: default;
        }

        .signin-error {
          margin-top: 10px;
          font-size: 12px;
          color: #ff7b7b;
        }

        .signin-message {
          margin-top: 10px;
          font-size: 12px;
          color: #8fd2ff;
        }
      `}</style>
    </main>
  );
}
