"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type JobType = "hooks" | "caption" | "clip" | "resize";

export default function NewJobPage() {
  const router = useRouter();
  const [type, setType] = useState<JobType>("hooks");
  const [title, setTitle] = useState("Untitled Job");
  const [prompt, setPrompt] = useState("");
  const [inputUrl, setInputUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function createJob(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr(null);

    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          title,
          prompt: prompt || undefined,
          input_url: inputUrl || undefined,
          // you can pass extra settings here depending on type:
          // params: { start: 10, end: 25, target_aspect: "9:16" }
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to create job");

      // go to job detail
      router.push(`/jobs/${data.id}`);
    } catch (e: any) {
      setErr(e.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 720, margin: "40px auto", padding: 16 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 16 }}>Create Job</h1>

      <form onSubmit={createJob} style={{ display: "grid", gap: 12 }}>
        <label>
          <div style={{ marginBottom: 4 }}>Title</div>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Untitled Job"
            required
            style={inputStyle}
          />
        </label>

        <label>
          <div style={{ marginBottom: 4 }}>Type</div>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as JobType)}
            style={inputStyle}
          >
            <option value="hooks">Find Hooks (GPT)</option>
            <option value="caption">Transcribe / Captions (Whisper)</option>
            <option value="clip">Clip Video (Replicate)</option>
            <option value="resize">Resize Video (Replicate)</option>
          </select>
        </label>

        <label>
          <div style={{ marginBottom: 4 }}>
            Input URL (video or audio URL) <span style={{ opacity: 0.6 }}>(required for clip/resize/caption)</span>
          </div>
          <input
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            placeholder="https://…/file.mp4"
            style={inputStyle}
          />
        </label>

        <label>
          <div style={{ marginBottom: 4 }}>
            Prompt / Transcript <span style={{ opacity: 0.6 }}>(used by Hooks; optional for others)</span>
          </div>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Paste notes or transcript for hook generation"
            rows={6}
            style={inputStyle}
          />
        </label>

        {err && (
          <div style={{ color: "#f87171", background: "#2b1f1f", padding: 8, borderRadius: 6 }}>
            {err}
          </div>
        )}

        <button type="submit" disabled={loading} style={buttonStyle(loading)}>
          {loading ? "Creating…" : "Create job"}
        </button>
      </form>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 8,
  border: "1px solid #333",
  background: "#0f1115",
  color: "#e5e7eb",
  outline: "none",
};

function buttonStyle(disabled: boolean): React.CSSProperties {
  return {
    padding: "10px 14px",
    borderRadius: 8,
    border: "1px solid transparent",
    background: disabled ? "#334155" : "#2563eb",
    color: "white",
    cursor: disabled ? "not-allowed" : "pointer",
    fontWeight: 600,
  };
}
