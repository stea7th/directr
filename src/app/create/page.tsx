"use client";

import React, { useState } from "react";

type Tab = "basic" | "advanced";

export default function CreatePage() {
  const [prompt, setPrompt] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [platform, setPlatform] = useState("TikTok");
  const [clips, setClips] = useState(5);
  const [style, setStyle] = useState("default");
  const [tab, setTab] = useState<Tab>("basic");

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    setError(null);
    setResult(null);

    if (!prompt.trim() && !file) {
      setError("Add a prompt or upload a file first.");
      return;
    }

    setLoading(true);
    try {
      // For now: only send JSON (we’ll wire file → upload later)
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          platform,
          clips,
          style,
        }),
      });

      const contentType = res.headers.get("content-type") || "";

      // 🔴 This is the error you’ve been seeing:
      if (!contentType.includes("application/json")) {
        const text = await res.text();
        const snippet = text.slice(0, 200);
        console.error("Non-JSON response from /api/generate:", {
          status: res.status,
          snippet,
        });
        setError(
          `Server returned non-JSON (status ${res.status}). First part: ${snippet}`
        );
        setLoading(false);
        return;
      }

      const json = await res.json();
      setResult(JSON.stringify(json, null, 2));
    } catch (err: any) {
      console.error("Generate error:", err);
      setError(err?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] || null;
    setFile(f);
  }

  return (
    <main className="create-root">
      <section className="create-shell">
        <header className="create-header">
          <h1>Type what you want or upload a file</h1>
        </header>

        {/* Tabs: basic vs advanced */}
        <div className="create-tabs">
          <button
            type="button"
            className={`create-tab ${tab === "basic" ? "is-active" : ""}`}
            onClick={() => setTab("basic")}
          >
            Basic
          </button>
          <button
            type="button"
            className={`create-tab ${tab === "advanced" ? "is-active" : ""}`}
            onClick={() => setTab("advanced")}
          >
            Advanced
          </button>
        </div>

        <div className="create-main-card">
          <div className="create-textarea-wrap">
            <textarea
              name="prompt"
              className="create-textarea"
              placeholder="Example: Turn this podcast into 5 viral TikToks"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </div>

          {tab === "advanced" && (
            <div className="create-advanced-row">
              <div className="create-field">
                <label>Platform</label>
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                >
                  <option value="TikTok">TikTok</option>
                  <option value="Reels">Reels</option>
                  <option value="Shorts">YouTube Shorts</option>
                  <option value="Multi">Multi-platform</option>
                </select>
              </div>

              <div className="create-field">
                <label># of clips</label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={clips}
                  onChange={(e) =>
                    setClips(
                      Math.min(20, Math.max(1, Number(e.target.value) || 1))
                    )
                  }
                />
              </div>

              <div className="create-field">
                <label>Style</label>
                <select value={style} onChange={(e) => setStyle(e.target.value)}>
                  <option value="default">Default</option>
                  <option value="aggressive_hooks">Aggressive hooks</option>
                  <option value="storytime">Storytime</option>
                  <option value="educational">Educational / value</option>
                </select>
              </div>
            </div>
          )}

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

          {/* Error + Result */}
          {error && <p className="create-error">{error}</p>}

          {result && (
            <pre className="create-result">
              <code>{result}</code>
            </pre>
          )}
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

      {/* Your original styling, plus a couple of small additions */}
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

        .create-tabs {
          display: inline-flex;
          border-radius: 999px;
          padding: 3px;
          background: rgba(255, 255, 255, 0.04);
          margin-bottom: 16px;
          gap: 4px;
        }

        .create-tab {
          border: none;
          border-radius: 999px;
          padding: 6px 14px;
          font-size: 12px;
          cursor: pointer;
          background: transparent;
          color: rgba(255, 255, 255, 0.6);
        }

        .create-tab.is-active {
          background: rgba(255, 255, 255, 0.12);
          color: #fff;
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

        .create-advanced-row {
          display: grid;
          grid-template-columns: 1fr;
          gap: 10px;
          margin-bottom: 16px;
        }

        @media (min-width: 900px) {
          .create-advanced-row {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }

        .create-field {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .create-field label {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: rgba(255, 255, 255, 0.5);
        }

        .create-field select,
        .create-field input {
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: #06070a;
          color: #fff;
          padding: 6px 10px;
          font-size: 12px;
          outline: none;
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
          margin-top: 12px;
          font-size: 12px;
          color: #ff6b81;
        }

        .create-result {
          margin-top: 14px;
          padding: 12px;
          border-radius: 12px;
          background: #050609;
          border: 1px solid rgba(255, 255, 255, 0.06);
          max-height: 260px;
          overflow: auto;
          font-size: 11px;
          line-height: 1.4;
          color: rgba(255, 255, 255, 0.9);
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
