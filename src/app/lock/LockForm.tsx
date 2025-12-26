// src/app/lock/LockForm.tsx
"use client";

import { useState, useTransition } from "react";
import { unlockSite } from "./actions";

export default function LockForm() {
  const [key, setKey] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, start] = useTransition();

  return (
    <div>
      <div className="lock__panelHead">
        <div>
          <div className="lock__panelTitle">Enter access key</div>
          <div className="lock__panelSub">This device stays unlocked for 7 days.</div>
        </div>
        {msg ? <div className="lock__pill">{msg}</div> : null}
      </div>

      <form
        className="lock__form"
        onSubmit={(e) => {
          e.preventDefault();
          setMsg(null);
          start(async () => {
            const fd = new FormData();
            fd.set("key", key);
            const res = await unlockSite(fd);

            if ((res as any)?.ok) {
              // force refresh so server layout re-renders with cookie
              window.location.reload();
              return;
            }
            setMsg((res as any)?.error ?? "Wrong key");
          });
        }}
      >
        <input
          className="input lock__input"
          placeholder="Access key"
          value={key}
          onChange={(e) => setKey(e.target.value)}
        />
        <button className={`btn btn--primary ${pending ? "btn--disabled" : ""}`} disabled={pending}>
          {pending ? "Unlocking…" : "Unlock"}
        </button>
      </form>
    </div>
  );
}
