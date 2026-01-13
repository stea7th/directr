// src/app/page.tsx
import Link from "next/link";

export default function Home() {
  return (
    <main className="lp-root">
      <div className="lp-shell">
        {/* TOP STRIP */}
        <header className="lp-top">
          <div className="lp-brand">
            <div className="lp-logoDot" />
            <div className="lp-brandText">
              <div className="lp-brandName">Directr</div>
              <div className="lp-brandSub">Hooks + Blueprint</div>
            </div>
          </div>

          <div className="lp-topActions">
            <Link href="/pricing" className="lp-topLink">
              Pricing
            </Link>
            <Link href="/create" className="lp-topPrimary">
              Start free
            </Link>
          </div>
        </header>

        {/* HERO */}
        <section className="lp-hero">
          <div className="lp-pill">
            <span className="lp-pillGlow" />
            <span className="lp-pillText">Directr removes the decision-making</span>
          </div>

          <h1 className="lp-h1">
            Stop deciding.
            <br />
            Start filming.
          </h1>

          <p className="lp-sub">
            Directr turns one sentence into a <strong>Blueprint</strong> — the hook, what to say, how to say it, what to
            film, and how to end.
            <br />
            <span className="lp-subDim">Versital options let you tune voice, angles, audience, and CTA.</span>
          </p>

          <div className="lp-ctaRow">
            <Link href="/create" className="lp-primaryBtn">
              Start free
            </Link>

            <a href="#example" className="lp-secondaryBtn">
              See example
            </a>

            <Link href="/pricing" className="lp-ghostBtn">
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

          <div className="lp-badges">
            {[
              ["Quick", "Fast hook options"],
              ["Blueprint", "Film-ready plan (decisions done)"],
              ["Output", "Hooks • delivery • flow • shots • captions"],
            ].map(([t, d]) => (
              <div key={t} className="lp-badge">
                <div className="lp-badgeT">{t}</div>
                <div className="lp-badgeD">{d}</div>
              </div>
            ))}
          </div>
        </section>

        {/* WHY */}
        <section className="lp-section lp-why">
          <div className="lp-sectionHead">
            <div className="lp-kicker">Why this works</div>
            <h2 className="lp-h2">Creators don’t stall from bad ideas. They stall from too many choices.</h2>
            <p className="lp-p">
              Most tools give you text and leave you to figure out the rest.
              Directr gives you a <strong>Blueprint</strong> that removes the decision layer — so you can film without
              second-guessing.
            </p>
          </div>

          <div className="lp-cards3">
            {[
              {
                title: "Decisions are handled",
                body: "You get hook options, a best pick, and a clear flow. No guessing what to open with.",
              },
              {
                title: "Film-ready structure",
                body: "Delivery notes + flow + shot list so you can record fast and stay on track.",
              },
              {
                title: "Flexible to your style",
                body: "Pick voice, angles, audience level, and CTA. Same framework, different creator.",
              },
            ].map((x) => (
              <div key={x.title} className="lp-card">
                <div className="lp-cardTitle">{x.title}</div>
                <div className="lp-cardBody">{x.body}</div>
              </div>
            ))}
          </div>
        </section>

        {/* MAIN GRID */}
        <section id="example" className="lp-mainGrid">
          {/* LEFT: OUTPUT */}
          <div className="lp-panel">
            <div className="lp-panelHead">
              <div>
                <div className="lp-kicker">What shows up after one prompt</div>
                <div className="lp-panelTitle">“Personal brand for beginners”</div>
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
              <span className="lp-muted">Built for TikTok, Reels, and Shorts.</span>
              <Link href="/create" className="lp-inlineLink">
                Generate yours →
              </Link>
            </div>
          </div>

          {/* RIGHT */}
          <div className="lp-sideCol">
            <div className="lp-panel lp-panelBlue">
              <div className="lp-kicker" style={{ marginBottom: 10 }}>
                Blueprint (how it works)
              </div>

              <div className="lp-steps">
                {[
                  ["Type one sentence", "Your idea + what the video is about."],
                  ["Get a Blueprint", "Hooks + best pick + delivery + flow + shots + captions."],
                  ["Film and post", "No second-guessing. Just execute."],
                ].map(([t, d], i) => (
                  <div key={t} className="lp-step">
                    <div className="lp-stepBubble">{i + 1}</div>
                    <div>
                      <div className="lp-stepTitle">{t}</div>
                      <div className="lp-muted">{d}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="lp-sideCta">
                <Link href="/create" className="lp-primaryBtn lp-full">
                  Start free
                </Link>

                <Link href="/pricing" className="lp-secondaryBtn lp-full">
                  Unlock unlimited — $19/mo
                </Link>

                <div className="lp-muted lp-center" style={{ fontSize: 12 }}>
                  If you post consistently, this pays for itself.
                </div>
              </div>
            </div>

            <div className="lp-panel">
              <div className="lp-kicker" style={{ marginBottom: 8 }}>
                Structured — not locked in
              </div>
              <div className="lp-muted" style={{ lineHeight: 1.7 }}>
                The framework keeps you tight. The options keep it yours.
                <br />
                Choose <strong>voice</strong>, <strong>hook angles</strong>, <strong>audience level</strong>, and{" "}
                <strong>CTA</strong>.
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
                q: "Is this just a hook generator?",
                a: "No. Quick gives hooks. Directr gives hooks + best pick + delivery notes + flow + shot list + captions and posting notes.",
              },
              {
                q: "Will this sound like me?",
                a: "Yes. You pick voice + angles + audience + CTA. Same structure, different creator.",
              },
              {
                q: "Do I need a big audience?",
                a: "No. A strong opening + clear structure is what builds the audience in the first place.",
              },
              { q: "Can I cancel?", a: "Yep. Cancel anytime." },
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
              Stop deciding. Start filming.
            </h2>
            <p className="lp-p" style={{ marginTop: 8 }}>
              Type one sentence. Get a Blueprint. Post.
            </p>

            <div className="lp-ctaRow" style={{ marginTop: 14 }}>
              <Link href="/create" className="lp-primaryBtn">
                Start free
              </Link>
              <Link href="/pricing" className="lp-ghostBtn">
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
        <footer className="lp-footer">directr.so • Stop deciding. Start filming.</footer>

        <style>{`
          .lp-root{
            min-height: calc(100vh - 80px);
            width: 100%;
            padding: 44px 24px 96px;
            color: rgba(255,255,255,0.92);
            background: #050506;
            overflow-x: hidden;
            position: relative;
            isolation: isolate;
            display: flex;
            justify-content: center;
          }
          .lp-root::before{
            content:"";
            position: fixed;
            inset: 0;
            pointer-events: none;
            background:
              radial-gradient(900px 520px at 50% 16%, rgba(86,114,255,0.14), transparent 60%),
              radial-gradient(700px 520px at 20% 58%, rgba(0,220,255,0.09), transparent 60%),
              radial-gradient(760px 560px at 82% 62%, rgba(130,70,255,0.10), transparent 60%),
              radial-gradient(900px 700px at 50% 110%, rgba(255,255,255,0.04), transparent 60%);
            filter: blur(18px);
            opacity: 0.9;
          }
          .lp-shell{ width: 100%; max-width: 1120px; position: relative; }

          /* top */
          .lp-top{
            display:flex;
            align-items:center;
            justify-content:space-between;
            gap: 14px;
            padding: 10px 2px 18px;
          }
          .lp-brand{ display:flex; align-items:center; gap: 10px; }
          .lp-logoDot{
            width: 10px; height: 10px; border-radius: 999px;
            background: radial-gradient(circle at 0 0, rgba(148,202,255,0.95), rgba(85,130,255,0.55));
            box-shadow: 0 0 0 2px rgba(148,202,255,0.10), 0 14px 30px rgba(0,0,0,0.55);
          }
          .lp-brandName{ font-size: 13px; font-weight: 700; letter-spacing: -0.01em; }
          .lp-brandSub{ font-size: 12px; color: rgba(255,255,255,0.55); margin-top: 1px; }
          .lp-topActions{ display:flex; align-items:center; gap: 10px; }
          .lp-topLink{
            font-size: 12px;
            color: rgba(255,255,255,0.65);
            text-decoration: none;
            padding: 10px 10px;
            border-radius: 10px;
            transition: color 160ms ease, background 160ms ease, transform 160ms ease;
          }
          .lp-topLink:hover{ color: rgba(255,255,255,0.92); background: rgba(255,255,255,0.04); transform: translateY(-1px); }
          .lp-topPrimary{
            display:inline-flex; align-items:center; justify-content:center;
            padding: 10px 14px;
            border-radius: 999px;
            border: 1px solid rgba(148, 202, 255, 0.55);
            background: radial-gradient(circle at 0 0, rgba(148,202,255,0.28), rgba(47,79,130,0.18)), rgba(0,0,0,0.18);
            color: rgba(255,255,255,0.92);
            font-size: 12px;
            font-weight: 700;
            text-decoration:none;
            box-shadow: 0 18px 50px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.10);
            transition: transform 160ms ease, filter 160ms ease, box-shadow 160ms ease;
          }
          .lp-topPrimary:hover{ transform: translateY(-1px); filter: brightness(1.06); box-shadow: 0 26px 70px rgba(0,0,0,0.60), 0 0 28px rgba(120,170,255,0.12), inset 0 1px 0 rgba(255,255,255,0.12); }

          /* hero */
          .lp-hero{
            display:grid;
            grid-template-columns: 1fr;
            gap: 18px;
            align-items: center;
            justify-items: center;
            text-align: center;
            margin: 10px auto 0;
            max-width: 920px;
            padding: 32px 18px 18px;
            border-radius: 26px;
            background: linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02));
            border: 1px solid rgba(255,255,255,0.10);
            box-shadow: 0 28px 90px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.06);
            overflow: hidden;
            position: relative;
          }
          .lp-hero::after{
            content:"";
            position:absolute;
            inset:-2px;
            pointer-events:none;
            background: linear-gradient(120deg, transparent 0%, rgba(255,255,255,0.06) 18%, transparent 38%, transparent 100%);
            transform: translateX(-60%);
            opacity: 0.25;
            animation: lpSheen 8s ease-in-out infinite;
          }
          @keyframes lpSheen{
            0%,55%{ transform: translateX(-60%); opacity: 0; }
            70%{ opacity: 0.25; }
            100%{ transform: translateX(60%); opacity: 0; }
          }

          .lp-pill{
            position: relative;
            display: inline-flex;
            align-items: center;
            gap: 10px;
            border-radius: 999px;
            padding: 7px 12px;
            border: 1px solid rgba(255,255,255,0.12);
            background: rgba(0,0,0,0.18);
            color: rgba(255,255,255,0.72);
            font-size: 11px;
            letter-spacing: 0.12em;
            text-transform: uppercase;
          }
          .lp-pillGlow{
            width: 8px; height: 8px; border-radius: 999px;
            background: radial-gradient(circle at 0 0, rgba(148,202,255,1), rgba(85,130,255,0.45));
            box-shadow: 0 0 0 2px rgba(148,202,255,0.12), 0 0 22px rgba(120,170,255,0.18);
          }
          .lp-h1{
            font-size: 54px;
            line-height: 1.02;
            letter-spacing: -0.035em;
            font-weight: 700;
            margin: 0;
            color: rgba(255,255,255,0.96);
          }
          .lp-sub{
            margin: 0;
            max-width: 720px;
            font-size: 15px;
            line-height: 1.7;
            color: rgba(255,255,255,0.62);
          }
          .lp-subDim{ opacity: 0.85; }
          .lp-ctaRow{
            display:flex;
            gap: 10px;
            flex-wrap: wrap;
            justify-content:center;
            align-items:center;
            margin-top: 2px;
          }
          .lp-primaryBtn{
            display:inline-flex;
            align-items:center;
            justify-content:center;
            padding: 12px 18px;
            border-radius: 999px;
            border: 1px solid rgba(148, 202, 255, 0.60);
            background: radial-gradient(circle at 0 0, rgba(148,202,255,0.35), rgba(47,79,130,0.20)), rgba(0,0,0,0.22);
            color: rgba(255,255,255,0.95);
            font-size: 12px;
            font-weight: 750;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            text-decoration:none;
            box-shadow: 0 22px 55px rgba(0,0,0,0.62), inset 0 1px 0 rgba(255,255,255,0.12);
            transition: transform 160ms ease, filter 160ms ease, box-shadow 160ms ease;
          }
          .lp-primaryBtn:hover{ transform: translateY(-1px); filter: brightness(1.06); box-shadow: 0 30px 75px rgba(0,0,0,0.68), 0 0 28px rgba(120,170,255,0.12), inset 0 1px 0 rgba(255,255,255,0.14); }

          .lp-secondaryBtn{
            display:inline-flex;
            align-items:center;
            justify-content:center;
            padding: 12px 16px;
            border-radius: 999px;
            border: 1px solid rgba(255,255,255,0.16);
            background: rgba(0,0,0,0.12);
            color: rgba(255,255,255,0.78);
            font-size: 12px;
            font-weight: 650;
            text-decoration:none;
            transition: transform 160ms ease, color 160ms ease, border-color 160ms ease, background 160ms ease;
          }
          .lp-secondaryBtn:hover{ transform: translateY(-1px); color: rgba(255,255,255,0.92); border-color: rgba(255,255,255,0.22); background: rgba(255,255,255,0.04); }

          .lp-ghostBtn{
            display:inline-flex;
            align-items:center;
            justify-content:center;
            padding: 12px 14px;
            border-radius: 999px;
            border: 1px solid rgba(255,255,255,0.10);
            background: transparent;
            color: rgba(255,255,255,0.62);
            font-size: 12px;
            font-weight: 600;
            text-decoration:none;
            transition: transform 160ms ease, color 160ms ease, border-color 160ms ease, background 160ms ease;
          }
          .lp-ghostBtn:hover{ transform: translateY(-1px); color: rgba(255,255,255,0.90); border-color: rgba(255,255,255,0.16); background: rgba(255,255,255,0.03); }

          .lp-microRow{
            display:flex;
            gap: 10px;
            flex-wrap: wrap;
            justify-content:center;
            color: rgba(255,255,255,0.52);
            font-size: 12px;
            margin-top: 2px;
          }
          .lp-dot{ opacity: 0.5; }

          .lp-badges{
            margin-top: 6px;
            display:grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 10px;
            width: 100%;
            max-width: 820px;
          }
          .lp-badge{
            border-radius: 16px;
            padding: 12px 12px;
            background: rgba(0,0,0,0.20);
            border: 1px solid rgba(255,255,255,0.08);
            box-shadow: inset 0 1px 0 rgba(255,255,255,0.06);
          }
          .lp-badgeT{ font-size: 12px; font-weight: 750; color: rgba(255,255,255,0.92); }
          .lp-badgeD{ font-size: 12px; margin-top: 3px; color: rgba(255,255,255,0.55); line-height: 1.45; }

          /* sections */
          .lp-section{ margin-top: 34px; }
          .lp-sectionHead{ max-width: 920px; margin: 0 auto 14px; text-align: center; display: grid; gap: 8px; }
          .lp-kicker{
            font-size: 11px;
            letter-spacing: 0.12em;
            text-transform: uppercase;
            color: rgba(255,255,255,0.55);
          }
          .lp-h2{
            margin: 0;
            font-size: 22px;
            font-weight: 700;
            letter-spacing: -0.01em;
            color: rgba(255,255,255,0.94);
          }
          .lp-p{
            margin: 0 auto;
            max-width: 760px;
            font-size: 13px;
            line-height: 1.75;
            color: rgba(255,255,255,0.62);
          }

          .lp-cards3{
            margin-top: 14px;
            display:grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 12px;
          }
          .lp-card{
            border-radius: 18px;
            padding: 16px;
            background: radial-gradient(circle at top left, rgba(255,255,255,0.03), transparent 60%), rgba(0,0,0,0.22);
            border: 1px solid rgba(255,255,255,0.08);
            box-shadow: 0 18px 55px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.06);
          }
          .lp-cardTitle{ font-size: 13px; font-weight: 700; margin-bottom: 6px; }
          .lp-cardBody{ font-size: 12px; line-height: 1.65; color: rgba(255,255,255,0.62); }

          /* main grid */
          .lp-mainGrid{
            margin-top: 18px;
            display:grid;
            grid-template-columns: 1.15fr 0.85fr;
            gap: 14px;
            align-items: start;
          }
          .lp-panel{
            border-radius: 22px;
            padding: 18px;
            background: radial-gradient(circle at top left, rgba(255,255,255,0.035), transparent 60%), rgba(0,0,0,0.22);
            border: 1px solid rgba(255,255,255,0.08);
            box-shadow: 0 22px 70px rgba(0,0,0,0.58), inset 0 1px 0 rgba(255,255,255,0.06);
            overflow:hidden;
          }
          .lp-panelBlue{
            background: radial-gradient(circle at 0 0, rgba(148,202,255,0.18), transparent 60%), rgba(0,0,0,0.24);
            border: 1px solid rgba(148,202,255,0.22);
          }
          .lp-panelHead{
            display:flex;
            align-items:center;
            justify-content:space-between;
            gap: 12px;
            margin-bottom: 10px;
          }
          .lp-panelTitle{ font-size: 14px; font-weight: 750; letter-spacing: -0.01em; }
          .lp-inlineLink{
            font-size: 12px;
            color: rgba(164, 210, 255, 0.96);
            text-decoration: none;
            border-bottom: 1px solid rgba(164,210,255,0.35);
            padding-bottom: 2px;
          }
          .lp-inlineLink:hover{ color: rgba(255,255,255,0.95); border-bottom-color: rgba(255,255,255,0.35); }

          .lp-code{
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
          .lp-panelFoot{
            margin-top: 12px;
            display:flex;
            align-items:center;
            justify-content:space-between;
            gap: 10px;
            flex-wrap: wrap;
          }

          .lp-sideCol{ display:grid; gap: 14px; }
          .lp-steps{ display:grid; gap: 10px; }
          .lp-step{
            display:grid;
            grid-template-columns: 22px 1fr;
            gap: 10px;
            align-items: start;
          }
          .lp-stepBubble{
            width: 22px; height: 22px;
            border-radius: 999px;
            display:flex;
            align-items:center;
            justify-content:center;
            font-size: 12px;
            font-weight: 800;
            background: radial-gradient(circle at 0 0, rgba(148,202,255,0.65), rgba(47,79,130,0.75));
            color: #05060a;
            box-shadow: 0 14px 30px rgba(0,0,0,0.55);
          }
          .lp-stepTitle{ font-size: 13px; font-weight: 750; margin-bottom: 2px; }

          .lp-muted{ font-size: 12px; line-height: 1.6; color: rgba(255,255,255,0.62); }
          .lp-sideCta{ margin-top: 14px; display:grid; gap: 10px; }
          .lp-full{ width: 100%; }
          .lp-center{ text-align: center; }

          /* faq + final */
          .lp-faqGrid{
            margin-top: 14px;
            display:grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 12px;
          }
          .lp-final{
            margin-top: 28px;
            border-radius: 22px;
            padding: 18px;
            background: radial-gradient(circle at top left, rgba(255,255,255,0.03), transparent 60%), rgba(0,0,0,0.22);
            border: 1px solid rgba(255,255,255,0.08);
            box-shadow: 0 22px 70px rgba(0,0,0,0.58), inset 0 1px 0 rgba(255,255,255,0.06);
          }
          .lp-finalInner{ text-align:center; max-width: 820px; margin: 0 auto; }

          .lp-footer{
            margin-top: 28px;
            text-align:center;
            font-size: 12px;
            color: rgba(255,255,255,0.42);
          }

          @media (max-width: 980px){
            .lp-mainGrid{ grid-template-columns: 1fr; }
            .lp-cards3{ grid-template-columns: 1fr; }
            .lp-faqGrid{ grid-template-columns: 1fr; }
            .lp-h1{ font-size: 42px; }
            .lp-badges{ grid-template-columns: 1fr; }
            .lp-top{ padding-bottom: 10px; }
          }
          @media (max-width: 520px){
            .lp-root{ padding-top: 34px; }
            .lp-h1{ font-size: 34px; }
            .lp-topActions{ gap: 8px; }
            .lp-topLink{ display: none; }
          }
        `}</style>
      </div>
    </main>
  );
}
