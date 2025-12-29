// src/app/lock/LockForm.tsx
"use client";

import { useState } from "react";
import { unlockAction, waitlistAction } from "./actions";

export default function LockForm() {
  const [key, setKey] = useState("");
  const [email, setEmail] = useState("");

  const [unlocking, setUnlocking] = useState(false);
  const [joining, setJoining] = useState(false);

  const [unlockErr, setUnlockErr] = useState<string | null>(null);
  const [waitErr, setWaitErr] = useState<string | null>(null);
  const [waitOk, setWaitOk] = useState<string | null>(null);

  async function onUnlock(e: React.FormEvent) {
    e.preventDefault();
    setUnlockErr(null);
    setUnlocking(true);

    try {
      const fd = new FormData();
      fd.set("key", key);

      // unlockAction may redirect on success; if wrong it returns { ok:false, error }
      const res: any = await unlockAction(fd);

      if (res && typeof res === "object" && res.ok === false) {
        setUnlockErr(res.error || "Wrong key. Try again.");
      }
    } catch (err: any) {
      // If it redirects, Next throws a redirect error — that’s GOOD. Don’t treat as failure.
      const msg = String(err?.message || "");
      if (!msg.toLowerCase().includes("redirect")) {
        setUnlockErr("Couldn’t unlock. Try again.");
      }
    } finally {
      setUnlocking(false);
    }
  }

  async function onWaitlist(e: React.FormEvent) {
    e.preventDefault();
    setWaitErr(null);
    setWaitOk(null);
    setJoining(true);

    try {
      const fd = new FormData();
      fd.set("email", email);

      const res: any = await waitlistAction(fd);

      if (res && typeof res === "object" && res.ok === false) {
        setWaitErr(res.error || "Couldn’t join waitlist.");
      } else {
        setWaitOk("Added. You’re on the list.");
        setEmail("");
      }
    } catch {
      setWaitErr("Couldn’t join waitlist.");
    } finally {
      setJoining(false);
    }
  }

  return (
    <div>
      <form className="lockRow" onSubmit={onUnlock}>
        <input
          className="lockInput"
          name="key"
          placeholder="Access key"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          autoComplete="off"
        />
        <button
          className="lockBtn lockBtnPrimary"
          type="submit"
          disabled={unlocking}
        >
          {unlocking ? "Unlocking..." : "Unlock"}
        </button>
      </form>

      {unlockErr && <div className="lockError">{unlockErr}</div>}

      <div className="lockActions" style={{ marginTop: 14 }}>
        <button
          type="button"
          className="lockLinkBtn"
          onClick={() => {
            const el = document.getElementById("waitlist");
            el?.scrollIntoView({ behavior: "smooth", block: "start" });
          }}
        >
          Join waitlist
        </button>
      </div>

      <div id="waitlist" style={{ marginTop: 14 }}>
        <div className="lockPanelTitle" style={{ marginBottom: 8 }}>
          Or join the waitlist
        </div>

        <form className="lockRow" onSubmit={onWaitlist}>
          <input
            className="lockInput"
            name="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
          <button className="lockBtn" type="submit" disabled={joining}>
            {joining ? "Joining..." : "Join"}
          </button>
        </form>

        {waitErr && <div className="lockError">{waitErr}</div>}
        {waitOk && (
          <div style={{ marginTop: 10, fontSize: 13, color: "rgba(120,255,170,.9)" }}>
            {waitOk}
          </div>
        )}
      </div>
    </div>
  );
}
