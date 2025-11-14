"use client";

import { useRef, useState } from "react";
import Link from "next/link";

export default function CreatePage() {
  const [prompt, setPrompt] = useState("");
  const [fileName, setFileName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  function handleChooseFile() {
    fileInputRef.current?.click();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setFileName(file ? file.name : "");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!prompt && !fileName) return;

    setSubmitting(true);
    // TODO: wire to your /api/generate endpoint
    await new Promise((r) => setTimeout(r, 900));
    setSubmitting(false);
  }

  return (
    <main className="create-root">
      <section className="create-panel">
        <div className="create-header">
          <h1>Type what you want or upload a file</h1>
          <p>Example: Turn this podcast into 5 viral TikToks</p>
        </div>

        <form onSubmit={handleSubmit} className="create-form">
          <textarea
            className="prompt-input"
            rows={6}
            placeholder="Describe what you want. We’ll handle the rest."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />

          <div className="upload-row">
            <button
              type="button"
              className="upload-btn"
              onClick={handleChooseFile}
            >
              + Choose file / Drop here
            </button>

            <input
              ref={fileInputRef}
              type="file"
              className="file-input"
              accept="video/*,audio/*"
              onChange={handleFileChange}
            />

            <span className="file-label">
              {fileName || "No file selected"}
            </span>

            <button
              type="submit"
              className="generate-btn"
              disabled={submitting}
            >
              {submitting ? "Working…" : "Generate"}
            </button>
          </div>

          <p className="tip">
            Tip: Drop a video/audio file, or just describe what you want. We’ll
            handle the rest.
          </p>
        </form>
      </section>

      <section className="modes">
        <Link href="/create" className="mode-card">
          <div className="mode-title">Create</div>
          <div className="mode-sub">Upload → get captioned clips</div>
        </Link>
        <Link href="/clipper" className="mode-card">
          <div className="mode-title">Clipper</div>
          <div className="mode-sub">Auto-find hooks & moments</div>
        </Link>
        <Link href="/planner" className="mode-card">
          <div className="mode-title">Planner</div>
          <div className="mode-sub">Plan posts & deadlines</div>
        </Link>
      </section>

      <style jsx>{`
        :root {
          --bg: #050506;
          --card: #101115;
          --card-soft: #151722;
          --card-inner: #0b0c11;
          --border: #262835;
          --border-soft: #35384a;
          --fg: #f5f5f7;
          --muted: #8b92a2;
          --brand: #4f6bed;
          --brand-soft: #3f58d8;
        }

        .create-root {
          min-height: calc(100vh - 64px);
          padding: 48px 16px 96px;
          background: radial-gradient(circle at top left, #151827 0, #050506 65%);
          color: var(--fg);
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        .create-panel {
          max-width: 1024px;
          margin: 0 auto;
          background: radial-gradient(circle at top left, #1b1d28 0, #101115 55%);
          border-radius: 26px;
          border: 1px solid #171821;
          padding: 26px 30px 22px;
          box-shadow: 0 26px 80px rgba(0, 0, 0, 0.65);
        }

        .create-header h1 {
          margin: 0 0 4px;
          font-size: 22px;
          font-weight: 700;
          letter-spacing: 0.01em;
        }

        .create-header p {
          margin: 0;
          font-size: 13px;
          color: var(--muted);
        }

        .create-form {
          margin-top: 18px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .prompt-input {
          width: 100%;
          border-radius: 20px;
          border: 1px solid var(--border);
          background: radial-gradient(circle at top left, #141623 0, #090a10 55%);
          padding: 14px 18px;
          color: var(--fg);
          font-size: 14px;
          resize: vertical;
          outline: none;
          box-shadow: 0 0 0 0 transparent;
          transition: border-color 120ms ease, box-shadow 120ms ease,
            background 120ms ease;
        }

        .prompt-input::placeholder {
          color: var(--muted);
        }

        .prompt-input:focus {
          border-color: var(--border-soft);
          box-shadow: 0 0 0 1px rgba(79, 107, 237, 0.25);
          background: #090a12;
        }

        .upload-row {
          display: grid;
          grid-template-columns: auto 1fr auto;
          align-items: center;
          gap: 12px;
          border-radius: 999px;
          border: 1px dashed var(--border);
          background: #06070c;
          padding: 8px 10px 8px 14px;
        }

        .file-input {
          display: none;
        }

        .upload-btn {
          border-radius: 999px;
          border: 1px solid var(--border);
          padding: 8px 12px;
          background: #11121a;
          color: var(--fg);
          font-size: 13px;
          cursor: pointer;
          transition: transform 120ms ease, box-shadow 120ms ease,
            background 120ms ease, border-color 120ms ease;
        }

        .upload-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.45);
          border-color: var(--border-soft);
          background: #161827;
        }

        .file-label {
          font-size: 13px;
          color: var(--muted);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .generate-btn {
          border-radius: 999px;
          border: 1px solid #475fe0;
          padding: 9px 18px;
          min-width: 110px;
          background: radial-gradient(circle at 0% 0%, #6a84ff 0, #3f58d8 40%, #2839a8 100%);
          color: white;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          box-shadow: 0 18px 42px rgba(79, 107, 237, 0.6);
          transition: transform 130ms ease, box-shadow 130ms ease,
            filter 130ms ease, opacity 100ms ease;
        }

        .generate-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 22px 52px rgba(79, 107, 237, 0.8);
          filter: brightness(1.05);
        }

        .generate-btn:disabled {
          opacity: 0.7;
          cursor: default;
          transform: none;
          box-shadow: 0 14px 32px rgba(0, 0, 0, 0.6);
        }

        .tip {
          margin: 0 4px 0;
          font-size: 13px;
          color: var(--muted);
        }

        .modes {
          max-width: 1024px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 18px;
        }

        .mode-card {
          text-decoration: none;
          background: #101115;
          border-radius: 20px;
          border: 1px solid #181924;
          padding: 16px 18px;
          color: var(--fg);
          box-shadow: 0 18px 46px rgba(0, 0, 0, 0.65);
          transition: transform 130ms ease, box-shadow 130ms ease,
            border-color 130ms ease, background 130ms ease;
        }

        .mode-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 22px 56px rgba(0, 0, 0, 0.75);
          border-color: var(--border-soft);
          background: var(--card-soft);
        }

        .mode-title {
          font-size: 15px;
          font-weight: 600;
          margin-bottom: 4px;
        }

        .mode-sub {
          font-size: 13px;
          color: var(--muted);
        }

        @media (max-width: 900px) {
          .create-panel {
            margin-top: 8px;
            padding: 20px 16px 18px;
          }

          .upload-row {
            grid-template-columns: auto 1fr;
            grid-template-rows: auto auto;
          }

          .generate-btn {
            grid-column: 1 / -1;
            justify-self: flex-end;
            margin-top: 4px;
          }

          .modes {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </main>
  );
}
