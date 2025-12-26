// src/app/lock/LockForm.tsx
"use client";

import React, { useMemo } from "react";
import { useFormState } from "react-dom";
import {
  unlockAction,
  relockAction,
  waitlistAction,
  requestAccessAction,
} from "./actions";

const initial = { ok: true as boolean, error: "" as string };

export default function LockForm() {
  const from = useMemo(() => {
    if (typeof window === "undefined") return "/create";
    return window.location.pathname + window.location.search;
  }, []);

  const [unlockState, unlock] = useFormState(unlockAction as any, initial);
  const [wlState, joinWaitlist] = useFormState(waitlistAction as any, initial);
  const [reqState, requestAccess] = useFormState(requestAccessAction as any, initial);

  return (
    <div>
      <div className="title" style={{ margin: 0 }}>
        Enter access key
      </div>
      <p className="subtitle" style={{ marginTop: 6 }}>
        This device stays unlocked for 7 days.
      </p>

      <form action={unlock}>
        <input type="hidden" name="from" value={from} />
        <div className="lockRow">
          <input className="input" name="key" placeholder="Access key" autoComplete="off" />
          <button className="btn btn--primary" type="submit">
            Unlock
          </button>
        </div>
        {!unlockState.ok && unlockState.error ? (
          <div className="lockToast">{unlockState.error}</div>
        ) : null}
      </form>

      <div className="lockActions">
        <form action={relockAction}>
          <button className="btn btn--ghost" type="submit">
            Relock this device
          </button>
        </form>
      </div>

      <div className="lockMini">Want access?</div>

      <form action={joinWaitlist}>
        <div className="lockRow">
          <input className="input" name="email" placeholder="Email for waitlist" />
          <button className="btn" type="submit">Join waitlist</button>
        </div>
        {wlState.ok ? null : wlState.error ? <div className="lockToast">{wlState.error}</div> : null}
        {wlState.ok ? (
          <div className="lockHint">You’re on the list.</div>
        ) : null}
      </form>

      <form action={requestAccess}>
        <div className="lockRow" style={{ marginTop: 10 }}>
          <input className="input" name="email" placeholder="Email for access request" />
        </div>
        <div style={{ marginTop: 10 }}>
          <textarea
            className="input"
            name="note"
            placeholder="What are you trying to do with Directr?"
            style={{ height: 90, paddingTop: 10 }}
          />
        </div>
        <div className="lockActions">
          <button className="btn btn--primary" type="submit">
            Request access
          </button>
        </div>
        {reqState.ok ? (
          <div className="lockHint">Request received.</div>
        ) : reqState.error ? (
          <div className="lockToast">{reqState.error}</div>
        ) : null}
      </form>

      <div className="lockHint">
        Tip: set <code>SITE_LOCK_ENABLED=false</code> to disable the lock.
      </div>
    </div>
  );
}
