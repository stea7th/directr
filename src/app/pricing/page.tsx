// src/app/pricing/page.tsx
"use client";

import Link from "next/link";

// Hard-coded Stripe price IDs
const CREATOR_PRICE_ID = "price_1SaJGQGPmkdLhZZOj6zwnjxb";
const STUDIO_PRICE_ID  = "price_1SaJGoGPmkdLhZZOlFe3ljRj";
const AGENCY_PRICE_ID  = "price_1SaJHBGPmkdLhZZO1jG3jUci";

async function startCheckout(priceId: string) {
  try {
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ priceId }),
    });

    if (!res.ok) {
      console.error("Checkout error:", await res.text());
      alert("Something went wrong starting checkout. Try again.");
      return;
    }

    const data = await res.json();
    if (!data?.url) {
      alert("No checkout URL returned from server.");
      return;
    }

    window.location.href = data.url;
  } catch (err) {
    console.error("Checkout error:", err);
    alert("Something went wrong starting checkout. Try again.");
  }
}

export default function PricingPage() {
  return (
    <main className="pricing-root">
      <section className="pricing-hero">
        <h1>Choose your Directr plan</h1>
        <p>
          Start simple, scale when you&apos;re ready.
        </p>
      </section>

      <section className="pricing-toggle-row">
        <div className="toggle-pill">
          <button className="toggle-btn toggle-btn--active">Monthly</button>
          <button className="toggle-btn toggle-btn--ghost" disabled>
            Yearly (soon)
          </button>
        </div>
        <div className="toggle-save-pill">
          <span>Save up to 2 months on yearly</span>
        </div>
      </section>

      <section className="pricing-grid">
        {/* Starter - free */}
        <article className="plan-card plan-card--muted">
          <header className="plan-header">
            <h2>Starter</h2>
            <p>Test Directr with a limited free seat.</p>
          </header>
          <div className="plan-price-row">
            <span className="plan-price">$0</span>
            <span className="plan-period">/month</span>
          </div>
          <p className="plan-tagline">Perfect to feel the flow.</p>
          <ul className="plan-features">
            <li>5 clip generations / month</li>
            <li>2 full video edits</li>
            <li>Basic captions</li>
            <li>Watermark on exports</li>
            <li>SD quality</li>
          </ul>
          <button
            type="button"
            className="plan-cta plan-cta--ghost"
            onClick={() => {
              window.location.href = "/login";
            }}
          >
            Get started free
          </button>
        </article>

        {/* Creator */}
        <article className="plan-card">
          <header className="plan-header">
            <h2>Creator</h2>
            <p>For solo creators getting started.</p>
          </header>
          <div className="plan-price-row">
            <span className="plan-price">$19.99</span>
            <span className="plan-period">/month</span>
          </div>
          <p className="plan-tagline">X videos / month · single workspace.</p>
          <ul className="plan-features">
            <li>X videos / month</li>
            <li>Basic clipping &amp; captions</li>
            <li>Single workspace</li>
          </ul>
          <button
            type="button"
            className="plan-cta"
            onClick={() => startCheckout(CREATOR_PRICE_ID)}
          >
            Start with Creator
          </button>
        </article>

        {/* Studio (most popular) */}
        <article className="plan-card plan-card--pro">
          <div className="plan-badge">Most popular</div>
          <header className="plan-header">
            <h2>Studio</h2>
            <p>For creators posting daily across platforms.</p>
          </header>
          <div className="plan-price-row">
            <span className="plan-price">$49.99</span>
            <span className="plan-period">/month</span>
          </div>
          <p className="plan-tagline">
            Higher video quota, multi-platform outputs.
          </p>
          <ul className="plan-features">
            <li>Higher video quota</li>
            <li>Multi-platform outputs</li>
            <li>Priority processing</li>
            <li>2 team seats</li>
          </ul>
          <button
            type="button"
            className="plan-cta plan-cta--pro"
            onClick={() => startCheckout(STUDIO_PRICE_ID)}
          >
            Start with Studio
          </button>
        </article>

        {/* Agency */}
        <article className="plan-card plan-card--edge">
          <header className="plan-header">
            <h2>Agency</h2>
            <p>For teams running multiple creators/brands.</p>
          </header>
          <div className="plan-price-row">
            <span className="plan-price">$149.99</span>
            <span className="plan-period">/month</span>
          </div>
          <p className="plan-tagline">
            Bigger video quota and shared brand libraries.
          </p>
          <ul className="plan-features">
            <li>Bigger video quota</li>
            <li>Shared brand libraries</li>
            <li>Priority support</li>
            <li>5+ team seats</li>
          </ul>
          <button
            type="button"
            className="plan-cta plan-cta--outline"
            onClick={() => startCheckout(AGENCY_PRICE_ID)}
          >
            Start with Agency
          </button>
        </article>
      </section>

      <section className="pricing-faq-hint">
        <p>
          Just testing things?{" "}
          <Link href="/login" className="inline-link">
            Start on Starter and upgrade from inside Directr.
          </Link>
        </p>
      </section>

      {/* styles are same as your old UI, just kept inline so no extra CSS file */}
      <style jsx>{`
        .pricing-root {
          min-height: calc(100vh - 64px);
          padding: 64px 24px 80px;
          background: radial-gradient(
              circle at top,
              rgba(255, 255, 255, 0.03),
              transparent 55%
            ),
            #050506;
          color: #f5f5f7;
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        @media (min-width: 900px) {
          .pricing-root {
            padding: 72px 64px 96px;
          }
        }

        .pricing-hero {
          max-width: 720px;
          margin: 0 auto;
          text-align: center;
        }

        .pricing-hero h1 {
          font-size: 26px;
          font-weight: 600;
          letter-spacing: 0.02em;
          margin-bottom: 10px;
        }

        .pricing-hero p {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.6);
        }

        .pricing-toggle-row {
          max-width: 720px;
          margin: 0 auto;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .toggle-pill {
          display: inline-flex;
          padding: 4px;
          border-radius: 999px;
          background: radial-gradient(
                circle at 0 0,
                rgba(255, 255, 255, 0.1),
                transparent 60%
              ),
            #050609;
          border: 1px solid rgba(255, 255, 255, 0.08);
        }

        .toggle-btn {
          border: none;
          outline: none;
          border-radius: 999px;
          padding: 6px 16px;
          font-size: 12px;
          cursor: pointer;
          background: transparent;
          color: rgba(255, 255, 255, 0.7);
          transition: background 0.18s ease-out, color 0.18s ease-out,
            transform 0.18s ease-out;
        }

        .toggle-btn--active {
          background: radial-gradient(
                circle at top left,
                rgba(157, 196, 255, 0.7),
                rgba(56, 91, 140, 0.9)
              ),
            #141820;
          color: #f5f7ff;
          transform: translateY(-1px);
        }

        .toggle-btn--ghost:hover {
          transform: translateY(-1px);
          color: #f5f5f7;
        }

        .toggle-save-pill {
          border-radius: 999px;
          padding: 6px 12px;
          border: 1px dashed rgba(255, 255, 255, 0.18);
          font-size: 11px;
          color: rgba(255, 255, 255, 0.6);
          background: radial-gradient(
              circle at top,
              rgba(157, 196, 255, 0.12),
              transparent 65%
            );
        }

        .pricing-grid {
          max-width: 1100px;
          margin: 8px auto 0;
          display: grid;
          grid-template-columns: 1fr;
          gap: 18px;
        }

        @media (min-width: 900px) {
          .pricing-grid {
            grid-template-columns: repeat(4, minmax(0, 1fr));
          }
        }

        .plan-card {
          border-radius: 22px;
          padding: 20px 18px 20px;
          background: radial-gradient(
                circle at top left,
                rgba(255, 255, 255, 0.03),
                transparent 60%
              ),
            #090a0d;
          border: 1px solid rgba(255, 255, 255, 0.06);
          box-shadow:
            0 20px 45px rgba(0, 0, 0, 0.9),
            inset 0 0 0 0.5px rgba(255, 255, 255, 0.02);
          display: flex;
          flex-direction: column;
          gap: 12px;
          position: relative;
          overflow: hidden;
          transition:
            transform 0.22s ease-out,
            box-shadow 0.22s ease-out,
            border-color 0.22s ease-out,
            background 0.22s ease-out;
        }

        .plan-card:hover {
          transform: translateY(-4px);
          border-color: rgba(255, 255, 255, 0.1);
          background: radial-gradient(
                circle at top left,
                rgba(255, 255, 255, 0.05),
                transparent 65%
              ),
            #0b0d12;
          box-shadow:
            0 28px 70px rgba(0, 0, 0, 0.95),
            inset 0 0 0 0.5px rgba(255, 255, 255, 0.03);
        }

        .plan-card--muted {
          opacity: 0.9;
        }

        .plan-card--pro {
          background: radial-gradient(
                circle at 0 0,
                rgba(148, 202, 255, 0.35),
                rgba(42, 70, 114, 0.8)
              ),
            #111521;
          border-color: rgba(164, 210, 255, 0.7);
          box-shadow:
            0 30px 80px rgba(0, 0, 0, 0.95),
            0 0 0 1px rgba(35, 59, 100, 0.8);
        }

        .plan-card--edge {
          background: radial-gradient(
                circle at 100% 0,
                rgba(255, 178, 102, 0.22),
                transparent 65%
              ),
            #0d0b10;
        }

        .plan-header h2 {
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 4px;
        }

        .plan-header p {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.6);
        }

        .plan-price-row {
          display: flex;
          align-items: baseline;
          gap: 4px;
        }

        .plan-price {
          font-size: 24px;
          font-weight: 600;
        }

        .plan-period {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.6);
        }

        .plan-tagline {
          font-size: 11px;
          color: rgba(255, 255, 255, 0.65);
        }

        .plan-features {
          list-style: none;
          padding: 0;
          margin: 4px 0 14px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .plan-features li {
          font-size: 11px;
          color: rgba(255, 255, 255, 0.8);
          display: flex;
          gap: 6px;
        }

        .plan-features li::before {
          content: "•";
          color: rgba(164, 210, 255, 0.85);
          font-size: 14px;
          line-height: 1;
        }

        .plan-cta {
          margin-top: auto;
          border-radius: 999px;
          padding: 9px 18px;
          border: 1px solid rgba(148, 202, 255, 0.7);
          background: radial-gradient(
                circle at 0 0,
                rgba(148, 202, 255, 0.45),
                rgba(47, 79, 130, 0.8)
              ),
            #141922;
          color: #f5f7ff;
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 0.03em;
          text-transform: uppercase;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          box-shadow:
            0 0 0 1px rgba(24, 39, 70, 0.9),
            0 16px 36px rgba(0, 0, 0, 0.9);
          transition:
            transform 0.2s ease-out,
            box-shadow 0.2s ease-out,
            filter 0.2s ease-out,
            background 0.2s ease-out;
        }

        .plan-cta--ghost {
          background: transparent;
          border-color: rgba(255, 255, 255, 0.16);
          box-shadow:
            0 0 0 1px rgba(40, 40, 60, 0.7),
            0 10px 24px rgba(0, 0, 0, 0.9);
        }

        .plan-cta--pro {
          background: radial-gradient(
                circle at 0 0,
                rgba(205, 230, 255, 0.7),
                rgba(74, 111, 170, 0.9)
              ),
            #141823;
          color: #05060a;
        }

        .plan-cta--outline {
          background: transparent;
          border-color: rgba(255, 196, 140, 0.9);
          box-shadow:
            0 0 0 1px rgba(80, 50, 35, 0.9),
            0 14px 30px rgba(0, 0, 0, 0.95);
        }

        .plan-badge {
          position: absolute;
          top: 10px;
          right: 10px;
          border-radius: 999px;
          padding: 4px 10px;
          background: rgba(6, 12, 21, 0.9);
          border: 1px solid rgba(210, 230, 255, 0.9);
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.09em;
          color: #e8f0ff;
        }

        .pricing-faq-hint {
          max-width: 720px;
          margin: 8px auto 0;
          text-align: center;
        }

        .pricing-faq-hint p {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.6);
        }

        .inline-link {
          color: rgba(164, 210, 255, 0.96);
          text-decoration: underline;
          text-decoration-thickness: 1px;
          text-underline-offset: 2px;
        }

        .inline-link:hover {
          color: #ffffff;
        }
      `}</style>
    </main>
  );
}
