// src/app/page.tsx
"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <main className="landing-root">
      <section className="landing-hero">
        <div className="landing-inner">
          <div className="landing-eyebrow">Directr</div>

          <h1 className="landing-h1">
            Stop guessing your hook.
            <br />
            Direct your video in 30 seconds.
          </h1>

          <p className="landing-sub">
            Directr gives you the hook, opening delivery, video flow, shot list,
            captions, and posting plan — in one clean output.
          </p>

          <div className="landing-cta-row">
            <Link href="/create" className="landing-cta landing-cta--primary">
              Start creating
            </Link>
            <Link href="/pricing" className="landing-cta landing-cta--ghost">
              Pricing
            </Link>
          </div>

          <div className="landing-proof">
            <article className="landing-card">
              <div className="landing-card-title">What you get</div>
              <ul className="landing-bullets">
                <li>8 spoken, non-AI hooks</li>
                <li>Best hook pick + why it works</li>
                <li>Opening delivery notes (how to say it)</li>
                <li>Clear video flow framework</li>
                <li>Shot list / b-roll ideas</li>
                <li>Captions + posting notes</li>
              </ul>
            </article>

            <article className="landing-card landing-card--glow">
              <div className="landing-card-title">Built for real creators</div>
              <p className="landing-p">
                No “stop scrolling.” No hype fluff. No robotic output.
              </p>
              <p className="landing-p" style={{ marginTop: 10 }}>
                Type your idea → get a plan → film and post.
              </p>
              <div className="landing-mini">
                <span>3 free generations</span>
                <span className="dot">•</span>
                <span>$19/mo unlimited</span>
                <span className="dot">•</span>
                <span>Cancel anytime</span>
              </div>
            </article>
          </div>
        </div>
      </section>

      <style jsx>{`
        .landing-root {
          min-height: 100vh;
          width: 100vw;
          margin-left: calc(50% - 50vw);
          margin-right: calc(50% - 50vw);
          background: radial-gradient(
              circle at top,
              rgba(255, 255, 255, 0.04),
              transparent 55%
            ),
            #050506;
          color: #f5f5f7;
        }

        .landing-hero {
          padding: 96px 22px 80px;
        }

        @media (min-width: 900px) {
          .landing-hero {
            padding: 120px 64px 96px;
          }
        }

        .landing-inner {
          max-width: 980px;
          margin: 0 auto;
          text-align: center;
        }

        .landing-eyebrow {
          display: inline-flex;
          padding: 6px 12px;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(0, 0, 0, 0.25);
          font-size: 12px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.75);
          margin-bottom: 16px;
        }

        .landing-h1 {
          font-size: 34px;
          line-height: 1.12;
          font-weight: 650;
          margin-bottom: 14px;
        }

        @media (min-width: 900px) {
          .landing-h1 {
            font-size: 46px;
          }
        }

        .landing-sub {
          max-width: 760px;
          margin: 0 auto 22px;
          font-size: 14px;
          line-height: 1.6;
          color: rgba(255, 255, 255, 0.68);
        }

        .landing-cta-row {
          display: flex;
          justify-content: center;
          gap: 10px;
          margin-bottom: 28px;
          flex-wrap: wrap;
        }

        .landing-cta {
          border-radius: 999px;
          padding: 10px 18px;
          font-size: 12px;
          font-weight: 550;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          text-decoration: none;
          min-width: 180px;
        }

        .landing-cta--primary {
          border: 1px solid rgba(148, 202, 255, 0.7);
          background: radial-gradient(
                circle at 0 0,
                rgba(148, 202, 255, 0.5),
                rgba(47, 79, 130, 0.85)
              ),
            #141922;
          color: #f5f7ff;
        }

        .landing-cta--ghost {
          border: 1px solid rgba(255, 255, 255, 0.16);
          background: rgba(0, 0, 0, 0.25);
          color: rgba(255, 255, 255, 0.82);
        }

        .landing-proof {
          max-width: 980px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr;
          gap: 14px;
          text-align: left;
        }

        @media (min-width: 900px) {
          .landing-proof {
            grid-template-columns: 1.1fr 0.9fr;
          }
        }

        .landing-card {
          border-radius: 22px;
          padding: 18px;
          background: #090a0d;
          border: 1px solid rgba(255, 255, 255, 0.06);
        }

        .landing-card--glow {
          background: radial-gradient(
                circle at 0 0,
                rgba(148, 202, 255, 0.18),
                rgba(42, 70, 114, 0.55)
              ),
            #0c1018;
          border-color: rgba(164, 210, 255, 0.22);
        }

        .landing-card-title {
          font-size: 12px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 10px;
          color: rgba(255, 255, 255, 0.72);
        }

        .landing-bullets {
          list-style: none;
          padding: 0;
          margin: 0;
          display: grid;
          gap: 7px;
        }

        .landing-bullets li {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.82);
        }

        .landing-p {
          font-size: 13px;
          color: rgba(255, 255, 255, 0.72);
        }

        .landing-mini {
          margin-top: 14px;
          font-size: 12px;
          color: rgba(255, 255, 255, 0.6);
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .dot {
          opacity: 0.5;
        }
      `}</style>
    </main>
  );
}
