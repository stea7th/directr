"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

type Job = {
  id: string;
  title: string | null;
  status: "queued" | "processing" | "done" | "error";
  result_text: string | null;
  result_url: string | null;
  error: string | null;
  type: string | null;
};

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [rerunLoading, setRerunLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function fetchJob() {
    setRefreshing(true);
    try {
      const res = await fetch(`/api/jobs/${id}`, { cache: "no-store" });
      const data = await res.json();
      setJob(data);
    } finally {
      setRefreshing(false);
    }
  }

  useEffect(() => {
    fetchJob();
    const t = setInterval(fetchJob, 3000);
    return () => clearInterval(t);
  }, [id]);

  async function runAgain() {
    setRerunLoading(true);
    setMsg(null);
    try {
      const res = await fetch(`/api/jobs/${id}`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to run job");
      setMsg("Started. Refreshing…");
      setTimeout(fetchJob, 1000);
    } catch (e: any) {
      setMsg(e.message || String(e));
    } finally {
      setRerunLoading(false);
    }
  }

  function copyText() {
    if (job?.result_text) navigator.clipboard.writeText(job.result_text);
  }

  function downloadText() {
    if (!job?.result_text) return;
    const blob = new Blob([job.result_text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${job.title || "result"}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div style={{ maxWidth: 900, margin: "40px auto", padding: 16 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700 }}>
        {job?.title || `Job #${id}`}
      </h1>

      {job ? (
        <div style={{ marginTop: 12 }}>
          <div style={{ opacity: 0.8, marginBottom: 12 }}>
            <div><b>Status:</b> {job.status}</div>
            {job.type && <div><b>Type:</b> {job.type}</div>}
            {job.error && <div style={{ color: "#f87171" }}><b>Error:</b> {job.error}</div>}
          </div>

          {/* Result URL (video/download link) */}
          {job.result_url && (
            <div style={{ margin: "12px 0" }}>
              <a href={job.result_url} target="_blank" rel="noreferrer" style={linkStyle}>
                Download / View result
              </a>
            </div>
          )}

          {/* Result text (hooks, transcript, etc.) */}
          {job.result_text && (
            <pre
              style={{
                whiteSpace: "pre-wrap",
                background: "#0b0f16",
                border: "1px solid #1f2937",
                borderRadius: 8,
                padding: 12,
                marginTop: 12,
              }}
            >
{job.result_text}
            </pre>
          )}

          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <button onClick={runAgain} disabled={rerunLoading} style={buttonStyle(rerunLoading)}>
              {rerunLoading ? "Running…" : "Run again"}
            </button>

            {job.result_text && (
              <>
                <button onClick={copyText} style={buttonStyle(false)}>Copy</button>
                <button onClick={downloadText} style={buttonStyle(false)}>Download .txt</button>
              </>
            )}

            <Link href="/jobs" style={linkStyle}>← Back to jobs</Link>
          </div>

          {msg && <div style={{ marginTop: 8, opacity: 0.8 }}>{msg}</div>}
        </div>
      ) : (
        <div>Loading…</div>
      )}
    </div>
  );
}

const linkStyle: React.CSSProperties = {
  color: "#60a5fa",
  textDecoration: "underline",
};

function buttonStyle(disabled: boolean): React.CSSProperties {
  return {
    padding: "8px 12px",
    borderRadius: 8,
    border: "1px solid transparent",
    background: disabled ? "#334155" : "#2563eb",
    color: "white",
    cursor: disabled ? "not-allowed" : "pointer",
    fontWeight: 600,
  };
}
