"use client";

import { useEffect, useState } from "react";

export default function ClientJob({
  id,
  initialStatus,
  initialResultText,
  initialResultUrl,
}: {
  id: string;
  initialStatus: string;
  initialResultText?: string | null;
  initialResultUrl?: string | null;
}) {
  const [status, setStatus] = useState(initialStatus);
  const [resultText, setResultText] = useState<string | null>(initialResultText || null);
  const [resultUrl, setResultUrl] = useState<string | null>(initialResultUrl || null);
  const [loading, setLoading] = useState(false);

  const isFinal = status === "done" || status === "error";

  useEffect(() => {
    if (isFinal) return;
    let stop = false;

    const tick = async () => {
      try {
        const res = await fetch(`/api/jobs/${id}`, { cache: "no-store" });
        if (!res.ok) return;
        const row = await res.json();
        if (!stop) {
          setStatus(row.status || "unknown");
          setResultText(row.result_text || null);
          setResultUrl(row.result_url || null);
        }
      } catch {}
    };

    tick();
    const h = setInterval(tick, 2000);
    return () => { stop = true; clearInterval(h); };
  }, [id, isFinal]);

  const retry = async () => {
    setLoading(true);
    try {
      await fetch(`/api/jobs/${id}`, { method: "POST", cache: "no-store" });
      const res = await fetch(`/api/jobs/${id}`, { cache: "no-store" });
      if (res.ok) {
        const row = await res.json();
        setStatus(row.status || "unknown");
        setResultText(row.result_text || null);
        setResultUrl(row.result_url || null);
      }
    } finally {
      setLoading(false);
    }
  };

  const copy = async () => {
    if (!resultText) return;
    await navigator.clipboard.writeText(resultText);
    alert("Copied!");
  };

  const downloadText = () => {
    if (!resultText) return;
    const blob = new Blob([resultText], { type: "text/plain;charset=utf-8" });
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
      <p>Status: <span className="font-medium">{status}</span></p>

      {resultUrl ? (
        <div className="space-y-2">
          <a className="underline" href={resultUrl} target="_blank" rel="noreferrer">Open result</a>
          {/* If it's a video/image, you can preview it here based on content-type */}
        </div>
      ) : null}

      {resultText ? (
        <>
          <div className="rounded-lg border border-white/10 p-4 bg-white/5">
            <pre className="whitespace-pre-wrap text-sm">{resultText}</pre>
          </div>
          <div className="flex gap-3">
            <button className="rounded px-3 py-2 bg-blue-600/80 hover:bg-blue-600" onClick={copy}>Copy</button>
            <button className="rounded px-3 py-2 bg-blue-600/80 hover:bg-blue-600" onClick={downloadText}>Download .txt</button>
          </div>
        </>
      ) : !isFinal ? (
        <p className="text-sm text-gray-400">Processing… this will update automatically.</p>
      ) : (
        <p className="text-sm text-gray-400">No result available.</p>
      )}

      {isFinal && (
        <button
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
