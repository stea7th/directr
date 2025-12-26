"use client";

import { useState } from "react";
import { unlockAction, relockAction } from "./actions";

export default function LockForm() {
  const [key, setKey] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onUnlock() {
    setErr(null);
    setLoading(true);
    try {
      const res = await unlockAction(key);
      if (!res?.ok) setErr(res?.error || "Wrong key. Try again.");
      else window.location.href = "/create";
    } catch {
      setErr("Something failed. Try again.");
    } finally {
      setLoading(false);
    }
  }

  async function onRelock() {
    setErr(null);
    setLoading(true);
    try {
      await relockAction();
      window.location.href = "/lock";
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="lockRow">
        <input
          className="lockInput"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="Access key"
          type="password"
          autoComplete="off"
        />
        <button
          className="lockBtn lockBtnPrimary"
          type="button"
          onClick={onUnlock}
          disabled={loading}
        >
          {loading ? "…" : "Unlock"}
        </button>
        <button
          className="lockBtn"
          type="button"
          onClick={onRelock}
          disabled={loading}
          title="Relock this device"
        >
          Relock
        </button>
      </div>

      {err ? <div className="lockError">{err}</div> : null}
    </>
  );
}
