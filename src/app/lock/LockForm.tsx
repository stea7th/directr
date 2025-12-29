"use client";

import { useState } from "react";
import styles from "./lock.module.css";
import { unlockAction, relockAction } from "./actions";

type Tab = "unlock" | "waitlist";

export default function LockForm() {
  const [tab, setTab] = useState<Tab>("unlock");

  // unlock
  const [key, setKey] = useState("");
  const [unlockErr, setUnlockErr] = useState<string | null>(null);
  const [unlocking, setUnlocking] = useState(false);

  // waitlist
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [waitMsg, setWaitMsg] = useState<string | null>(null);
  const [waitErr, setWaitErr] = useState<string | null>(null);
  const [waiting, setWaiting] = useState(false);

  async function onUnlock() {
    setUnlockErr(null);
    setUnlocking(true);

    try {
      const fd = new FormData();
      fd.set("key", key);

      // unlockAction returns void (redirects or throws)
      await unlockAction(fd);

      // if it doesn't redirect, just go create
      window.location.href = "/create";
    } catch (e: any) {
      setUnlockErr(e?.message || "Wrong key. Try again.");
    } finally {
      setUnlocking(false);
    }
  }

  async function onWaitlist() {
    setWaitMsg(null);
    setWaitErr(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      setWaitErr("Enter a valid email.");
      return;
    }

    setWaiting(true);
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail, name: name.trim() || null }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data?.success) {
        setWaitErr(data?.error || "Couldn’t join waitlist. Try again.");
        return;
      }

      setWaitMsg("You’re on the list ✅");
      setEmail("");
      setName("");
    } catch (e: any) {
      setWaitErr(e?.message || "Couldn’t join waitlist.");
    } finally {
      setWaiting(false);
    }
  }

  return (
    <div className={styles.lockPanel}>
      <div className={styles.tabs}>
        <button
          type="button"
          className={`${styles.tab} ${tab === "unlock" ? styles.tabActive : ""}`}
          onClick={() => setTab("unlock")}
        >
          Unlock
        </button>
        <button
          type="button"
          className={`${styles.tab} ${tab === "waitlist" ? styles.tabActive : ""}`}
          onClick={() => setTab("waitlist")}
        >
          Waitlist
        </button>
      </div>

      {tab === "unlock" ? (
        <>
          <div className={styles.lockPanelTitle}>Enter access key</div>

          <div className={styles.lockRow}>
            <input
              className={styles.lockInput}
              placeholder="Access key"
              value={key}
              onChange={(e) => setKey(e.target.value)}
            />

            <button
              type="button"
              className={`${styles.lockBtn} ${styles.lockBtnPrimary}`}
              onClick={onUnlock}
              disabled={unlocking}
            >
              {unlocking ? "Unlocking…" : "Unlock"}
            </button>
          </div>

          <div className={styles.lockActions}>
            <form action={relockAction}>
              <button className={styles.lockBtn} type="submit">
                Relock
              </button>
            </form>
          </div>

          {unlockErr && <div className={styles.lockError}>{unlockErr}</div>}
        </>
      ) : (
        <>
          <div className={styles.lockPanelTitle}>Join the waitlist</div>

          <div className={styles.waitGrid}>
            <input
              className={styles.lockInput}
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              inputMode="email"
              autoCapitalize="none"
              autoCorrect="off"
            />
            <input
              className={styles.lockInput}
              placeholder="Name (optional)"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <button
            type="button"
            className={`${styles.lockBtn} ${styles.lockBtnPrimary} ${styles.fullBtn}`}
            onClick={onWaitlist}
            disabled={waiting}
          >
            {waiting ? "Joining…" : "Join waitlist"}
          </button>

          {waitErr && <div className={styles.lockError}>{waitErr}</div>}
          {waitMsg && <div className={styles.lockSuccess}>{waitMsg}</div>}
        </>
      )}
    </div>
  );
}
