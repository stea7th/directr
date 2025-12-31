"use client";

import styles from "./lock.module.css";
import { useState } from "react";

export default function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function join() {
    setLoading(true);
    setMsg(null);

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMsg(data?.error || "Failed to join waitlist.");
        setLoading(false);
        return;
      }

      setMsg("✅ You’re on the waitlist.");
      setEmail("");
    } catch {
      setMsg("Failed to join waitlist.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className={styles.waitRow}>
        <input
          className={styles.lockInput}
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          inputMode="email"
          autoComplete="email"
        />
        <button
          type="button"
          className={styles.waitBtn}
          onClick={join}
          disabled={loading || !email.trim()}
        >
          Join
        </button>
      </div>

      {msg && (
        <div className={msg.startsWith("✅") ? styles.ok : styles.lockError}>
          {msg}
        </div>
      )}
    </>
  );
}
