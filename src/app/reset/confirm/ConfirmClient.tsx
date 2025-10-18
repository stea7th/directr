"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

type Status =
  | "idle"
  | "loading"
  | "need-password"
  | "ok"
  | "error"
  | "missing-token";

export default function ConfirmClient() {
  const sp = useSearchParams();
  const token = useMemo(() => sp.get("token") || sp.get("code") || "", [sp]);

  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    let alive = true;

    async function run() {
      if (!token) {
        if (!alive) return;
        setStatus("missing-token");
        setMessage("Missing confirmation token. Open the link from your email again.");
        return;
      }

      setStatus("loading");
      try {
        const res = await fetch(`/api/confirm-client?token=${encodeURIComponent(token)}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });

        let data: any = null;
        try {
          data = await res.clone().json();
        } catch {
          // ignore non-JSON
        }

        if (!alive) return;

        if (res.ok) {
          setStatus("ok");
          setMessage((data?.message as string) || "All set — your account is confirmed.");
        } else if (data?.needPassword || res.status === 401 || res.status === 409) {
          setStatus("need-password");
          setMessage(
            (data?.message as string) ||
              "To finish confirmation, set a password for your account."
          );
        } else {
          setStatus("error");
          setMessage(
            (data?.message as string) ||
              (await res.text()) ||
              "Confirmation failed. Try the link again."
          );
        }
      } catch (err: any) {
        if (!alive) return;
        setStatus("error");
        setMessage(err?.message || "Network error. Please try again.");
      }
    }

    run();
    return () => {
      alive = false;
    };
  }, [token]);

  async function save() {
    if (!token || saving) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/confirm-client`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      let data: any = null;
      try {
        data = await res.clone().json();
      } catch {
        // ignore
      }

      if (res.ok) {
        setStatus("ok");
        setMessage((data?.message as string) || "Password set. You’re confirmed!");
      } else if (data?.needPassword || res.status === 400 || res.status === 422) {
        setStatus("need-password");
        setMessage(
          (data?.message as string) || "Please provide a valid password and try again."
        );
      } else {
        setStatus("error");
        setMessage(
          (data?.message as string) || (await res.text()) || "Could not save password."
        );
      }
    } catch (err: any) {
      setStatus("error");
      setMessage(err?.message || "Network error while saving password.");
    } finally {
      setSaving(false);
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

      {status === "missing-token" && (
        <p className="mt-3 text-sm text-gray-600">{message}</p>
      )}

      {status === "loading" && <p className="mt-4">Working on it…</p>}

      {status === "ok" && (
        <p className="mt-4 text-green-600">
          {message} You can close this tab or head to your dashboard.
        </p>
      )}

      {status === "error" && <p className="mt-4 text-red-600">{message}</p>}

      {status === "need-password" && (
        <section className="mt-4 space-y-3">
          <p className="text-sm text-gray-700">{message}</p>
          <label className="block">
            <span className="text-sm text-gray-700">New password</span>
            <input
              type="password"
              className="mt-1 w-full rounded-lg border border-gray-300 p-2"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password"
            />
          </label>

          <button
            type="button"
            onClick={save}
            disabled={saving}
            style={buttonStyle(saving)}
          >
            {saving ? "Saving…" : "Save password"}
          </button>
        </section>
      )}
    </main>
  );
}
