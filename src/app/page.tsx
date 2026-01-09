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
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: 22,
            alignItems: "center",
            justifyItems: "center",
            textAlign: "center",
            margin: "0 auto",
            maxWidth: 860,
          }}
        >
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
          </div>

          <h1
            style={{
              fontSize: 52,
              lineHeight: 1.04,
              letterSpacing: "-0.03em",
              fontWeight: 680,
              margin: 0,
            }}
          >
            Write a hook that sounds like you.
            <br />
            Then film with a plan.
          </h1>

          <p
            style={{
              margin: 0,
              maxWidth: 660,
              fontSize: 15,
              lineHeight: 1.65,
              color: "rgba(255,255,255,0.62)",
            }}
          >
            No “stop scrolling” fluff. Directr gives you spoken hooks, opening delivery notes,
            a clean video flow, shot list, captions, and posting plan — in one output.
          </p>

          <div
            style={{
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
              justifyContent: "center",
              alignItems: "center",
              marginTop: 2,
            }}
          >
            <Link
              href="/create"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "11px 18px",
                borderRadius: 999,
                border: "1px solid rgba(148, 202, 255, 0.7)",
                background:
                  "radial-gradient(circle at 0 0, rgba(148,202,255,0.45), rgba(47,79,130,0.8)), #141922",
                color: "#f5f7ff",
                fontSize: 12,
                fontWeight: 650,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                boxShadow:
                  "0 0 0 1px rgba(24, 39, 70, 0.9), 0 16px 36px rgba(0, 0, 0, 0.9)",
                textDecoration: "none",
              }}
            >
              Start free
            </Link>

            <Link
              href="/pricing"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "11px 16px",
                borderRadius: 999,
                border: "1px solid rgba(255,255,255,0.16)",
                background: "transparent",
                color: "rgba(255,255,255,0.78)",
                fontSize: 12,
                fontWeight: 550,
                textDecoration: "none",
              }}
            >
              View pricing
            </Link>
          </div>

          <div
            style={{
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
              justifyContent: "center",
              color: "rgba(255,255,255,0.52)",
              fontSize: 12,
              marginTop: 2,
            }}
          >
            <span>3 free generations</span>
            <span>•</span>
            <span>$19/mo unlimited</span>
            <span>•</span>
            <span>Cancel anytime</span>
          </div>
        </section>

        {/* VALUE STRIP */}
        <section
          style={{
            marginTop: 34,
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: 12,
          }}
        >
          {[
            {
              title: "Non-AI hooks",
              body: "Spoken, specific, and human. No hype phrases.",
            },
            {
              title: "Full filming plan",
              body: "Opening delivery + video flow + shot list.",
            },
            {
              title: "Post with confidence",
              body: "Captions + posting notes + comment prompts.",
            },
          ].map((x) => (
            <div
              key={x.title}
              style={{
                borderRadius: 18,
                padding: 16,
                background:
                  "radial-gradient(circle at top left, rgba(255,255,255,0.03), transparent 60%), #090a0d",
                border: "1px solid rgba(255,255,255,0.08)",
                boxShadow:
                  "0 18px 45px rgba(0,0,0,0.92), inset 0 0 0 0.5px rgba(255,255,255,0.02)",
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 650, marginBottom: 6 }}>{x.title}</div>
              <div style={{ fontSize: 12, lineHeight: 1.6, color: "rgba(255,255,255,0.62)" }}>
                {x.body}
              </div>
            </div>
          ))}
        </section>

        {/* MAIN CONTENT GRID */}
        <section
          style={{
            marginTop: 18,
            display: "grid",
            gridTemplateColumns: "1.15fr 0.85fr",
            gap: 14,
            alignItems: "start",
          }}
        >
          {/* LEFT: SAMPLE OUTPUT */}
          <div
            style={{
              borderRadius: 22,
              padding: 18,
              background:
                "radial-gradient(circle at top left, rgba(255,255,255,0.035), transparent 60%), #090a0d",
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow:
                "0 22px 60px rgba(0,0,0,0.92), inset 0 0 0 0.5px rgba(255,255,255,0.02)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                marginBottom: 10,
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 11,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,0.55)",
                    marginBottom: 4,
                  }}
                >
                  Example output
                </div>
                <div style={{ fontSize: 14, fontWeight: 650 }}>“Personal brand for beginners”</div>
              </div>

              <Link
                href="/create"
                style={{
                  fontSize: 12,
                  color: "rgba(164, 210, 255, 0.96)",
                  textDecoration: "underline",
                  textUnderlineOffset: 3,
                }}
              >
                Try your idea →
              </Link>
            </div>

            <div
              style={{
                borderRadius: 16,
                border: "1px solid rgba(255,255,255,0.08)",
                background: "rgba(0,0,0,0.35)",
                padding: 14,
                fontFamily: "var(--font-mono), ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                fontSize: 12,
                lineHeight: 1.55,
                color: "rgba(255,255,255,0.86)",
                whiteSpace: "pre-wrap",
              }}
            >
{`1. HOOK OPTIONS (8)
- You’re not “bad at content” — your first 2 seconds are just weak. Here’s the fix.
- If your video starts with context, you already lost. Start like this instead.
- This is the easiest way to start a personal brand without feeling cringe.
- Most people overthink niches. Say this one line and post today.
- If you don’t know what to talk about, use this simple 3-bucket rule.
- The first post isn’t about going viral — it’s about proving you can show up.
- Here’s the intro that makes people trust you fast (even with 0 followers).
- Want to look confident on camera? Do this with your eyes and hands.

2. BEST HOOK PICK
- If your video starts with context, you already lost. Start like this instead.
Why: It calls out the exact mistake and promises a clear alternative.

3. OPENING DELIVERY NOTES
Say it fast. Pause after “lost.” Then slow down on “Start like this instead.”

4. VIDEO FLOW FRAMEWORK
0–3s: Hook
3–10s: Show the common mistake
10–25s: Give the better structure + example line
25–end: CTA: “Comment ‘plan’ and I’ll write yours.”`}
            </div>
          </div>

          {/* RIGHT: HOW IT WORKS + CTA */}
          <div style={{ display: "grid", gap: 14 }}>
            <div
              style={{
                borderRadius: 22,
                padding: 18,
                background:
                  "radial-gradient(circle at 0 0, rgba(148,202,255,0.20), transparent 60%), #0b0d12",
                border: "1px solid rgba(148,202,255,0.22)",
                boxShadow:
                  "0 22px 60px rgba(0,0,0,0.92), inset 0 0 0 0.5px rgba(255,255,255,0.02)",
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.6)",
                  marginBottom: 10,
                }}
              >
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
                    <div
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: 999,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 12,
                        fontWeight: 650,
                        background:
                          "radial-gradient(circle at 0 0, rgba(148,202,255,0.55), rgba(47,79,130,0.7))",
                        color: "#05060a",
                        boxShadow: "0 10px 24px rgba(0,0,0,0.75)",
                      }}
                    >
                      {i + 1}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 650, marginBottom: 2 }}>{t}</div>
                      <div style={{ fontSize: 12, lineHeight: 1.6, color: "rgba(255,255,255,0.62)" }}>
                        {d}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div
                style={{
                  marginTop: 14,
                  display: "grid",
                  gap: 10,
                }}
              >
                <Link
                  href="/create"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "100%",
                    padding: "11px 18px",
                    borderRadius: 999,
                    border: "1px solid rgba(148, 202, 255, 0.7)",
                    background:
                      "radial-gradient(circle at 0 0, rgba(148,202,255,0.45), rgba(47,79,130,0.8)), #141922",
                    color: "#f5f7ff",
                    fontSize: 12,
                    fontWeight: 650,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    boxShadow:
                      "0 0 0 1px rgba(24, 39, 70, 0.9), 0 16px 36px rgba(0, 0, 0, 0.9)",
                    textDecoration: "none",
                  }}
                >
                  Start free
                </Link>

                <Link
                  href="/pricing"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "100%",
                    padding: "11px 18px",
                    borderRadius: 999,
                    border: "1px solid rgba(255,255,255,0.16)",
                    background: "transparent",
                    color: "rgba(255,255,255,0.78)",
                    fontSize: 12,
                    fontWeight: 550,
                    textDecoration: "none",
                  }}
                >
                  Unlock unlimited — $19/mo
                </Link>

                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.52)", textAlign: "center" }}>
                  If you post consistently, hooks pay for themselves.
                </div>
              </div>
            </div>

            <div
              style={{
                borderRadius: 22,
                padding: 18,
                background:
                  "radial-gradient(circle at top left, rgba(255,255,255,0.03), transparent 60%), #090a0d",
                border: "1px solid rgba(255,255,255,0.08)",
                boxShadow:
                  "0 18px 45px rgba(0,0,0,0.92), inset 0 0 0 0.5px rgba(255,255,255,0.02)",
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.55)",
                  marginBottom: 8,
                }}
              >
                Built to avoid “AI-voice”
              </div>
              <div style={{ fontSize: 12, lineHeight: 1.65, color: "rgba(255,255,255,0.62)" }}>
                Directr bans generic hook phrases and forces spoken, specific lines — then gives you a
                filming plan so you can execute immediately.
              </div>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer
          style={{
            marginTop: 28,
            textAlign: "center",
            fontSize: 12,
            color: "rgba(255,255,255,0.42)",
          }}
        >
          directr.so • Write the hook. Film the plan. Post with confidence.
        </footer>

        {/* Responsive tweak without client/styled-jsx */}
        <div
          style={{
            height: 0,
            overflow: "hidden",
          }}
        />
      </div>

      {/* lightweight responsive via inline <style> (NOT styled-jsx) */}
      <style>{`
        @media (max-width: 980px) {
          main > div > section:nth-of-type(2) {
            grid-template-columns: 1fr !important;
          }
          main > div > section:nth-of-type(1) h1 {
            font-size: 40px !important;
          }
          main > div > section:nth-of-type(1) {
            max-width: 760px !important;
          }
          main > div > section:nth-of-type(3) {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 520px) {
          main > div > section:nth-of-type(1) h1 {
            font-size: 34px !important;
          }
        }
      `}</style>
    </main>
  );
}
