// src/app/create/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreatePage() {
  const router = useRouter();

  const [prompt, setPrompt] = useState("");
  const [platform, setPlatform] = useState("TikTok");
  const [goal, setGoal] = useState("Drive sales / grow page");
  const [length, setLength] = useState("30");
  const [tone, setTone] = useState("Casual");
  const [fileName, setFileName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) setFileName(f.name);
  }

  async function handleGenerate() {
    setError(null);

    if (!prompt.trim()) {
      setError("Add a prompt first.");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          platform,
          goal,
          length,
          tone,
          // file isn’t wired yet – we’ll add upload later
        }),
      });

      const raw = await res.text();
      let data: any = null;

      // Try to parse JSON – if it’s HTML (<!DOCTYPE…>)
      // we give a clean message instead of the crash
      try {
        data = JSON.parse(raw);
      } catch {
        setError(
          `Server returned non-JSON (status ${res.status}). First part: ` +
            raw.slice(0, 120).replace(/\s+/g, " ") +
            "…"
        );
        return;
      }

      if (!res.ok) {
        setError(data?.error || `Error ${res.status}`);
        return;
      }

      if (data?.jobId) {
        router.push(`/jobs/${data.jobId}`);
      } else {
        setError(
          "Generated successfully, but no job id was returned. Ask your dev (me) to wire this up fully."
        );
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Unexpected error talking to /api/generate.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="create-root">
      <section className="create-shell">
        <header className="create-header">
          <h1>Type what you want or upload a file</h1>
        </header>

        <div className="create-main-card">
          {/* TEXTAREA */}
          <div className="create-textarea-wrap">
            <textarea
              name="prompt"
              className="create-textarea"
              placeholder="Example: Turn this podcast into 5 viral TikToks"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </div>

          {/* TWEAK OPTIONS ROW */}
          <div className="create-input-row">
            <div className="create-field">
              <span className="create-label">Platform</span>
              <select
                className="create-select"
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
              >
                <option>TikTok</option>
                <option>Reels</option>
                <option>Shorts</option>
                <option>Twitter</option>
              </select>
            </div>

            <div className="create-field create-field-grow">
              <span className="create-label">Goal</span>
              <input
                className="create-input"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="Drive sales, grow page, etc."
              />
            </div>

            <div className="create-field">
              <span className="create-label">Length (seconds)</span>
              <input
                className="create-input"
                value={length}
                onChange={(e) => setLength(e.target.value)}
              />
            </div>

            <div className="create-field">
              <span className="create-label">Tone</span>
              <select
                className="create-select"
                value={tone}
                onChange={(e) => setTone(e.target.value)}
              >
                <option>Casual</option>
                <option>High-energy</option>
                <option>Storytelling</option>
                <option>Authority</option>
              </select>
            </div>
          </div>

          {/* FILE + BUTTON ROW */}
          <div className="create-bottom-row">
            <label className="create-file-bar">
              <span className="create-file-label">
                <span className="create-file-bullet">•</span>
                {fileName ? fileName : "Choose File / Drop here"}
              </span>
              <input
                type="file"
                name="file"
                className="create-file-input"
                onChange={handleFileChange}
              />
            </label>

            <button
              type="button"
              className="create-generate-btn"
              onClick={handleGenerate}
              disabled={loading}
            >
              {loading ? "Generating…" : "Generate"}
            </button>
          </div>

          <p className="create-tip">
            Tip: Drop a video/audio, or just describe what you want.
            We&apos;ll handle the rest.
          </p>

          {error && <p className="create-error">{error}</p>}
        </div>
      </section>

      <section className="create-tiles-section">
        <div className="create-tiles-grid">
          <article className="create-tile">
            <h2>Create</h2>
            <p>Upload → get captioned clips</p>
          </article>

          <article className="create-tile">
            <h2>Clipper</h2>
            <p>Auto-find hooks &amp; moments</p>
          </article>

          <article className="create-tile">
            <h2>Planner</h2>
            <p>Plan posts &amp; deadlines</p>
          </article>
        </div>
      </section>

      {/* your original CSS + a few extra classes for the options row */}
      <style jsx>{`
        .create-root {
          min-height: calc(100vh - 64px);
          padding: 64px 24px 80px;
          background: radial-gradient(
              circle at top,
              rgba(255, 255, 255, 0.03),
              transparent 55%
            ),
            #050506;
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        @media (min-width: 900px) {
          .create-root {
            padding: 72px 64px 96px;
          }
        }

        .create-shell {
          max-width: 960px;
          margin: 0 auto;
          width: 100%;
        }

        .create-header h1 {
          font-size: 24px;
          line-height: 1.2;
          font-weight: 600;
          letter-spacing: 0.01em;
          color: #f5f5f7;
          margin-bottom: 20px;
        }

        @media (min-width: 900px) {
          .create-header h1 {
            font-size: 26px;
          }
        }

        .create-main-card {
          border-radius: 28px;
          background: radial-gradient(
                circle at 0% 0%,
                rgba(111, 146, 255, 0.08),
                transparent 45%
              ),
            radial-gradient(
                circle at 100% 0%,
                rgba(111, 210, 255, 0.05),
                transparent 50%
              ),
            #101014;
          box-shadow:
            0 28px 60px rgba(0, 0, 0, 0.85),
            inset 0 0 0 0.5px rgba(255, 255, 255, 0.02);
          padding: 28px 24px 24px;
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.04);
        }

        @media (min-width: 900px) {
          .create-main-card {
            padding: 32px 32px 28px;
          }
        }

        .create-textarea-wrap {
          border-radius: 22px;
          background: radial-gradient(
                circle at top left,
                rgba(255, 255, 255, 0.03),
                transparent 55%
              ),
            #050609;
          border: 1px solid rgba(255, 255, 255, 0.04);
          box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.01);
          padding: 18px 20px;
          margin-bottom: 18px;
        }

        @media (min-width: 900px) {
          .create-textarea-wrap {
            padding: 22px 24px;
          }
        }

        .create-textarea {
          width: 100%;
          min-height: 130px;
          resize: vertical;
          border: none;
          outline: none;
          background: transparent;
          color: #f5f5f7;
          font-size: 14px;
          line-height: 1.5;
          font-family: system-ui, -apple-system, BlinkMacSystemFont, "SF Pro Text",
            sans-serif;
        }

        .create-textarea::placeholder {
          color: rgba(255, 255, 255, 0.32);
        }

        /* new tweaks row */
        .create-input-row {
          display: grid;
          grid-template-columns: 1fr;
          gap: 10px;
          margin-bottom: 14px;
        }

        @media (min-width: 900px) {
          .create-input-row {
            grid-template-columns: 0.9fr 1.6fr 0.7fr 0.9fr;
          }
        }

        .create-field {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .create-field-grow {
          flex: 1;
        }

        .create-label {
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: rgba(255, 255, 255, 0.5);
        }

        .create-select,
        .create-input {
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: #050609;
          padding: 8px 12px;
          font-size: 12px;
          color: #f5f5f7;
          outline: none;
          width: 100%;
        }

        .create-select:focus,
        .create-input:focus {
          border-color: rgba(157, 196, 255, 0.7);
        }

        .create-select {
          appearance: none;
          background-image: linear-gradient(
            to bottom,
            rgba(255, 255, 255, 0.08),
            rgba(255, 255, 255, 0.02)
          );
        }

        .create-bottom-row {
          display: flex;
          flex-direction: column;
          gap: 10px;
          align-items: stretch;
        }

        @media (min-width: 900px) {
          .create-bottom-row {
            flex-direction: row;
            align-items: center;
            gap: 16px;
          }
        }

        .create-file-bar {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: flex-start;
          border-radius: 999px;
          padding: 12px 18px;
          border: 1px dashed rgba(255, 255, 255, 0.12);
          background: radial-gradient(
              circle at top,
              rgba(255, 255, 255, 0.04),
              transparent 60%
            );
          color: rgba(255, 255, 255, 0.7);
          font-size: 13px;
          cursor: pointer;
          overflow: hidden;
          transition:
            border-color 0.2s ease-out,
            background 0.2s ease-out,
            box-shadow 0.2s ease-out,
            transform 0.18s ease-out;
        }

        .create-file-bar:hover {
          border-color: rgba(157, 196, 255, 0.6);
          background: radial-gradient(
              circle at top,
              rgba(157, 196, 255, 0.12),
              transparent 65%
            );
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.7);
          transform: translateY(-1px);
        }

        .create-file-label {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          pointer-events: none;
        }

        .create-file-bullet {
          font-size: 12px;
          color: rgba(157, 196, 255, 0.9);
        }

        .create-file-input {
          position: absolute;
          inset: 0;
          opacity: 0;
          cursor: pointer;
        }

        .create-generate-btn {
          margin-left: auto;
          border-radius: 999px;
          padding: 10px 24px;
          border: 1px solid rgba(139, 187, 255, 0.7);
          background: radial-gradient(
                circle at 0% 0%,
                rgba(139, 187, 255, 0.45),
                rgba(50, 80, 130, 0.6)
              ),
            #171c26;
          color: #f5f7ff;
          font-weight: 500;
          font-size: 14px;
          letter-spacing: 0.02em;
          cursor: pointer;
          box-shadow:
            0 0 0 1px rgba(20, 40, 70, 0.7),
            0 12px 30px rgba(0, 0, 0, 0.9);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          white-space: nowrap;
          transition:
            transform 0.18s ease-out,
            box-shadow 0.18s ease-out,
            filter 0.18s ease-out,
            background 0.18s ease-out;
        }

        .create-generate-btn:hover:enabled {
          transform: translateY(-2px);
          box-shadow:
            0 0 0 1px rgba(148, 202, 255, 0.8),
            0 18px 45px rgba(0, 0, 0, 1);
          filter: brightness(1.05);
        }

        .create-generate-btn:disabled {
          opacity: 0.7;
          cursor: default;
        }

        .create-generate-btn:active:enabled {
          transform: translateY(0);
          box-shadow:
            0 0 0 1px rgba(148, 202, 255, 0.7),
            0 6px 16px rgba(0, 0, 0, 0.9);
        }

        .create-tip {
          margin-top: 14px;
          font-size: 12px;
          color: rgba(255, 255, 255, 0.45);
        }

        .create-error {
          margin-top: 8px;
          font-size: 12px;
          color: #ff6b6b;
        }

        .create-tiles-section {
          max-width: 960px;
          margin: 0 auto;
          width: 100%;
        }

        .create-tiles-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 14px;
        }

        @media (min-width: 900px) {
          .create-tiles-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }

        .create-tile {
          border-radius: 20px;
          padding: 18px 20px;
          background: radial-gradient(
                circle at top left,
                rgba(255, 255, 255, 0.02),
                transparent 60%
              ),
            #090a0d;
          border: 1px solid rgba(255, 255, 255, 0.04);
          box-shadow:
            0 18px 40px rgba(0, 0, 0, 0.9),
            inset 0 0 0 0.5px rgba(255, 255, 255, 0.02);
          display: flex;
          flex-direction: column;
          gap: 4px;
          transition:
            transform 0.2s ease-out,
            box-shadow 0.2s ease-out,
            border-color 0.2s ease-out,
            background 0.2s ease-out;
        }

        .create-tile:hover {
          transform: translateY(-4px);
          border-color: rgba(255, 255, 255, 0.08);
          background: radial-gradient(
                circle at top left,
                rgba(255, 255, 255, 0.04),
                transparent 65%
              ),
            #0c0e13;
          box-shadow:
            0 26px 60px rgba(0, 0, 0, 0.95),
            inset 0 0 0 0.5px rgba(255, 255, 255, 0.03);
        }

        .create-tile h2 {
          font-size: 14px;
          font-weight: 600;
          color: #f5f5f7;
        }

        .create-tile p {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.55);
        }
      `}</style>
    </main>
  );
}
