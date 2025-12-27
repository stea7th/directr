"use client";

import "./page.css";
import React, { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";

export default function CreatePage() {
  const [prompt, setPrompt] = useState("");
  const [file, setFile] = useState<File | null>(null);

  async function handleGenerate() {
    // your logic stays the same
  }

  return (
    <main className="create-root">
      <section className="create-shell">
        <header className="create-header">
          <h1>Type what you want or upload a file</h1>
        </header>

        <div className="create-main-card">
          <div className="create-textarea-wrap">
            <textarea
              className="create-textarea"
              placeholder="Turn this podcast into 5 viral clips"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </div>

          <div className="create-bottom-row">
            <label className="create-file-bar">
              <span className="create-file-label">
                {file ? file.name : "Choose File / Drop here"}
              </span>
              <input
                type="file"
                className="create-file-input"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </label>

            <button className="create-generate-btn" onClick={handleGenerate}>
              Generate
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
