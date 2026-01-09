// src/app/page.tsx
import Link from "next/link";

export default function Home() {
  return (
    <main
      style={{
        minHeight: "calc(100vh - 80px)",
        width: "100%",
        display: "flex",
        justifyContent: "center",
        padding: "72px 24px 96px",
        background:
          "radial-gradient(circle at top, rgba(255,255,255,0.035), transparent 55%), #050506",
        color: "#f5f5f7",
      }}
    >
      <div style={{ width: "100%", maxWidth: 980 }}>
        {/* HERO */}
        <div style={{ textAlign: "center", margin: "0 auto", maxWidth: 760 }}>
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
              marginBottom: 18,
            }}
          >
            Directr
          </div>

          <h1
            style={{
              fontSize: 44,
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
              fontWeight: 650,
              margin: "0 0 14px",
            }}
          >
            Stop guessing your hook.
            <br />
            Know exactly what to say before you film.
          </h1>

          <p
            style={{
              margin: "0 auto",
              maxWidth: 640,
              fontSize: 14,
              lineHeight: 1.6,
              color: "rgba(255,255,255,0.62)",
            }}
          >
            Type your idea → get spoken hooks, opening delivery notes, a clean video flow,
            shot list, captions, and posting plan — in one output.
          </p>

          <div
            style={{
              marginTop: 22,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <Link
              href="/create"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "10px 18px",
                borderRadius: 999,
                border: "1px solid rgba(148, 202, 255, 0.7)",
                background:
                  "radial-gradient(circle at 0 0, rgba(148,202,255,0.45), rgba(47,79,130,0.8)), #141922",
                color: "#f5f7ff",
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                boxShadow:
                  "0 0 0 1px rgba(24, 39, 70, 0.9), 0 16px 36px rgba(0, 0, 0, 0.9)",
                textDecoration: "none",
              }}
            >
              Generate my hook
            </Link>

            <Link
              href="/pricing"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "10px 16px",
                borderRadius: 999,
                border: "1px solid rgba(255,255,255,0.16)",
                background: "transparent",
                color: "rgba(255,255,255,0.75)",
                fontSize: 12,
                fontWeight: 500,
                textDecoration: "none",
              }}
            >
              Pricing
            </Link>
          </div>

          <div
            style={{
              marginTop: 14,
              fontSize: 12,
              color: "rgba(255,255,255,0.52)",
            }}
          >
            3 free generations • then $19/mo for unlimited • cancel anytime
          </div>
        </div>

        {/* CLEAN SINGLE CARD (no clutter) */}
        <div
          style={{
            marginTop: 34,
            marginLeft: "auto",
            marginRight: "auto",
            maxWidth: 820,
            borderRadius: 22,
            padding: 18,
            background:
              "radial-gradient(circle at top left, rgba(255,255,255,0.035), transparent 60%), #090a0d",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow:
              "0 22px 60px rgba(0,0,0,0.92), inset 0 0 0 0.5px rgba(255,255,255,0.02)",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr",
              gap: 10,
            }}
          >
            <div
              style={{
                fontSize: 11,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.6)",
                marginBottom: 2,
              }}
            >
              What you get
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr",
                gap: 8,
                color: "rgba(255,255,255,0.82)",
                fontSize: 12,
                lineHeight: 1.5,
              }}
            >
              <div>• 8 spoken, non-AI hooks (no “stop scrolling” fluff)</div>
              <div>• Best hook pick + why it works</div>
              <div>• Opening delivery notes (how to say the first 3 seconds)</div>
              <div>• Simple video flow framework (0–3 / 3–10 / 10–25 / CTA)</div>
              <div>• 6–8 shot ideas you can film on a phone</div>
              <div>• 3 captions + posting notes (what to reply to first)</div>
            </div>
          </div>
        </div>

        {/* FOOTER MICROLINE */}
        <div
          style={{
            marginTop: 22,
            textAlign: "center",
            fontSize: 12,
            color: "rgba(255,255,255,0.45)",
          }}
        >
          Type → generate → film → post. No guessing.
        </div>
      </div>
    </main>
  );
}
