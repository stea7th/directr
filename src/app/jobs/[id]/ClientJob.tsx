"use client";

import { useEffect, useState } from "react";

export default function ClientJob({
  id,
  initialStatus,
  initialResultText,
}: {
  id: string;
  initialStatus: string;
  initialResultText?: string | null;
}) {
  const [status, setStatus] = useState(initialStatus);
  const [result, setResult] = useState<string | null>(initialResultText || null);
  const [loading, setLoading] = useState(false);

  const isDone = status === "done" || status === "error";

  // Poll until finished
  useEffect(() => {
    if (isDone) return;
    let stop = false;

    const tick = async () => {
      try {
        const res = await fetch(`/api/jobs/${id}`, { cache: "no-store" });
        if (!res.ok) return;
        const row = await res.json();
        if (!stop) {
          setStatus(row.status || "unknown");
          if (row.result_text !== undefined) setResult(row.result_text || null);
        }
      } catch {}
    };

    tick();
    const h = setInterval(tick, 2000);
    return () => { stop = true; clearInterval(h); };
  }, [id, isDone]);

  const retry = async () => {
    setLoading(true);
    try {
      await fetch(`/api/jobs/${id}`, { method: "POST", cache: "no-store" });
      const res = await fetch(`/api/jobs/${id}`, { cache: "no-store" });
      if (res.ok) {
        const row = await res.json();
        setStatus(row.status || "unknown");
        setResult(row.result_text || null);
      }
    } finally {
      setLoading(false);
    }
  };

  const copy = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result);
    alert("Copied!");
  };

  const download = () => {
    if (!result) return;
    const blob = new Blob([result], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `job-${id}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mt-3 space-y-4">
      <p>
        Status: <span className="font-medium">{status}</span>
      </p>

      {result ? (
        <>
          <div className="rounded-lg border border-white/10 p-4 bg-white/5">
            <pre className="whitespace-pre-wrap text-sm">{result}</pre>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              className="rounded px-3 py-2 bg-blue-600/80 hover:bg-blue-600"
              onClick={copy}
            >
              Copy
            </button>
            <button
              type="button"
              className="rounded px-3 py-2 bg-blue-600/80 hover:bg-blue-600"
              onClick={download}
            >
              Download .txt
            </button>
          </div>
        </>
      ) : !isDone ? (
        <p className="text-sm text-gray-400">Processing… this will update automatically.</p>
      ) : (
        <p className="text-sm text-gray-400">No result available.</p>
      )}

      {isDone && (
        <button
          type="button"
          className="rounded px-3 py-2 bg-blue-600/80 hover:bg-blue-600 disabled:opacity-50"
          onClick={retry}
          disabled={loading}
        >
          {loading ? "Re-running…" : "Run again"}
        </button>
      )}
    </div>
  );
}
