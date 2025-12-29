"use client";

import styles from "./lock.module.css";
import { useState } from "react";
import { unlockAction } from "./actions";

export default function LockForm() {
  const [key, setKey] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(formData: FormData) {
    setLoading(true);
    setError(null);

    try {
      await unlockAction(formData);
    } catch {
      setError("Wrong key. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form action={submit} className={styles.lockPanel}>
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

      {error && <div className={styles.lockError}>{error}</div>}
    </form>
  );
}
