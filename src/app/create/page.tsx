// src/app/create/page.tsx
"use client";

export default function CreatePage() {
  return (
    <main className="create-root">
      <section className="create-shell">
        <header className="create-header">
          <h1>Type what you want or upload a file</h1>
        </header>

        <div className="create-main-card">
          <div className="create-textarea-wrap">
            <textarea
              name="prompt"
              className="create-textarea"
              placeholder="Example: Turn this podcast into 5 viral TikToks"
            />
          </div>

          <div className="create-bottom-row">
            <label className="create-file-bar">
              <span className="create-file-label">
                <span className="create-file-bullet">•</span>
                Choose File / Drop here
              </span>
              <input
                type="file"
                name="file"
                className="create-file-input"
              />
            </label>

            <button
              type="button"
              className="create-generate-btn"
            >
              Generate
            </button>
          </div>

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

      {/* Page-scoped styling – same file, no external CSS needed */}
      <style jsx>{`
        .create-root {
          min-height: calc(100vh - 64px); /* account for nav */
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
          box-shadow: inset 0 0
