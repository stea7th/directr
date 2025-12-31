"use client";

import styles from "./lock.module.css";
import { useState } from "react";
import { unlockAction, relockAction } from "./actions";

export default function LockForm() {
  const [key, setKey] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onUnlock(formData: FormData) {
    setLoading(true);
    setError(null);
    try {
      await unlockAction(formData); // server action will redirect on success
    } catch {
      setError("Wrong key. Try again.");
      setLoading(false);
    }
  }

  return (
    <div className={styles.lockPanel}>
      <div className={styles.lockPanelTitle}>Enter access key</div>

      <form action={onUnlock}>
        <div className={styles.lockRow}>
          <input
            className={styles.lockInput}
            name="key"
            placeholder="Access key"
            value={key}
            onChange={(e) => setKey(e.target.value)}
          />
          <button
            type="submit"
            className={`${styles.lockBtn} ${styles.lockBtnPrimary}`}
            disabled={loading}
          >
            Unlock
          </button>
        </div>
      </form>

      <form action={relockAction} style={{ marginTop: 10 }}>
        <button type="submit" className={styles.lockBtn} style={{ width: "100%" }}>
          Relock
        </button>
      </form>

      {error && <div className={styles.lockError}>{error}</div>}
    </div>
  );
}
