// src/app/create/page.tsx
"use client";

import React, { useMemo, useState } from "react";
import styles from "./create.module.css";
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

  const canShowAdvanced = useMemo(() => mode === "advanced" && !file, [mode, file]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
  }

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
      // ✅ CASE 1: FILE PRESENT → upload to Supabase → call /api/clipper
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
                `  Time: ${Number(start).toFixed(2)} → ${Number(end).toFixed(2)}s`,
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

      // ✅ CASE 2: NO FILE → /api/generate
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
        job?.output_script ||
        data?.text ||
        "Generated successfully, but no notes were returned.";

      setResult(notes);

      const url =
        job?.output_video_url ||
        job?.edited_url ||
        job?.source_url ||
        null;

      setEditedUrl(url);
    } catch (err: any) {
      console.error("Generate error (client):", err);
      setError(err?.message || "Unexpected error.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className={styles.createShell}>
      <div className={styles.createInner}>
        <h1 className={styles.createTitle}>Type what you want or upload a file</h1>
        <p className={styles.createSub}>
          Drop a video/audio to auto-find hooks, or describe what you want for a script.
        </p>

        {/* Mode toggle (kept but simpler UI) */}
        <div className={styles.row} style={{ marginBottom: 12 }}>
          <button
            type="button"
            className={styles.btn}
            onClick={() => setMode("basic")}
            aria-pressed={mode === "basic"}
          >
            Basic
          </button>
          <button
            type="button"
            className={styles.btn}
            onClick={() => setMode("advanced")}
            aria-pressed={mode === "advanced"}
          >
            Advanced
          </button>
        </div>

        <div className={styles.createCard} style={{ marginBottom: 16 }}>
          <textarea
            style={{
              width: "100%",
              minHeight: 140,
              resize: "vertical",
              borderRadius: 12,
              padding: 12,
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(0,0,0,0.25)",
              color: "rgba(255,255,255,0.92)",
              outline: "none",
            }}
            placeholder={
              file
                ? "Optional: context or goal for the clips"
                : "Example: Turn this podcast into 5 viral TikToks"
            }
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />

          {canShowAdvanced && (
            <div style={{ marginTop: 12, display: "grid", gap: 10, gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}>
              <div>
                <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 6 }}>Platform</div>
                <select
                  className={styles.input}
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                >
                  <option value="TikTok">TikTok</option>
                  <option value="Reels">Instagram Reels</option>
                  <option value="Shorts">YouTube Shorts</option>
                  <option value="All">All of the above</option>
                </select>
              </div>

              <div>
                <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 6 }}>Tone</div>
                <select
                  className={styles.input}
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                >
                  <option value="Casual">Casual</option>
                  <option value="High-energy">High-energy</option>
                  <option value="Storytelling">Storytelling</option>
                  <option value="Authority">Authority</option>
                </select>
              </div>

              <div>
                <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 6 }}>Goal</div>
                <input
                  className={styles.input}
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  placeholder="Drive sales, grow page, etc."
                />
              </div>

              <div>
                <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 6 }}>Length (seconds)</div>
                <input
                  className={styles.input}
                  type="number"
                  min={5}
                  max={180}
                  value={lengthSeconds}
                  onChange={(e) => setLengthSeconds(e.target.value)}
                />
              </div>
            </div>
          )}

          <div className={styles.row} style={{ marginTop: 12 }}>
            <input className={styles.input} type="file" onChange={handleFileChange} />
            <button
              type="button"
              className={`${styles.btn} ${styles.btnPrimary}`}
              onClick={handleGenerate}
              disabled={loading}
            >
              {loading
                ? file
                  ? "Finding hooks..."
                  : "Thinking..."
                : file
                ? "Find hooks from file"
                : "Generate script"}
            </button>
          </div>

          {error && (
            <div style={{ marginTop: 12, color: "rgba(255,120,120,0.9)", fontSize: 13 }}>
              {error}
            </div>
          )}
        </div>

        {(result || editedUrl) && !error && (
          <div className={styles.createCard}>
            <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 10 }}>Result</div>

            {editedUrl && (
              <p style={{ marginTop: 0, marginBottom: 10 }}>
                <strong>Edited video:</strong>{" "}
                <a href={editedUrl} target="_blank" rel="noreferrer">
                  Open clip
                </a>
              </p>
            )}

            {result && (
              <pre
                style={{
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  margin: 0,
                  fontSize: 13,
                  lineHeight: 1.5,
                  color: "rgba(255,255,255,0.90)",
                }}
              >
                {result}
              </pre>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
