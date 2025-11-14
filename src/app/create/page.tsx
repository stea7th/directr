"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";

export default function CreatePage() {
  const [prompt, setPrompt] = useState("");
  const [fileName, setFileName] = useState("");
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  function handleChooseFile() {
    fileRef.current?.click();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    setFileName(f ? f.name : "");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!prompt && !fileName) return;

    setBusy(true);

    // TODO: wire this up to your /api/generate endpoint.
    await new Promise((r) => setTimeout(r, 1000));

    setBusy(false);
  }

  return (
    <main className="create-page">
      <section className="create-shell">
        <h1 className="create-heading">Type what you want or upload a file</h1>

        <form className="create-form" onSubmit={handleSubmit}>
          <textarea
            className="create-textarea"
            placeholder="Example: Turn this podcast into 5 viral TikToks"
            rows={6}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />

          <div className="create-fileRow">
            <button
              type="button"
              className="create-fileButton"
              onClick={handleChooseFile}
            >
              Choose file / Drop here
            </button>

            <input
              ref={fileRef}
              type="file"
              className="create-fileInput"
              accept="video/*,audio/*"
              onChange={handleFileChange}
            />

            <span className="create-fileName">
              {fileName || "No file selected"}
            </span>

            <button
              type="submit"
              className="create-generateButton"
              disabled={busy}
            >
              {busy ? "Working..." : "Generate"}
            </button>
          </div>

          <p className="create-tip">
            Tip: Drop a video/audio, or just describe what you want. We&apos;ll
            handle the rest.
          </p>
        </form>
      </section>

      <section className="create-modes">
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
          --panel: #101114;
          --panel-soft: #17181d;
          --border: #242630;
          --fg: #f3f4f6;
          --muted: #8c92a7;
          --brand: #4f6bed;
          --brand-soft: #3c5be0;
        }

        .create-page {
          min-height: calc(100vh - 64px);
          padding: 48px 16px 96px;
          background: radial-gradient(circle at top left, #131520 0, #050506 60%);
          color: var(--fg);
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .create-shell {
          max-width: 980px;
          margin: 0 auto;
          background: radial-gradient(circle at top left, #191b23, #101114);
          border-radius: 24px;
          border: 1px solid var(--border);
          padding: 28px 26px 24px;
          box-shadow: 0 24px 80px rgba(0, 0, 0, 0.55);
        }

        .create-heading {
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 16px;
        }

        .create-form {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .create-textarea {
          width: 100%;
          min-height: 160px;
          border-radius: 16px;
          border: 1px solid var(--border);
          background: #090b0f;
          padding: 14px 16px;
          color: var(--fg);
          font-size: 14px;
          resize: vertical;
          outline: none;
        }

        .create-textarea::placeholder {
          color: var(--muted);
        }

        .create-textarea:focus {
          border-color: #32374a;
        }

        .create-fileRow {
          display: grid;
          grid-template-columns: auto 1fr auto;
          align-items: center;
          gap: 12px;
          border-radius: 999px;
          border: 1px dashed var(--border);
          background: #090b0f;
          padding: 8px 10px 8px 10px;
        }

        .create-fileInput {
          display: none;
        }

        .create-fileButton {
          border-radius: 999px;
          border: 1px solid var(--border);
          padding: 8px 12px;
          background: #111217;
          color: var(--fg);
          font-size: 13px;
          cursor: pointer;
        }

        .create-fileName {
          font-size: 13px;
          color: var(--muted);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .create-generateButton {
          border-radius: 999px;
          border: none;
          padding: 10px 18px;
          background: var(--brand);
          color: white;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
        }

        .create-generateButton:disabled {
          opacity: 0.6;
          cursor: default;
        }

        .create-tip {
          margin-top: 2px;
          font-size: 13px;
          color: var(--muted);
        }

        .create-modes {
          max-width: 980px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 16px;
        }

        .mode-card {
          text-decoration: none;
          background: var(--panel-soft);
          border-radius: 18px;
          border: 1px solid var(--border);
          padding: 16px 18px;
          color: var(--fg);
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
          .create-shell {
            padding: 20px 18px 18px;
          }

          .create-modes {
            grid-template-columns: 1fr;
          }

          .create-fileRow {
            grid-template-columns: auto 1fr;
            grid-template-rows: auto auto;
          }

          .create-generateButton {
            grid-column: 1 / -1;
            justify-self: flex-end;
          }
        }
      `}</style>
    </main>
  );
}
