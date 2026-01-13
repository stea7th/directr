// src/app/page.tsx
import Link from "next/link";

export default function Home() {
  return (
    <main
      style={{
        minHeight: "calc(100vh - 80px)",
        width: "100%",
        padding: "72px 24px 96px",
        background:
          "radial-gradient(circle at top, rgba(255,255,255,0.035), transparent 55%), #050506",
        color: "#f5f5f7",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div style={{ width: "100%", maxWidth: 1120 }}>
        {/* HERO */}
        <section className="lp-hero">
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              borderRadius: 999,
              padding: "6px 12px",
              border: "1px solid rgba(255,255,255,0.12)",
              background:
                "radial-gradient(circle at top left, rgba(255,255,255,0.06), transparent 60%), rgba(6,6,8,0.55)",
              color: "rgba(255,255,255,0.75)",
              fontSize: 11,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              marginTop: 2,
            }}
          >
            Directr
            <span style={{ opacity: 0.7 }}>•</span>
            <span style={{ letterSpacing: "0.12em", opacity: 0.85 }}>Hook + plan generator</span>
          </div>

          <h1 className="lp-h1">
            Fix your hook before you post.
            <br />
            Then film with a plan.
          </h1>

          <p className="lp-sub">
            Directr gives you <strong>spoken hooks</strong>, opening delivery notes, a clean video flow,
            shot list, captions, and a posting plan — in one output.
            <br />
            <span style={{ opacity: 0.85 }}>No “stop scrolling” fluff. No AI voice.</span>
          </p>

          <div className="lp-ctaRow">
            <Link href="/create" className="lp-primaryBtn">
              Start free
            </Link>

            <Link href="/pricing" className="lp-secondaryBtn">
              View pricing
            </Link>
          </div>

          <div className="lp-microRow">
            <span>3 free generations</span>
            <span className="lp-dot">•</span>
            <span>$19/mo unlimited</span>
            <span className="lp-dot">•</span>
            <span>Cancel anytime</span>
          </div>
        </section>

        {/* PAIN / WHY */}
        <section className="lp-section lp-why">
          <div className="lp-sectionHead">
            <div className="lp-kicker">Why this works</div>
            <h2 className="lp-h2">Your content isn’t bad. Your first 2 seconds are.</h2>
            <p className="lp-p">
              Most creators lose the viewer before the value even starts.
              Directr forces a <strong>strong opening</strong> and gives you the exact structure to
              deliver it without rambling.
            </p>
          </div>

          <div className="lp-cards3">
            {[
              {
                title: "Hooks that sound human",
                body: "Spoken, specific, and sharp. No generic hype phrases.",
              },
              {
                title: "A real filming plan",
                body: "Delivery notes, flow, shot list, retention beats — the whole skeleton.",
              },
              {
                title: "Post with confidence",
                body: "Captions + posting notes + comment prompts so you don’t freeze.",
              },
            ].map((x) => (
              <div key={x.title} className="lp-card">
                <div className="lp-cardTitle">{x.title}</div>
                <div className="lp-cardBody">{x.body}</div>
              </div>
            ))}
          </div>
        </section>

        {/* MAIN CONTENT GRID */}
        <section className="lp-mainGrid">
          {/* LEFT: SAMPLE OUTPUT */}
          <div className="lp-panel">
            <div className="lp-panelHead">
              <div>
                <div className="lp-kicker">Example output</div>
                <div style={{ fontSize: 14, fontWeight: 650 }}>
                  “Personal brand for beginners”
                </div>
              </div>

              <Link href="/create" className="lp-inlineLink">
                Try your idea →
              </Link>
            </div>

            <div className="lp-code">
              {`1) HOOK OPTIONS (8)
- You’re not “bad at content” — your first 2 seconds are just weak. Here’s the fix.
- If your video starts with context, you already lost. Start like this instead.
- This is the easiest way to start a personal brand without feeling cringe.
- Most people overthink niches. Say this one line and post today.
- If you don’t know what to talk about, use this simple 3-bucket rule.
- The first post isn’t about going viral — it’s about proving you can show up.
- Here’s the intro that makes people trust you fast (even with 0 followers).
- Want to look confident on camera? Do this with your eyes and hands.

2) BEST HOOK PICK
- If your video starts with context, you already lost. Start like this instead.
Why: It calls out the exact mistake and promises a clear alternative.

3) OPENING DELIVERY NOTES
Say it fast. Pause after “lost.” Then slow down on “Start like this instead.”

4) VIDEO FLOW FRAMEWORK
0–3s: Hook
3–10s: Show the common mistake
10–25s: Give the better structure + example line
25–end: CTA: “Comment ‘plan’ and I’ll write yours.”`}
            </div>

            <div className="lp-panelFoot">
              <span style={{ color: "rgba(255,255,255,0.55)", fontSize: 12 }}>
                Built for TikTok, Reels, and Shorts.
              </span>
              <Link href="/create" className="lp-inlineLink">
                Generate yours →
              </Link>
            </div>
          </div>

          {/* RIGHT: HOW IT WORKS + CTA */}
          <div className="lp-sideCol">
            <div className="lp-panel lp-panelBlue">
              <div className="lp-kicker" style={{ marginBottom: 10 }}>
                How it works
              </div>

              <div style={{ display: "grid", gap: 10 }}>
                {[
                  ["Type your idea", "One sentence is enough."],
                  ["Get a director plan", "Hooks + delivery + flow + shots + captions."],
                  ["Film and post", "Stop guessing. Execute."],
                ].map(([t, d], i) => (
                  <div
                    key={t}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "22px 1fr",
                      gap: 10,
                      alignItems: "start",
                    }}
                  >
                    <div className="lp-stepBubble">{i + 1}</div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 650, marginBottom: 2 }}>{t}</div>
                      <div className="lp-muted">{d}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
                <Link href="/create" className="lp-primaryBtn" style={{ width: "100%" }}>
                  Start free
                </Link>

                <Link href="/pricing" className="lp-secondaryBtn" style={{ width: "100%" }}>
                  Unlock unlimited — $19/mo
                </Link>

                <div className="lp-muted" style={{ textAlign: "center", fontSize: 12 }}>
                  If you post consistently, hooks pay for themselves.
                </div>
              </div>
            </div>

            <div className="lp-panel">
              <div className="lp-kicker" style={{ marginBottom: 8 }}>
                No AI-voice output
              </div>
              <div className="lp-muted" style={{ lineHeight: 1.7 }}>
                Directr avoids generic hook phrases and forces <strong>spoken, specific lines</strong>.
                Then it gives you a filming plan so you can execute immediately.
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="lp-section lp-faq">
          <div className="lp-sectionHead">
            <div className="lp-kicker">FAQ</div>
            <h2 className="lp-h2">Quick answers</h2>
          </div>

          <div className="lp-faqGrid">
            {[
              {
                q: "Do I need a big audience for this to work?",
                a: "No. A clean hook + clear structure is what builds the audience in the first place.",
              },
              {
                q: "Is this just a hook generator?",
                a: "No. You get hooks plus delivery notes, video flow, a shot list, captions, and posting notes — in one output.",
              },
              {
                q: "What if I’m not good on camera?",
                a: "That’s why the delivery notes exist. You’ll know what to say, how to say it, and what to film.",
              },
              {
                q: "Can I cancel?",
                a: "Yep. Cancel anytime.",
              },
            ].map((x) => (
              <div key={x.q} className="lp-card">
                <div className="lp-cardTitle">{x.q}</div>
                <div className="lp-cardBody">{x.a}</div>
              </div>
            ))}
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="lp-final">
          <div className="lp-finalInner">
            <div className="lp-kicker">Ready</div>
            <h2 className="lp-h2" style={{ marginTop: 6 }}>
              Stop guessing your hooks.
            </h2>
            <p className="lp-p" style={{ marginTop: 8 }}>
              Fix them before you post. Then film with a plan.
            </p>

            <div className="lp-ctaRow" style={{ marginTop: 14 }}>
              <Link href="/create" className="lp-primaryBtn">
                Generate hooks free
              </Link>
              <Link href="/pricing" className="lp-secondaryBtn">
                Pricing
              </Link>
            </div>

            <div className="lp-microRow" style={{ marginTop: 10 }}>
              <span>No credit card</span>
              <span className="lp-dot">•</span>
              <span>3 free generations</span>
              <span className="lp-dot">•</span>
              <span>Unlimited for $19/mo</span>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="lp-footer">
          directr.so • Write the hook. Film the plan. Post with confidence.
        </footer>

        {/* Responsive + shared classes */}
        <style>{`
          .lp-hero {
            display: grid;
            grid-template-columns: 1fr;
            gap: 22px;
            align-items: center;
            justify-items: center;
            text-align: center;
            margin: 0 auto;
            max-width: 920px;
          }

          .lp-h1 {
            font-size: 52px;
            line-height: 1.04;
            letter-spacing: -0.03em;
            font-weight: 680;
            margin: 0;
          }

          .lp-sub {
            margin: 0;
            max-width: 700px;
            font-size: 15px;
            line-height: 1.65;
            color: rgba(255,255,255,0.62);
          }

          .lp-ctaRow {
            display: flex;
            gap: 12px;
            flex-wrap: wrap;
            justify-content: center;
            align-items: center;
            margin-top: 2px;
          }

          .lp-primaryBtn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 11px 18px;
            border-radius: 999px;
            border: 1px solid rgba(148, 202, 255, 0.7);
            background: radial-gradient(circle at 0 0, rgba(148,202,255,0.45), rgba(47,79,130,0.8)), #141922;
            color: #f5f7ff;
            font-size: 12px;
            font-weight: 650;
            letter-spacing: 0.06em;
            text-transform: uppercase;
            box-shadow: 0 0 0 1px rgba(24, 39, 70, 0.9), 0 16px 36px rgba(0, 0, 0, 0.9);
            text-decoration: none;
            transition: transform 0.18s ease-out, filter 0.18s ease-out;
          }
          .lp-primaryBtn:hover { transform: translateY(-1px); filter: brightness(1.06); }

          .lp-secondaryBtn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 11px 16px;
            border-radius: 999px;
            border: 1px solid rgba(255,255,255,0.16);
            background: transparent;
            color: rgba(255,255,255,0.78);
            font-size: 12px;
            font-weight: 550;
            text-decoration: none;
            transition: transform 0.18s ease-out, color 0.18s ease-out, border-color 0.18s ease-out;
          }
          .lp-secondaryBtn:hover { transform: translateY(-1px); color: rgba(255,255,255,0.92); border-color: rgba(255,255,255,0.22); }

          .lp-microRow {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
            justify-content: center;
            color: rgba(255,255,255,0.52);
            font-size: 12px;
            margin-top: 2px;
          }
          .lp-dot { opacity: 0.5; }

          .lp-section { margin-top: 34px; }
          .lp-sectionHead { max-width: 920px; margin: 0 auto 14px; text-align: center; display: grid; gap: 8px; }
          .lp-kicker {
            font-size: 11px;
            letter-spacing: 0.12em;
            text-transform: uppercase;
            color: rgba(255,255,255,0.55);
          }
          .lp-h2 {
            margin: 0;
            font-size: 22px;
            font-weight: 680;
            letter-spacing: -0.01em;
          }
          .lp-p {
            margin: 0 auto;
            max-width: 760px;
            font-size: 13px;
            line-height: 1.75;
            color: rgba(255,255,255,0.62);
          }

          .lp-cards3 {
            margin-top: 14px;
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 12px;
          }

          .lp-card {
            border-radius: 18px;
            padding: 16px;
            background: radial-gradient(circle at top left, rgba(255,255,255,0.03), transparent 60%), #090a0d;
            border: 1px solid rgba(255,255,255,0.08);
            box-shadow: 0 18px 45px rgba(0,0,0,0.92), inset 0 0 0 0.5px rgba(255,255,255,0.02);
          }
          .lp-cardTitle { font-size: 13px; font-weight: 650; margin-bottom: 6px; }
          .lp-cardBody { font-size: 12px; line-height: 1.65; color: rgba(255,255,255,0.62); }

          .lp-mainGrid {
            margin-top: 18px;
            display: grid;
            grid-template-columns: 1.15fr 0.85fr;
            gap: 14px;
            align-items: start;
          }

          .lp-panel {
            border-radius: 22px;
            padding: 18px;
            background: radial-gradient(circle at top left, rgba(255,255,255,0.035), transparent 60%), #090a0d;
            border: 1px solid rgba(255,255,255,0.08);
            box-shadow: 0 22px 60px rgba(0,0,0,0.92), inset 0 0 0 0.5px rgba(255,255,255,0.02);
            overflow: hidden;
          }
          .lp-panelBlue {
            background: radial-gradient(circle at 0 0, rgba(148,202,255,0.20), transparent 60%), #0b0d12;
            border: 1px solid rgba(148,202,255,0.22);
          }

          .lp-panelHead {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            margin-bottom: 10px;
          }

          .lp-inlineLink {
            font-size: 12px;
            color: rgba(164, 210, 255, 0.96);
            text-decoration: underline;
            text-underline-offset: 3px;
          }
          .lp-inlineLink:hover { color: rgba(255,255,255,0.95); }

          .lp-code {
            border-radius: 16px;
            border: 1px solid rgba(255,255,255,0.08);
            background: rgba(0,0,0,0.35);
            padding: 14px;
            font-family: var(--font-mono), ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
            font-size: 12px;
            line-height: 1.55;
            color: rgba(255,255,255,0.86);
            white-space: pre-wrap;
          }

          .lp-panelFoot {
            margin-top: 12px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
            flex-wrap: wrap;
          }

          .lp-sideCol { display: grid; gap: 14px; }

          .lp-stepBubble {
            width: 22px;
            height: 22px;
            border-radius: 999px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            font-weight: 650;
            background: radial-gradient(circle at 0 0, rgba(148,202,255,0.55), rgba(47,79,130,0.7));
            color: #05060a;
            box-shadow: 0 10px 24px rgba(0,0,0,0.75);
          }

          .lp-muted { font-size: 12px; line-height: 1.6; color: rgba(255,255,255,0.62); }

          .lp-faqGrid {
            margin-top: 14px;
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 12px;
          }

          .lp-final {
            margin-top: 28px;
            border-radius: 22px;
            padding: 18px;
            background: radial-gradient(circle at top left, rgba(255,255,255,0.03), transparent 60%), #090a0d;
            border: 1px solid rgba(255,255,255,0.08);
            box-shadow: 0 22px 60px rgba(0,0,0,0.92), inset 0 0 0 0.5px rgba(255,255,255,0.02);
          }
          .lp-finalInner { text-align: center; max-width: 820px; margin: 0 auto; }

          .lp-footer {
            margin-top: 28px;
            text-align: center;
            font-size: 12px;
            color: rgba(255,255,255,0.42);
          }

          @media (max-width: 980px) {
            .lp-mainGrid { grid-template-columns: 1fr; }
            .lp-cards3 { grid-template-columns: 1fr; }
            .lp-h1 { font-size: 40px; }
            .lp-faqGrid { grid-template-columns: 1fr; }
          }
          @media (max-width: 520px) {
            .lp-h1 { font-size: 34px; }
          }
        `}</style>
      </div>
    </main>
  );
}
