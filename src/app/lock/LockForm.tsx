"use client";

import React, { useState } from "react";
import { unlockAction, waitlistAction } from "./actions";

export default function LockForm() {
  const [key, setKey] = useState("");
  const [email, setEmail] = useState("");

  const [unlockErr, setUnlockErr] = useState<string | null>(null);
  const [waitErr, setWaitErr] = useState<string | null>(null);
  const [waitOk, setWaitOk] = useState(false);

  const [unlocking, setUnlocking] = useState(false);
  const [waitlisting, setWaitlisting] = useState(false);

  async function onUnlock(e: React.FormEvent) {
    e.preventDefault();
    setUnlockErr(null);
    setUnlocking(true);

    try {
      const fd = new FormData();
      fd.set("key", key);

      await unlockAction(fd);
      // if your unlockAction redirects, you’ll never hit the next line — that’s fine.
    } catch (e: any) {
      setUnlockErr(e?.message || "Failed to unlock.");
    } finally {
      setUnlocking(false);
    }
  }

  async function onWaitlist(e: React.FormEvent) {
    e.preventDefault();
    setWaitErr(null);
    setWaitOk(false);
    setWaitlisting(true);

    try {
      const fd = new FormData();
      fd.set("email", email);

      const res = await waitlistAction(fd);

      if (!res.ok) {
        setWaitErr(res.error || "Failed to join waitlist.");
        return;
      }

      setWaitOk(true);
      setEmail("");
    } catch (e: any) {
      setWaitErr(e?.message || "Failed to join waitlist.");
    } finally {
      setWaitlisting(false);
    }
  }

  return (
    <div>
      {/* Unlock */}
      <form onSubmit={onUnlock} className="lockRow">
        <input
          className="lockInput"
          placeholder="Access key"
          value={key}
          onChange={(e) => setKey(e.target.value)}
        />
        <button className="lockBtn lockBtnPrimary" disabled={unlocking}>
          {unlocking ? "Unlocking..." : "Unlock"}
        </button>
      </form>
      {unlockErr && <div className="lockError">{unlockErr}</div>}

      {/* Waitlist */}
      <div style={{ height: 12 }} />

      <form onSubmit={onWaitlist} className="lockRow">
        <input
          className="lockInput"
          placeholder="Email for waitlist"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button className="lockBtn" disabled={waitlisting}>
          {waitlisting ? "Joining..." : "Join waitlist"}
        </button>
      </form>

      {waitErr && <div className="lockError">{waitErr}</div>}
      {waitOk && <div style={{ marginTop: 10, color: "rgba(255,255,255,.75)" }}>
        You’re on the list ✅
      </div>}
    </div>
  );
}
