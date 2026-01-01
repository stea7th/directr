// src/app/create/page.tsx
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
      // CASE 1: FILE PRESENT → upload to Supabase → send URL to /api/clipper
      if (file) {
        const path = `${Date.now()}-${file.name}`;

        const { data: uploadData, error: uploadError } =
          await supabaseBrowser.storage.from("raw_uploads").upload(path, file, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError || !uploadData) {
          console.error("Supabase upload error:", uploadError);
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

        const contentType = res.headers.get("content-type") || "";
        if (!contentType.includes("application/json")) {
          const text = await res.text();
          console.error("Non-JSON response from /api/clipper:", {
            status: res.status,
            textSnippet: text.slice(0, 200),
          });
          setError(`Server returned non-JSON (status ${res.status}). Route might be misconfigured.`);
          return;
        }

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
          text += transcript.trim();
          text += "\n\n";
        }

        if (clips.length > 0) {
          text += "HOOKS + MOMENTS\n──────────────\n";
          text += clips
            .map((clip, idx) => {
              const start = clip.start ?? clip.start_seconds ?? 0;
              const end = clip.end ?? clip.end_seconds ?? 0;
              const hook = clip.hook_line || "";
              const desc = clip.description || "";

              return [
                `Moment ${idx + 1}`,
                `  Time: ${start.toFixed?.(2) ?? start} → ${end.toFixed?.(2) ?? end}s`,
                hook ? `  Hook: ${hook}` : null,
                desc ? `  Why it works: ${desc}` : null,
              ]
                .filter(Boolean)
                .join("\n");
            })
            .join("\n\n");
        } else {
          text += "No moments were returned, but the transcript is available above.";
        }

        setResult(text);
        setEditedUrl(null);
        return;
      }

      // CASE 2: NO FILE → hook generator (keep route name, change framing)
      const body = { prompt, platform, goal, lengthSeconds, tone };

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const contentType = res.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        const text = await res.text();
        console.error("Non-JSON response from /api/generate:", {
          status: res.status,
          textSnippet: text.slice(0, 200),
        });
        setError(`Server returned non-JSON (status ${res.status}). Route might be misconfigured.`);
        return;
      }

      const data = await res.json();

      if (!data.success) {
        setError(data.error || "Failed to generate hooks.");
        return;
      }

      const job = data?.job;
      const notes =
        job?.output_script ||
        data?.text ||
        "Generated successfully, but no hooks were returned.";

      setResult(notes);

      const url = job?.output_video_url || job?.edited_url || job?.source_url || null;
      setEditedUrl(url);
    } catch (err: any) {
      console.error("Generate error (client):", err);
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
              type="button"
              className={`create-mode-btn ${mode === "basic" ? "create-mode-btn--active" : ""}`}
              onClick={() => setMode("basic")}
            >
              Quick
            </button>
            <button
              type="button"
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
              name="prompt"
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

          {mode === "advanced" && !file && (
            <div className="create-advanced-row">
              <div className="create-adv-field">
                <label>Platform</label>
                <select value={platform} onChange={(e) => setPlatform(e.target.value)}>
                  <option value="TikTok">TikTok</option>
                  <option value="Reels">Instagram Reels</option>
                  <option value="Shorts">YouTube Shorts</option>
                  <option value="All">All of the above</option>
                </select>
              </div>

              <div className="create-adv-field">
                <label>Goal</label>
                <input
                  type="text"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  placeholder="Get more views, drive sales, grow page, etc."
                />
              </div>

              <div className="create-adv-field">
                <label>Length (seconds)</label>
                <input
                  type="number"
                  min={5}
                  max={180}
                  value={lengthSeconds}
                  onChange={(e) => setLengthSeconds(e.target.value)}
                />
              </div>

              <div className="create-adv-field">
                <label>Tone</label>
                <select value={tone} onChange={(e) => setTone(e.target.value)}>
                  <option value="Casual">Casual</option>
                  <option value="High-energy">High-energy</option>
                  <option value="Storytelling">Storytelling</option>
                  <option value="Authority">Authority</option>
                </select>
              </div>
            </div>
          )}

          <div className="create-bottom-row">
            <label className="create-file-bar">
              <span className="create-file-label">
                <span className="create-file-bullet">•</span>
                {file ? file.name : "Choose file / drop here"}
              </span>
              <input type="file" name="file" className="create-file-input" onChange={handleFileChange} />
            </label>

            <button type="button" className="create-generate-btn" onClick={handleGenerate} disabled={loading}>
              {loading ? (file ? "Finding hooks..." : "Finding hooks...") : file ? "Find hooks from file" : "Generate viral hooks"}
            </button>
          </div>

          <p className="create-tip">
            Tip: Drop a video/audio to auto-find the strongest moments + hook lines, or type your idea to generate scroll-stopping hooks.
          </p>

          {error && <p className="create-error">{error}</p>}

          {(result || editedUrl) && !error && (
            <div className="create-result">
              <h3>Hooks</h3>

              {editedUrl && (
                <p style={{ marginBottom: 8 }}>
                  <strong>Clip:</strong>{" "}
                  <a href={editedUrl} target="_blank" rel="noreferrer">
                    Open
                  </a>
                </p>
              )}

              {result && (
                <>
                  <strong>Output:</strong>
                  <pre>{result}</pre>
                </>
              )}
            </div>
          )}
        </div>
      </section>

      <section className="create-tiles-section">
        <div className="create-tiles-grid">
          <article className="create-tile">
            <h2>Hooks</h2>
            <p>Upload → get scroll-stopping hook lines</p>
          </article>

          <article className="create-tile">
            <h2>Moments</h2>
            <p>Auto-find the strongest points to clip</p>
          </article>

          <article className="create-tile">
            <h2>Captions</h2>
            <p>Captions designed to keep viewers watching</p>
          </article>
        </div>
      </section>
    </main>
  );
}
