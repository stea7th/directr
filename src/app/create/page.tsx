"use client";

import "./page.css";
import React, { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { useRouter } from "next/navigation";

type Mode = "basic" | "advanced";

export default function CreatePage() {
  const router = useRouter();

  const [mode, setMode] = useState<Mode>("basic");
  const [prompt, setPrompt] = useState("");
  const [platform, setPlatform] = useState("TikTok");
  const [goal, setGoal] = useState("Get more views, drive sales, grow page, etc.");
  const [lengthSeconds, setLengthSeconds] = useState("30");
  const [tone, setTone] = useState("Casual");
  const [file, setFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [limitReached, setLimitReached] = useState(false);

  const [result, setResult] = useState<string | null>(null);
  const [editedUrl, setEditedUrl] = useState<string | null>(null);

  async function handleGenerate() {
    setError(null);
    setLimitReached(false);
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

        // cache-bust the route so deploys never stick you on stale code
        const url = `/api/clipper?t=${Date.now()}`;

        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
          body: JSON.stringify({ fileUrl: publicUrl, prompt }),
          cache: "no-store",
          credentials: "include",
        });

        if (res.status === 402) {
          setLimitReached(true);
          return;
        }

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
          if (data?.error === "limit_reached") {
            setLimitReached(true);
            return;
          }
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

      // CASE 2: NO FILE → hook generator
      const body = { prompt, platform, goal, lengthSeconds, tone };

      const url = `/api/generate?t=${Date.now()}`;

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
        body: JSON.stringify(body),
        cache: "no-store",
        credentials: "include",
      });

      if (res.status === 402) {
        setLimitReached(true);
        return;
      }

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
        if (data?.error === "limit_reached") {
          setLimitReached(true);
          return;
        }
        setError(data.error || "Failed to generate hooks.");
        return;
      }

      const notes = data?.text || "Generated successfully, but no hooks were returned.";
      setResult(notes);

      const job = data?.job;
      const url2 = job?.output_video_url || job?.edited_url || job?.source_url || null;
      setEditedUrl(url2);
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

  async function handleUpgrade() {
    try {
      setError(null);
      setLoading(true);

      const priceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID || "";
      if (!priceId) {
        router.push("/pricing");
        return;
      }

      const url = `/api/checkout?t=${Date.now()}`;

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
        body: JSON.stringify({ priceId }),
        cache: "no-store",
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok || !data?.success || !data?.url) {
        setError(data?.error || "Could not start checkout. Try again.");
        return;
      }

      window.location.href = data.url;
    } catch (e: any) {
      setError(e?.message || "Could not start checkout. Try again.");
    } finally {
      setLoading(false);
    }
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

            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
              <button type="button" className="create-generate-btn" onClick={handleGenerate} disabled={loading}>
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

          {limitReached && !error && (
            <div className="create-result">
              <h3>You’ve used your free hooks.</h3>
              <p style={{ margin: "8px 0 12px", color: "rgba(255,255,255,0.75)", fontSize: 13, lineHeight: 1.5 }}>
                Creators who post consistently don’t guess their hooks.
                <br />
                They generate them.
              </p>

              <button type="button" className="create-generate-btn" onClick={handleUpgrade} disabled={loading}>
                {loading ? "Opening checkout..." : "Unlock unlimited hooks — $19/mo"}
              </button>

              <p style={{ margin: "10px 0 0", fontSize: 12, color: "rgba(255,255,255,0.55)" }}>
                Cancel anytime. One viral video pays for this 100×.
              </p>
            </div>
          )}

          {(result || editedUrl) && !error && !limitReached && (
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
