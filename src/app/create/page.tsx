"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreatePage() {
  const router = useRouter();

  // Form state
  const [topic, setTopic] = useState("");
  const [platform, setPlatform] = useState("tiktok");
  const [goal, setGoal] = useState("");
  const [length, setLength] = useState("30");
  const [tone, setTone] = useState("casual");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          platform,
          goal,
          length,
          tone,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Failed to generate");
      }

      const data = await res.json();

      // assuming your /api/generate returns { id: string }
      if (data.id) {
        router.push(`/jobs/${data.id}`);
      } else {
        throw new Error("No job id returned");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="create-page">
      <div className="create-shell">
        <header className="create-header">
          <div>
            <h1>Turn ideas into ready-to-shoot scripts.</h1>
            <p>Directr builds you high-performing short-form concepts in seconds.</p>
          </div>
          <div className="pill">v0.1 · internal</div>
        </header>

        <form onSubmit={handleGenerate} className="create-grid">
          <section className="panel">
            <label>
              <span>What are you making?</span>
              <input
                type="text"
                placeholder="UGC ad for energy drink, gym vlog, micro content from podcast..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                required
              />
            </label>

            <label>
              <span>Platform</span>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
              >
                <option value="tiktok">TikTok</option>
                <option value="reels">Instagram Reels</option>
                <option value="shorts">YouTube Shorts</option>
              </select>
            </label>

            <label>
              <span>Goal</span>
              <input
                type="text"
                placeholder="Drive clicks, book calls, go viral, build trust..."
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
              />
            </label>

            <div className="inline">
              <label>
                <span>Length (seconds)</span>
                <input
                  type="number"
                  min={5}
                  max={120}
                  value={length}
                  onChange={(e) => setLength(e.target.value)}
                />
              </label>

              <label>
                <span>Tone</span>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                >
                  <option value="casual">Casual</option>
                  <option value="high-energy">High energy</option>
                  <option value="serious">Serious</option>
                  <option value="story">Storytelling</option>
                </select>
              </label>
            </div>

            {error && <p className="error">{error}</p>}

            <button
              type="submit"
              className="generate-btn"
              disabled={loading}
            >
              {loading ? "Generating..." : "Generate"}
            </button>
          </section>

          <section className="side-panel">
            <p className="side-label">Output preview</p>
            <div className="side-box">
              <p>
                Directr will create a job with your inputs and send it to the AI
                pipeline.
              </p>
              <ul>
                <li>Hook ideas based on your topic</li>
                <li>Script beats optimized for {platform}</li>
                <li>Suggested B-roll & transitions</li>
              </ul>
              <p className="side-meta">
                After generation you’ll be redirected to the job page.
              </p>
            </div>
          </section>
        </form>
      </div>

      <style jsx>{`
        .create-page {
          min-height: calc(100vh - 64px);
          padding: 32px 24px 40px;
          background: radial-gradient(circle at top, #141414 0, #050505 52%);
          display: flex;
          justify-content: center;
          color: #fafafa;
        }

        .create-shell {
          width: 100%;
          max-width: 1080px;
        }

        .create-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 24px;
          gap: 16px;
        }

        h1 {
          font-size: 28px;
          font-weight: 600;
          letter-spacing: -0.03em;
        }

        p {
          color: #a1a1aa;
          font-size: 14px;
          margin-top: 6px;
        }

        .pill {
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.06);
          background: rgba(15, 15, 15, 0.9);
          padding: 6px 12px;
          font-size: 11px;
          color: #71717a;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .create-grid {
          display: grid;
          grid-template-columns: minmax(0, 2.1fr) minmax(0, 1.2fr);
          gap: 18px;
        }

        .panel,
        .side-panel {
          background: rgba(12, 12, 12, 0.95);
          border-radius: 18px;
          border: 1px solid rgba(255, 255, 255, 0.06);
          box-shadow: 0 24px 60px rgba(0, 0, 0, 0.65);
          padding: 18px 18px 20px;
        }

        label {
          display: block;
          margin-bottom: 14px;
        }

        label span {
          display: block;
          font-size: 12px;
          color: #71717a;
          margin-bottom: 4px;
        }

        input,
        select {
          width: 100%;
          background: #050505;
          border-radius: 9px;
          border: 1px solid rgba(255, 255, 255, 0.06);
          padding: 10px 11px;
          font-size: 13px;
          color: #fafafa;
          outline: none;
        }

        input::placeholder {
          color: #52525b;
        }

        input:focus,
        select:focus {
          border-color: #6366f1;
          box-shadow: 0 0 0 1px rgba(99, 102, 241, 0.5);
        }

        .inline {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px;
        }

        .generate-btn {
          margin-top: 10px;
          width: 100%;
          border-radius: 999px;
          border: none;
          padding: 11px 14px;
          font-size: 14px;
          font-weight: 500;
          background: linear-gradient(135deg, #6366f1, #22c55e);
          color: #050505;
          cursor: pointer;
          transition: transform 0.12s ease, box-shadow 0.12s ease,
            filter 0.12s ease;
        }

        .generate-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 18px 40px rgba(0, 0, 0, 0.6);
          filter: brightness(1.05);
        }

        .generate-btn:disabled {
          opacity: 0.5;
          cursor: default;
          box-shadow: none;
          transform: none;
        }

        .error {
          margin-top: 4px;
          margin-bottom: 4px;
          font-size: 12px;
          color: #f97373;
        }

        .side-label {
          font-size: 11px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #52525b;
          margin-bottom: 8px;
        }

        .side-box {
          background: radial-gradient(circle at top, #101010 0, #050505 60%);
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.06);
          padding: 14px 14px 16px;
          font-size: 13px;
          color: #d4d4d8;
        }

        .side-box ul {
          margin: 10px 0 8px;
          padding-left: 18px;
        }

        .side-box li {
          margin-bottom: 4px;
        }

        .side-meta {
          font-size: 11px;
          color: #71717a;
        }

        @media (max-width: 900px) {
          .create-grid {
            grid-template-columns: minmax(0, 1fr);
          }
        }
      `}</style>
    </main>
  );
}
