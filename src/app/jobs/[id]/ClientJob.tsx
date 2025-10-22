"use client";

import { useEffect, useState } from "react";

export default function ClientJob({ id, initialStatus }: { id: string; initialStatus: string }) {
  const [status, setStatus] = useState(initialStatus);
  const [loading, setLoading] = useState(false);
  const done = status === "done" || status === "error";

  // Poll until done
  useEffect(() => {
    if (done) return;
    let stop = false;
    const tick = async () => {
      try {
        const res = await fetch(`/api/jobs/${id}`, { cache: "no-store" });
        if (!res.ok) return;
        const row = await res.json();
        if (!stop) setStatus(row.status || "unknown");
      } catch {}
    };
    tick();
    const h = setInterval(tick, 2000);
    return () => { stop = true; clearInterval(h); };
  }, [id, done]);

  const retry = async () => {
    setLoading(true);
    try {
      await fetch(`/api/jobs/${id}`, { method: "POST", cache: "no-store" });
      const res = await fetch(`/api/jobs/${id}`, { cache: "no-store" });
      if (res.ok) {
        const row = await res.json();
        setStatus(row.status || "unknown");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-3">
      <p>Status: <span className="font-medium">{status}</span></p>
      {!done ? (
        <p className="text-sm text-gray-400 mt-1">Processing… this will update automatically.</p>
      ) : (
        <button
          type="button"
          className="mt-3 rounded px-3 py-2 bg-blue-600/80 hover:bg-blue-600 disabled:opacity-50"
          onClick={retry}
          disabled={loading}
        >
          {loading ? "Re-running…" : "Run again"}
        </button>
      )}
    </div>
  );
}
