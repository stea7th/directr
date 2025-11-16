// src/app/create/page.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

type Platform = "TikTok" | "Reels" | "Shorts";

export default function CreatePage() {
  const router = useRouter();

  const [prompt, setPrompt] = useState("");
  const [platform, setPlatform] = useState<Platform>("TikTok");
  const [goal, setGoal] = useState("Drive sales");
  const [length, setLength] = useState("30");
  const [tone, setTone] = useState("Casual");
  const [file, setFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    setError(null);
    setStatus(null);

    const trimmed = prompt.trim();
    if (!trimmed) {
      setError("Please describe what you want Directr to create.");
      return;
    }

    setLoading(true);
    try {
      // If you want to actually upload file → switch this to FormData.
      // For now we just send the filename as a hint.
      const body = {
        prompt: trimmed,
        platform,
        goal,
        length,
        tone,
        fileName: file?.name ?? null,
      };

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await res.json().catch(() => ({} as any));
      console.log("Generate response", data);

      if (!res.ok) {
        setError(
          data?.error ||
            "Something went wrong talking to the AI. Try again in a sec."
        );
        return;
      }

      // Try both shapes just in case:
      const jobId: string | undefined =
        data.jobId ?? data.job?.id ?? data.id;

      if (!jobId) {
        setStatus(
          "Generated successfully, but no job id was returned. Ask your dev (me) to wire this up fully."
        );
        return;
      }

      setStatus("Generated! Redirecting to your job…");
      router.push(`/jobs/${jobId}`);
    } catch (err: any) {
      console.error(err);
      setError("Unexpected error. Please try again.");
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
          {/* Prompt */}
          <div className="create-textarea-wrap">
            <textarea
              name="prompt"
              className="create-textarea"
              placeholder="Example: Turn this podcast into 5 viral TikToks"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </div>

          {/* Controls row */}
          <div className="create-control-row">
            <div className="control-group">
              <label className="control-label">Platform</label>
              <div className="pill-row">
                {["TikTok", "Reels", "Shorts"].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPlatform(p as Platform)}
                    className={
                      "pill-button" +
                      (platform === p ? " pill-button--active" : "")
                    }
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div className="control-group">
              <label className="control-label">Goal</label>
              <input
                className="pill-input"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
              />
            </div>

            <div className="control-group">
              <label className="control-label">Length (seconds)</label>
              <input
                className="pill-input"
                value={length}
                onChange={(e) => setLength(e.target.value)}
              />
            </div>

            <div className="control-group">
              <label className="control-label">Tone</label>
              <input
                className="pill-input"
                value={tone}
                onChange={(e) => setTone(e.target.value)}
              />
            </div>
          </div>

          {/* File + Generate */}
          <div className="create-bottom-row">
            <label className="create-file-bar">
              <span className="create-file-label">
                <span className="create-file-bullet">•</span>
                {file ? file.name : "Choose File / Drop here"}
              </span>
              <input
                type="file"
                name="file"
                className="create-file-input"
                onChange={(e) => {
                  const f = e.target.files?.[0] || null;
                  setFile(f);
                }}
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

          {/* Status + error */}
          {error && <p className="create-error">{error}</p>}
          {status && !error && (
            <p className="create-status">{status}</p>
          )}

          <p className="create-tip">
            Tip: Drop a video/audio, or just describe what you want.
            We&apos;ll handle the rest.
          </p>
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

      {/* Page-scoped styling */}
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

        .create-control-row {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
          margin-bottom: 14px;
        }

        @media (min-width: 900px) {
          .create-control-row {
            grid-template-columns: repeat(4, minmax(0, 1fr));
          }
        }

        .control-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .control-label {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.14em;
          color: rgba(255, 255, 255, 0.45);
        }

        .pill-row {
          display: flex;
          gap: 6px;
        }

        .pill-button,
        .pill-input {
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(0, 0, 0, 0.4);
          padding: 6px 12px;
          font-size: 12px;
          color: rgba(255, 255, 255, 0.85);
          outline: none;
          transition:
            border-color 0.15s ease-out,
            background 0.15s ease-out,
            transform 0.15s ease-out,
            box-shadow 0.15s ease-out;
        }

        .pill-button {
          cursor: pointer;
        }

        .pill-button--active {
          border-color: rgba(157, 196, 255, 0.7);
          background: radial-gradient(
                circle at top,
                rgba(157, 196, 255, 0.25),
                transparent 60%
              ),
            #141621;
        }

        .pill-input {
          width: 100%;
        }

        .pill-button:hover,
        .pill-input:focus {
          border-color: rgba(157, 196, 255, 0.8);
          box-shadow: 0 10px 22px rgba(0, 0, 0, 0.8);
          transform: translateY(-1px);
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
          margin-top: 14px;
          font-size: 12px;
          color: rgba(255, 255, 255, 0.45);
        }

        .create-error {
          margin-top: 8px;
          font-size: 12px;
          color: #ff8080;
        }

        .create-status {
          margin-top: 8px;
          font-size: 12px;
          color: #9ecfff;
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
