"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

/**
 * This page supports **both** Supabase reset link formats:
 * 1) https://your.site/reset?code=XYZ
 * 2) https://your.site/reset#access_token=...&refresh_token=...&type=recovery
 *
 * Flow:
 *  - On mount, we try to exchange ?code= for a session.
 *  - If there's no ?code=, we look in the URL hash for access_token/refresh_token and set the session.
 *  - Once a session exists, we show the "set new password" form and call auth.updateUser({ password }).
 */

type Stage =
  | "checking"          // figuring out token/session
  | "need-session"      // we didn't get a session from the link
  | "ready"             // session ok, show password form
  | "saving"            // submitting new password
  | "done"              // password updated
  | "error";            // something failed

export default function ResetPage() {
  const params = useSearchParams();
  const [stage, setStage] = useState<Stage>("checking");
  const [message, setMessage] = useState<string>("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");

  // Grab the `code` param if present (newer Supabase flow)
  const code = params.get("code");

  // Parse hash fragment if present (older/link-variant flow)
  const hashTokens = useMemo(() => {
    if (typeof window === "undefined") return null;
    if (!window.location.hash) return null;
    const raw = window.location.hash.replace(/^#/, "");
    const q = new URLSearchParams(raw);
    const access_token = q.get("access_token") || undefined;
    const refresh_token = q.get("refresh_token") || undefined;
    const type = q.get("type") || undefined; // expect "recovery"
    if (access_token && refresh_token) return { access_token, refresh_token, type };
    return null;
  }, []);

  useEffect(() => {
    (async () => {
      try {
        // 1) Try to exchange `?code=` for a session
        if (code) {
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
          if (!data.session) throw new Error("No session from code");
          setStage("ready");
          return;
        }

        // 2) No code param — try the hash tokens
        if (hashTokens?.access_token && hashTokens?.refresh_token) {
          const { error } = await supabase.auth.setSession({
            access_token: hashTokens.access_token,
            refresh_token: hashTokens.refresh_token,
          });
          if (error) throw error;
          setStage("ready");
          return;
        }

        // 3) Nothing usable in URL — check if we already have a session (user clicked twice, etc.)
        const { data: sess } = await supabase.auth.getSession();
        if (sess.session) {
          setStage("ready");
          return;
        }

        // 4) Still nothing — we can’t proceed
        setMessage("Invalid or expired reset link. Request a new email.");
        setStage("need-session");
      } catch (err: any) {
        setMessage(err?.message || "Could not read reset link.");
        setStage("need-session");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (stage !== "ready") return;

    if (!password || password.length < 8) {
      setMessage("Password must be at least 8 characters.");
      return;
    }
    if (password !== password2) {
      setMessage("Passwords do not match.");
      return;
    }

    setStage("saving");
    setMessage("");

    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setMessage(error.message);
      setStage("ready");
      return;
    }

    setStage("done");
    setMessage("Password updated! You can now sign in with your new password.");
  }

  // --- UI ---

  if (stage === "checking") {
    return (
      <Shell>
        <h1 style={h1}>Resetting your session…</h1>
        <p style={p}>Please wait a sec.</p>
      </Shell>
    );
  }

  if (stage === "need-session") {
    return (
      <Shell>
        <h1 style={h1}>Reset link issue</h1>
        <p style={p}>
          {message || "We couldn't validate your reset link."}
        </p>
        <p style={{ ...p, marginTop: 8 }}>
          Go back to{" "}
          <a href="/reset" style={link}>
            /reset
          </a>{" "}
          and request a fresh email.
        </p>
      </Shell>
    );
  }

  if (stage === "done") {
    return (
      <Shell>
        <h1 style={h1}>All set 🎉</h1>
        <p style={p}>{message}</p>
        <div style={{ height: 12 }} />
        <a href="/login" style={primaryBtn}>Go to sign in</a>
      </Shell>
    );
  }

  // ready | saving
  return (
    <Shell>
      <h1 style={h1}>Choose a new password</h1>
      {message ? (
        <div style={alert}>{message}</div>
      ) : null}

      <form onSubmit={handleSave} style={{ marginTop: 16 }}>
        <label style={label}>
          <span style={labelText}>New password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.currentTarget.value)}
            placeholder="••••••••"
            style={input}
            minLength={8}
            required
          />
        </label>

        <label style={label}>
          <span style={labelText}>Confirm password</span>
          <input
            type="password"
            value={password2}
            onChange={(e) => setPassword2(e.currentTarget.value)}
            placeholder="••••••••"
            style={input}
            minLength={8}
            required
          />
        </label>

        <button
          type="submit"
          disabled={stage === "saving"}
          style={{
            ...primaryBtn,
            width: "100%",
            opacity: stage === "saving" ? 0.7 : 1,
            cursor: stage === "saving" ? "not-allowed" as const : "pointer",
            marginTop: 12,
          }}
        >
          {stage === "saving" ? "Saving…" : "Update password"}
        </button>
      </form>
    </Shell>
  );
}

/** ---- tiny inline styles (no Tailwind) ---- */
const Shell = ({ children }: { children: React.ReactNode }) => (
  <div
    style={{
      minHeight: "100dvh",
      background: "#0a0a0a",
      color: "#fff",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 16,
    }}
  >
    <div
      style={{
        width: "100%",
        maxWidth: 440,
        background: "#0f1115",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 14,
        padding: 18,
        boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
      }}
    >
      {children}
    </div>
  </div>
);

const h1: React.CSSProperties = {
  margin: 0,
  fontSize: 22,
  fontWeight: 700,
  letterSpacing: -0.2,
};

const p: React.CSSProperties = {
  margin: "8px 0 0 0",
  color: "rgba(255,255,255,0.7)",
  fontSize: 14,
  lineHeight: 1.5,
};

const alert: React.CSSProperties = {
  marginTop: 12,
  padding: "10px 12px",
  borderRadius: 10,
  background: "rgba(239,68,68,0.12)",
  border: "1px solid rgba(239,68,68,0.25)",
  color: "#fecaca",
  fontSize: 13,
};

const label: React.CSSProperties = {
  display: "block",
  marginTop: 14,
};

const labelText: React.CSSProperties = {
  display: "block",
  fontSize: 12,
  color: "rgba(255,255,255,0.6)",
  marginBottom: 6,
};

const input: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 10,
  background: "#0b0d11",
  border: "1px solid rgba(255,255,255,0.1)",
  color: "#fff",
  outline: "none",
};

const primaryBtn: React.CSSProperties = {
  display: "inline-block",
  textAlign: "center" as const,
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #096aa6",
  background: "#0ea5e9",
  color: "#fff",
  fontWeight: 600,
  textDecoration: "none",
};

const link: React.CSSProperties = {
  color: "#0ea5e9",
  textDecoration: "underline",
};
      </div>
    </div>
  );
}
