"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import "./page.css";

export default function CreatePage() {
  const [prompt, setPrompt] = useState("");
  const [fileName, setFileName] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function onChooseClick() {
    fileRef.current?.click();
  }

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    setFileName(f ? f.name : "");
  }

  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) setFileName(f.name);
  }

  function onDrag(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
  }

  async function onGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (!prompt && !fileName) return;
    setBusy(true);

    // TODO: wire to your real /api/jobs
    await new Promise((r) => setTimeout(r, 1500));

    setBusy(false);
    setPrompt("");
    setFileName("");
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <main className="cr__wrap">
      <section className="cr__card">
        <h1 className="cr__title">Type what you want or upload a file</h1>

        <form onSubmit={onGenerate} className="cr__form">
          <textarea
            className="cr__area"
            placeholder="Example: Turn this podcast into 5 viral TikToks"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            spellCheck={false}
            rows={6}
          />

          <div
            className={`cr__file ${fileName ? "cr__file--has" : ""}`}
            onDrop={onDrop}
            onDragOver={onDrag}
            onDragEnter={onDrag}
          >
            <button
              type="button"
              className="cr__fileChoose"
              onClick={onChooseClick}
            >
              + Choose File / Drop here
            </button>

            <input
              ref={fileRef}
              type="file"
              className="cr__hidden"
              accept="video/*,audio/*"
              onChange={onFile}
            />

            <span className="cr__fileName">
              {fileName ? fileName : ""}
            </span>

            <button
              className={`cr__generate ${busy ? "is-busy" : ""}`}
              disabled={busy || (!prompt && !fileName)}
            >
              <span className="cr__shine" aria-hidden />
              {busy ? (
                <>
                  <span className="cr__dots" aria-hidden />
                  Working…
                </>
              ) : (
                "Generate"
              )}
            </button>
          </div>

          <p className="cr__tip">
            Tip: Drop a video/audio, or just describe what you want. We’ll handle the rest.
          </p>
        </form>
      </section>

      <section className="cr__grid">
        <Link href="/create" className="cr__cardMini">
          <div className="cr__cardMini__title">Create</div>
          <div className="cr__cardMini__sub">Upload → get captioned clips</div>
        </Link>

        <Link href="/clipper" className="cr__cardMini">
          <div className="cr__cardMini__title">Clipper</div>
          <div className="cr__cardMini__sub">Auto-find hooks & moments</div>
        </Link>

        <Link href="/planner" className="cr__cardMini">
          <div className="cr__cardMini__title">Planner</div>
          <div className="cr__cardMini__sub">Plan posts & deadlines</div>
        </Link>
      </section>
    </main>
  );
}
