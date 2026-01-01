// src/app/pricing/page.tsx
"use client";

import Link from "next/link";

const CREATOR_PRICE_ID = "price_1SaJGQGPmkdLhZZOj6zwnjxb";
const STUDIO_PRICE_ID  = "price_1SaJGoGPmkdLhZZOlFe3ljRj";
const AGENCY_PRICE_ID  = "price_1SaJHBGPmkdLhZZO1jG3jUci";

async function startCheckout(priceId: string) {
  const res = await fetch("/api/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ priceId }),
  });

  const data = await res.json();
  if (data?.url) window.location.href = data.url;
}

export default function PricingPage() {
  return (
    <main className="pricing-root">
      <h1 className="hero-title">Choose your Directr plan</h1>
      <p className="hero-sub">Start simple, scale when you’re ready.</p>

      <section className="pricing-grid">
        <article className="plan-card muted">
          <h2>Starter</h2>
          <p className="price">$0<span>/mo</span></p>
          <ul>
            <li>5 clip generations</li>
            <li>2 full edits</li>
            <li>Watermark</li>
          </ul>
          <button onClick={() => (window.location.href = "/login")}>
            Get started
          </button>
        </article>

        <article className="plan-card">
          <h2>Creator</h2>
          <p className="price">$19.99<span>/mo</span></p>
          <ul>
            <li>More videos</li>
            <li>Captions</li>
            <li>1 workspace</li>
          </ul>
          <button onClick={() => startCheckout(CREATOR_PRICE_ID)}>
            Start Creator
          </button>
        </article>

        <article className="plan-card pro">
          <span className="badge">Most popular</span>
          <h2>Studio</h2>
          <p className="price">$49.99<span>/mo</span></p>
          <ul>
            <li>Higher limits</li>
            <li>Multi-platform</li>
            <li>2 seats</li>
          </ul>
          <button onClick={() => startCheckout(STUDIO_PRICE_ID)}>
            Start Studio
          </button>
        </article>

        <article className="plan-card">
          <h2>Agency</h2>
          <p className="price">$149.99<span>/mo</span></p>
          <ul>
            <li>Big quotas</li>
            <li>Shared libraries</li>
            <li>Priority support</li>
          </ul>
          <button onClick={() => startCheckout(AGENCY_PRICE_ID)}>
            Start Agency
          </button>
        </article>
      </section>

      <p className="footer-hint">
        Just testing?{" "}
        <Link href="/login">Start free and upgrade later.</Link>
      </p>

      <style jsx>{`
        .pricing-root {
          min-height: 100vh;
          width: 100%;
          padding: 96px 24px;
          background: radial-gradient(
              circle at top,
              rgba(255,255,255,0.04),
              transparent 60%
            ),
            #050506;
          color: #f5f5f7;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .hero-title {
          font-size: 32px;
          font-weight: 600;
          margin-bottom: 8px;
        }

        .hero-sub {
          font-size: 14px;
          opacity: 0.7;
          margin-bottom: 48px;
        }

        .pricing-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 20px;
          max-width: 1100px;
          width: 100%;
        }

        .plan-card {
          background: #0b0d12;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 18px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          position: relative;
        }

        .plan-card.pro {
          border-color: rgba(150,200,255,0.6);
          background: #111827;
        }

        .plan-card.muted {
          opacity: 0.9;
        }

        .badge {
          position: absolute;
          top: 12px;
          right: 12px;
          font-size: 10px;
          padding: 4px 8px;
          border-radius: 999px;
          background: rgba(150,200,255,0.2);
        }

        .price {
          font-size: 24px;
          font-weight: 600;
        }

        .price span {
          font-size: 12px;
          opacity: 0.6;
        }

        ul {
          padding-left: 16px;
          font-size: 12px;
          opacity: 0.85;
        }

        button {
          margin-top: auto;
          padding: 10px;
          border-radius: 999px;
          border: 1px solid rgba(255,255,255,0.2);
          background: #111827;
          color: white;
          cursor: pointer;
        }

        .footer-hint {
          margin-top: 40px;
          font-size: 12px;
          opacity: 0.6;
        }
      `}</style>
    </main>
  );
}
