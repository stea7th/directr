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
      const fd = new FormData();
      fd.set("key", key); // <-- must match what your server action reads

      const res = await unlockAction(fd);

      // support either {ok,error} OR redirect behavior
      if (res && typeof res === "object" && "ok" in res && !res.ok) {
        setErr((res as any).error || "Wrong key. Try again.");
      } else {
        window.location.href = "/create";
      }
    } catch {
      setErr("Wrong key. Try again.");
    } finally {
      setLoading(false);
    }
  }

  async function onRelock() {
    setErr(null);
    setLoading(true);
    try {
      const fd = new FormData();
      await relockAction(fd as any); // if relockAction also expects FormData
      window.location.href = "/lock";
    } catch {
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
