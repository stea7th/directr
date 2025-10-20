"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

type Status = "idle" | "verifying" | "need-password" | "saving" | "ok" | "error" | "missing-token";

export default function ConfirmClient() {
  const sp = useSearchParams();

  const token = useMemo(
    () => sp.get("token") || sp.get("token_hash") || sp.get("code") || "",
    [sp]
  );
  const type = useMemo(() => sp.get("type") || "recovery", [sp]);

  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  // Create a browser Supabase client (holds session in local storage)
  const supabase = useMemo(() => {
    return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: true } });
  }, []);

  useEffect(() => {
    let alive = true;

    async function verify() {
      if (!token) {
        setStatus("missing-token");
        setMessage("Missing confirmation token. Open the link from your email again.");
        return;
      }
      setStatus("verifying");
      try {
        const { data, error } = await supabase.auth.verifyOtp({
          type: type as any,       // "recovery" | "signup" | "email_change"
          token_hash: token,
        });

        if (!alive) return;

        if (error) {
          setStatus("error");
          setMessage(error.message || "Confirmation failed. Try the link again.");
          return;
        }

        // Token verified — user/session is now set in this browser client.
        setStatus("need-password");
        setMessage("Create a new password to finish resetting your account.");
      } catch (e: any) {
        if (!alive) return;
        setStatus("error");
        setMessage(e?.message || "Something went wrong during verification.");
      }
    }

    verify();
    return () => {
      alive = false;
    };
  }, [supabase, token, type]);

  async function savePassword() {
    if (!password) {
      setMessage("Please enter a new password.");
      return;
    }
    setStatus("saving");
    try {
      const { data, error } = await supabase.auth.updateUser({ password });
      if (error) {
        setStatus("need-password");
        setMessage(error.message || "Please provide a valid password and try again.");
        return;
      }
      setStatus("ok");
      setMessage("Password set. You’re confirmed! You can close this tab or head to your dashboard.");
    } catch (e: any) {
      setStatus("need-password");
      setMessage(e?.message || "Could not save password. Try again.");
    }
  }

  function buttonStyle(disabled: boolean): React.CSSProperties {
    return {
      opacity: disabled ? 0.7 : 1,
      cursor: disabled ? "not-allowed" : "pointer",
      padding: "10px 14px",
      borderRadius: 8,
      border: "1px solid #e5e7eb",
      background: "white",
      fontWeight: 600,
    };
  }

  return (
    <main className="mx-auto max-w-md p-6">
      <h1 className="text-2xl font-semibold">Confirming…</h1>

      {status === "missing-token" && <p className="mt-3 text-sm text-gray-400">{message}</p>}
      {status === "verifying" && <p className="mt-4">Verifying link…</p>}
      {status === "error" && <p className="mt-4 text-red-500">{message}</p>}
      {status === "ok" && <p className="mt-4 text-green-500">{message}</p>}

      {status === "need-password" && (
        <section className="mt-4 space-y-3">
          <p className="text-sm text-gray-300">{message}</p>
          <label className="block">
            <span className="text-sm text-gray-300">New password</span>
            <input
              type="password"
              className="mt-1 w-full rounded-lg border border-gray-600 bg-black p-2 text-white"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password"
            />
          </label>

          <button
            type="button"
            onClick={savePassword}
            disabled={status === "saving"}
            style={buttonStyle(status === "saving")}
          >
            {status === "saving" ? "Saving…" : "Save password"}
          </button>
        </section>
      )}
    </main>
  );
}
