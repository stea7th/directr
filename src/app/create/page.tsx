"use client";

import React, { useState } from "react";

type Platform = "TikTok" | "Reels" | "Shorts" | "YouTube";
type Tone = "Casual" | "High energy" | "Storytelling" | "Educational";

export default function CreatePage() {
  const [prompt, setPrompt] = useState("");
  const [platform, setPlatform] = useState<Platform>("TikTok");
  const [goal, setGoal] = useState("Drive sales, grow page, etc.");
  const [length, setLength] = useState("30");
  const [tone, setTone] = useState<Tone>("Casual");
  const [fileName, setFileName] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);

  async function handleGenerate() {
    setErrorMsg(null);
    setJobId(null);

    if (!prompt.trim()) {
      setErrorMsg("Please type what you want first.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          platform,
          goal,
          length,
          tone,
          fileName,
        }),
      });

      const text = await res.text();
      const contentType = res.headers.get("content-type") || "";

      if (!contentType.includes("application/json")) {
        // This is where your old "<!DOCTYPE html>" error came from
        console.error("Non-JSON from /api/generate:", text);
        throw new Error(
          `Server returned non-JSON (status ${res.status}). First part: ${text.slice(
            0,
            120
          )}`
        );
      }

      const data = JSON.parse(text);

      if (!res.ok) {
        throw new Error(data.error || `Request failed with ${res.status}`);
      }

      if (!data.job?.id) {
        throw new Error(
          "Generated successfully, but no job id was returned. Ask your dev (me) to wire this up fully."
        );
      }

      setJobId(data.job.id);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setFileName(file ? file.name : null);
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

          {/* OPTIONS ROW */}
          <div className="create-options-row">
            <div className="create-option">
              <label>Platform</label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value as Platform)}
              >
                <option value="TikTok">TikTok</option>
                <option value="Reels">Instagram Reels</option>
                <option value="Shorts">YouTube Shorts</option>
                <option value="YouTube">YouTube (16:9)</option>
              </select>
            </div>

            <div className="create-option">
              <label>Goal</label>
              <input
                type="text"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
              />
            </div>

            <div className="create-option">
              <label>Length (seconds)</label>
              <input
                type="number"
                min={5}
                max={180}
                value={length}
                onChange={(e) => setLength(e.target.value)}
              />
            </div>

            <div className="create-option">
              <label>Tone</label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value as Tone)}
              >
                <option value="Casual">Casual</option>
                <option value="High energy">High energy</option>
                <option value="Storytelling">Storytelling</option>
                <option value="Educational">Educational</option>
              </select>
            </div>
          </div>

          {/* FILE + BUTTON */}
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
              disabled={isLoading}
            >
              {isLoading ? "Generating…" : "Generate"}
            </button>
          </div>

          {/* STATUS TEXT */}
          <p className="create-tip">
            Tip: Drop a video/audio, or just describe what you want. We&apos;ll
            handle the rest.
          </p>

          {errorMsg && (
            <p className="create-error">
              {errorMsg}
            </p>
          )}

          {jobId && (
            <p className="create-success">
              Generated successfully. Job id: <code>{jobId}</code>
            </p>
          )}
        </div>
      </section>

      {/* TILES */}
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

      {/* Styles (same vibe as before, just extended a bit) */}
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
          font-family: system-ui, -apple-system, BlinkMacSystemFont,
            "SF Pro Text", sans-serif;
        }

        .create-textarea::placeholder {
          color: rgba(255, 255, 255, 0.32);
        }

        .create-options-row {
          display: grid;
          grid-template-columns: 1fr;
          gap: 10px;
          margin-bottom: 14px;
        }

        @media (min-width: 900px) {
          .create-options-row {
            grid-template-columns: repeat(4, minmax(0, 1fr));
          }
        }

        .create-option {
          display: flex;
          flex-direction: column;
          gap: 4px;
          font-size: 11px;
          color: rgba(255, 255, 255, 0.55);
        }

        .create-option label {
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .create-option input,
        .create-option select {
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: #050609;
          color: #f5f5f7;
          padding: 8px 12px;
          font-size: 12px;
          outline: none;
        }

        .create-option input:focus,
        .create-option select:focus {
          border-color: rgba(157, 196, 255, 0.8);
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

        .create-generate-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow:
            0 0 0 1px rgba(148, 202, 255, 0.8),
            0 18px 45px rgba(0, 0, 0, 1);
          filter: brightness(1.05);
        }

        .create-generate-btn:disabled {
          opacity: 0.6;
          cursor: default;
        }

        .create-generate-btn:active:not(:disabled) {
          transform: translateY(0);
          box-shadow:
            0 0 0 1px rgba(148, 202, 255, 0.7),
            0 6px 16px rgba(0, 0, 0, 0.9);
        }

        .create-tip {
          margin-top: 10px;
          font-size: 12px;
          color: rgba(255, 255, 255, 0.45);
        }

        .create-error {
          margin-top: 6px;
          font-size: 12px;
          color: #ff6b6b;
        }

        .create-success {
          margin-top: 6px;
          font-size: 12px;
          color: #8be58b;
        }

        .create-success code {
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
            "Liberation Mono", "Courier New", monospace;
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
