"use client";

import { useSearchParams } from "next/navigation";
import { unlockAction, relockAction } from "./actions";

export default function LockForm() {
  const sp = useSearchParams();
  const hasError = sp.get("error") === "1";

  return (
    <div className="lockFormWrap">
      <form action={unlockAction} className="lockRow">
        <input
          className="lockInput"
          name="key"
          placeholder="Access key"
          type="password"
          autoComplete="off"
          required
        />

        <button className="lockBtn lockBtnPrimary" type="submit">
          Unlock
        </button>
      </form>

      <form action={relockAction} className="lockRow" style={{ marginTop: 10 }}>
        <button className="lockBtn" type="submit">
          Relock
        </button>
      </form>

      {hasError ? (
        <div className="lockError">Wrong key. Try again.</div>
      ) : null}
    </div>
  );
}
