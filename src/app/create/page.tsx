"use client";

import "./page.css";
import React, { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";

type Mode = "basic" | "advanced";

export default function CreatePage() {
  const [mode, setMode] = useState<Mode>("basic");
  const [prompt, setPrompt] = useState("");
  const [platform, setPlatform] = useState("TikTok");
  const [goal, setGoal] = useState("Get more views, drive sales, grow page, etc.");
  const [lengthSeconds, setLengthSeconds] = useState("30");
  const [tone, setTone] = useState("Casual");
  const [file, setFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [editedUrl, setEditedUrl] = useState<string | null>(null);

  async function handleGenerate() {
    setError(null);
    setResult(null);
    setEditedUrl(null);

    if (!prompt.trim() && !file) {
      setError("Add a quick idea or upload a file first.");
      return;
    }

    setLoading(true);
    try {
      if (file) {
        const path = `${Date.now()}-${file.name}`;

        const { data: uploadData, error: uploadError } =
          await supabaseBrowser.storage.from("raw_uploads").upload(path, file, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError || !uploadData) {
          setError("Failed to upload file. Try a smaller file or different format.");
          return;
        }

        const {
          data: { publicUrl },
        } = supabaseBrowser.storage.from("raw_uploads").getPublicUrl(uploadData.path);

        const res = await fetch("/api/clipper", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fileUrl: publicUrl, prompt }),
        });

        const data = await res.json();
        if (!data.success) {
          setError(data.error || "Failed to find hooks.");
          return;
        }

        const transcript: string = data.transcript || "";
        const clips: any[] = Array.isArray(data.clips) ? data.clips : [];

        let text = "";

        if (transcript) {
          text += "TRANSCRIPT\n──────────\n";
          text += transcript.trim() + "\n\n";
        }

        if (clips.length > 0) {
          text += "HOOKS + MOMENTS\n──────────────\n";
          text += clips
            .map((clip, idx) => {
              const start = clip.start ?? 0;
              const end = clip.end ?? 0;
              const hook = clip.hook_line || "";
              const desc = clip.description || "";

              return [
                `Moment ${idx + 1}`,
                `  Time: ${start} → ${end}s`,
                hook ? `  Hook: ${hook}` : null,
                desc ? `  Why it works: ${desc}` : null,
              ]
                .filter(Boolean)
                .join("\n");
            })
            .join("\n\n");
        }

        setResult(text);
        return;
      }

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, platform, goal, lengthSeconds, tone }),
      });

      const data = await res.json();
      if (!data.success) {
        setError(data.error || "Failed to generate hooks.");
        return;
      }

      setResult(data.text || "Generated successfully.");
    } catch (err: any) {
      setError(err?.message || "Unexpected error.");
    } finally {
      setLoading(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) setFile(f);
  }

  return (
    <main className="create-root">
      <section className="create-shell">
        <header className="create-header">
          <h1>Fix your hook before you post</h1>

          <div className="create-mode-toggle">
            <button
              className={`create-mode-btn ${mode === "basic" ? "create-mode-btn--active" : ""}`}
              onClick={() => setMode("basic")}
            >
              Quick
            </button>
            <button
              className={`create-mode-btn ${mode === "advanced" ? "create-mode-btn--active" : ""}`}
              onClick={() => setMode("advanced")}
            >
              Dialed
            </button>
          </div>
        </header>

        <div className={`create-main-card ${loading ? "is-loading" : ""}`}>
          <div className="create-textarea-wrap">
            <textarea
              className="create-textarea"
              placeholder={
                file
                  ? "Optional: what should viewers feel / do after watching?"
                  : "Example: Give me 10 scroll-stopping hooks for a video about (topic)."
              }
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </div>

          <div className="create-bottom-row">
            <label className="create-file-bar">
              <span className="create-file-label">
                <span className="create-file-bullet">•</span>
                {file ? file.name : "Choose file / drop here"}
              </span>
              <input type="file" className="create-file-input" onChange={handleFileChange} />
            </label>

            {/* ✅ BUTTON + PRICING LINE */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
              <button
                type="button"
                className="create-generate-btn"
                onClick={handleGenerate}
                disabled={loading}
              >
                {loading ? "Finding hooks..." : file ? "Find hooks from file" : "Generate viral hooks"}
              </button>

              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.55)" }}>
                3 free generations • then $19/mo for unlimited hooks
              </span>
            </div>
          </div>

          <p className="create-tip">
            Tip: Drop a video/audio to auto-find the strongest moments + hook lines, or type your idea to generate scroll-stopping hooks.
          </p>

          {error && <p className="create-error">{error}</p>}

          {result && !error && (
            <div className="create-result">
              <h3>Hooks</h3>
              <pre>{result}</pre>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
