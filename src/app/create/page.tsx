// src/app/create/page.tsx
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
          text += "CLIPS\n──────\n";
          text += clips
            .map((clip, idx) => {
              const start = clip.start ?? clip.start_seconds ?? 0;
              const end = clip.end ?? clip.end_seconds ?? 0;
              const hook = clip.hook_line || "";
              const desc = clip.description || "";

              return [
                `Clip ${idx + 1}`,
                `  Time: ${start?.toFixed?.(2) ?? start} → ${end?.toFixed?.(2) ?? end}s`,
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
        setEditedUrl(null);
        return;
      }

      // CASE 2: NO FILE → classic script generator
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, platform, goal, lengthSeconds, tone }),
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
        setError(data.error || "Failed to generate.");
        return;
      }

      const job = data?.job;
      const notes =
        job?.output_script ||
        data?.text ||
        "Generated successfully, but no notes were returned.";

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
    <main className={styles.createRoot}>
      <section className={styles.createShell}>
        <header className={styles.createHeader}>
          <h1>Type what you want or upload a file</h1>

          <div className={styles.createModeToggle}>
            <button
              type="button"
              className={`${styles.createModeBtn} ${
                mode === "basic" ? styles.createModeBtnActive : ""
              }`}
              onClick={() => setMode("basic")}
            >
              Basic
            </button>

            <button
              type="button"
              className={`${styles.createModeBtn} ${
                mode === "advanced" ? styles.createModeBtnActive : ""
              }`}
              onClick={() => setMode("advanced")}
            >
              Advanced
            </button>
          </div>
        </header>

        <div className={styles.createMainCard}>
          <div className={styles.createTextareaWrap}>
            <textarea
              name="prompt"
              className={styles.createTextarea}
              placeholder={
                file
                  ? "Optional: context or goal for the clips"
                  : "Example: Turn this podcast into 5 viral TikToks"
              }
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </div>

          {mode === "advanced" && !file && (
            <div className={styles.createAdvancedRow}>
              <div className={styles.createAdvField}>
                <label>Platform</label>
                <select value={platform} onChange={(e) => setPlatform(e.target.value)}>
                  <option value="TikTok">TikTok</option>
                  <option value="Reels">Instagram Reels</option>
                  <option value="Shorts">YouTube Shorts</option>
                  <option value="All">All of the above</option>
                </select>
              </div>

              <div className={styles.createAdvField}>
                <label>Goal</label>
                <input
                  type="text"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  placeholder="Drive sales, grow page, etc."
                />
              </div>

              <div className={styles.createAdvField}>
                <label>Length (seconds)</label>
                <input
                  type="number"
                  min={5}
                  max={180}
                  value={lengthSeconds}
                  onChange={(e) => setLengthSeconds(e.target.value)}
                />
              </div>

              <div className={styles.createAdvField}>
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

          <div className={styles.createBottomRow}>
            <label className={styles.createFileBar}>
              <span className={styles.createFileLabel}>
                <span className={styles.createFileBullet}>•</span>
                {file ? file.name : "Choose File / Drop here"}
              </span>
              <input
                type="file"
                name="file"
                className={styles.createFileInput}
                onChange={handleFileChange}
              />
            </label>

            <button
              type="button"
              className={styles.createGenerateBtn}
              onClick={handleGenerate}
              disabled={loading}
            >
              {loading ? (file ? "Finding hooks..." : "Thinking...") : file ? "Find hooks from file" : "Generate script"}
            </button>
          </div>

          <p className={styles.createTip}>
            Tip: Drop a video/audio to auto-find hooks, or just describe what you want for a script. We&apos;ll handle the rest.
          </p>

          {error && <p className={styles.createError}>{error}</p>}

          {(result || editedUrl) && !error && (
            <div className={styles.createResult}>
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

      <section className={styles.createTilesSection}>
        <div className={styles.createTilesGrid}>
          <article className={styles.createTile}>
            <h2>Create</h2>
            <p>Upload → get captioned clips</p>
          </article>

          <article className={styles.createTile}>
            <h2>Clipper</h2>
            <p>Auto-find hooks &amp; moments</p>
          </article>

          <article className={styles.createTile}>
            <h2>Planner</h2>
            <p>Plan posts &amp; deadlines</p>
          </article>
        </div>
      </section>
    </main>
  );
}
