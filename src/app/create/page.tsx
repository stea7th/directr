"use client";

import React, { useState } from "react";
import styles from "./page.module.css";
import { supabaseBrowser } from "@/lib/supabase/browser";

type Mode = "basic" | "advanced";

export default function CreatePage() {
  const [mode, setMode] = useState<Mode>("basic");
  const [prompt, setPrompt] = useState("");
  const [platform, setPlatform] = useState("TikTok");
  const [goal, setGoal] = useState("Drive sales, grow page, etc.");
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
      setError("Add a quick description or upload a file first.");
      return;
    }

    setLoading(true);
    try {
      // FILE MODE → upload to Supabase → /api/clipper
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
          console.error("Non-JSON response from /api/clipper:", res.status, text.slice(0, 200));
          setError(`Server returned non-JSON (status ${res.status}).`);
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
          text += "TRANSCRIPT\n──────────\n" + transcript.trim() + "\n\n";
        }

        if (clips.length > 0) {
          text += "CLIPS\n──────\n";
          text += clips
            .map((clip, idx) => {
              const start = clip.start ?? clip.start_seconds ?? 0;
              const end = clip.end ?? clip.end_seconds ?? 0;
              const hook = clip.hook_line || "";
              const desc = clip.description || "";
              return [
                `Clip ${idx + 1}`,
                `  Time: ${start} → ${end}s`,
                hook ? `  Hook: ${hook}` : null,
                desc ? `  Desc: ${desc}` : null,
              ]
                .filter(Boolean)
                .join("\n");
            })
            .join("\n\n");
        } else {
          text += "No clips were returned, but transcript is available above.";
        }

        setResult(text);
        return;
      }

      // NO FILE → /api/generate
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, platform, goal, lengthSeconds, tone }),
      });

      const contentType = res.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        const text = await res.text();
        console.error("Non-JSON response from /api/generate:", res.status, text.slice(0, 200));
        setError(`Server returned non-JSON (status ${res.status}).`);
        return;
      }

      const data = await res.json();
      if (!data.success) {
        setError(data.error || "Failed to generate.");
        return;
      }

      const job = data?.job;
      const notes =
        job?.output_script || data?.text || "Generated successfully, but no notes were returned.";

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

  return (
    <main className={styles["create-root"]}>
      <section className={styles["create-shell"]}>
        <header className={styles["create-header"]}>
          <h1>Type what you want or upload a file</h1>

          <div className={styles["create-mode-toggle"]}>
            <button
              type="button"
              className={`${styles["create-mode-btn"]} ${
                mode === "basic" ? styles["create-mode-btn--active"] : ""
              }`}
              onClick={() => setMode("basic")}
            >
              Basic
            </button>
            <button
              type="button"
              className={`${styles["create-mode-btn"]} ${
                mode === "advanced" ? styles["create-mode-btn--active"] : ""
              }`}
              onClick={() => setMode("advanced")}
            >
              Advanced
            </button>
          </div>
        </header>

        <div className={styles["create-main-card"]}>
          <div className={styles["create-textarea-wrap"]}>
            <textarea
              className={styles["create-textarea"]}
              placeholder={
                file ? "Optional: context or goal for the clips" : "Example: Turn this podcast into 5 viral TikToks"
              }
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </div>

          {mode === "advanced" && !file && (
            <div className={styles["create-advanced-row"]}>
              <div className={styles["create-adv-field"]}>
                <label>Platform</label>
                <select value={platform} onChange={(e) => setPlatform(e.target.value)}>
                  <option value="TikTok">TikTok</option>
                  <option value="Reels">Instagram Reels</option>
                  <option value="Shorts">YouTube Shorts</option>
                  <option value="All">All of the above</option>
                </select>
              </div>

              <div className={styles["create-adv-field"]}>
                <label>Goal</label>
                <input value={goal} onChange={(e) => setGoal(e.target.value)} />
              </div>

              <div className={styles["create-adv-field"]}>
                <label>Length (seconds)</label>
                <input
                  type="number"
                  min={5}
                  max={180}
                  value={lengthSeconds}
                  onChange={(e) => setLengthSeconds(e.target.value)}
                />
              </div>

              <div className={styles["create-adv-field"]}>
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

          <div className={styles["create-bottom-row"]}>
            <label className={styles["create-file-bar"]}>
              <span className={styles["create-file-label"]}>
                {file ? file.name : "Choose File / Drop here"}
              </span>
              <input
                type="file"
                className={styles["create-file-input"]}
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </label>

            <button
              type="button"
              className={styles["create-generate-btn"]}
              onClick={handleGenerate}
              disabled={loading}
            >
              {loading ? (file ? "Finding hooks..." : "Thinking...") : file ? "Find hooks from file" : "Generate script"}
            </button>
          </div>

          <p className={styles["create-tip"]}>
            Tip: Drop a video/audio to auto-find hooks, or just describe what you want for a script.
          </p>

          {error && <p className={styles["create-error"]}>{error}</p>}

          {(result || editedUrl) && !error && (
            <div className={styles["create-result"]}>
              <h3>Result</h3>
              {editedUrl && (
                <p style={{ marginBottom: 8 }}>
                  <strong>Edited video:</strong>{" "}
                  <a href={editedUrl} target="_blank" rel="noreferrer">
                    Open clip
                  </a>
                </p>
              )}
              {result && (
                <>
                  <strong>AI notes:</strong>
                  <pre>{result}</pre>
                </>
              )}
            </div>
          )}
        </div>
      </section>

      <section className={styles["create-tiles-section"]}>
        <div className={styles["create-tiles-grid"]}>
          <article className={styles["create-tile"]}>
            <h2>Create</h2>
            <p>Upload → get captioned clips</p>
          </article>
          <article className={styles["create-tile"]}>
            <h2>Clipper</h2>
            <p>Auto-find hooks &amp; moments</p>
          </article>
          <article className={styles["create-tile"]}>
            <h2>Planner</h2>
            <p>Plan posts &amp; deadlines</p>
          </article>
        </div>
      </section>
    </main>
  );
}
