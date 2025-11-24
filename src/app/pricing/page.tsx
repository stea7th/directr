"use client";

import React, { useState } from "react";

console.log("ENV CHECK:", {
  creator: process.env.NEXT_PUBLIC_STRIPE_PRICE_CREATOR,
  studio: process.env.NEXT_PUBLIC_STRIPE_PRICE_STUDIO,
  agency: process.env.NEXT_PUBLIC_STRIPE_PRICE_AGENCY,
});

const CREATOR_PRICE_ID = process.env.NEXT_PUBLIC_STRIPE_PRICE_CREATOR;
const STUDIO_PRICE_ID = process.env.NEXT_PUBLIC_STRIPE_PRICE_STUDIO;
const AGENCY_PRICE_ID = process.env.NEXT_PUBLIC_STRIPE_PRICE_AGENCY;

type TierKey = "creator" | "studio" | "agency";

const PRICE_MAP: Record<TierKey, string | undefined> = {
  creator: CREATOR_PRICE_ID,
  studio: STUDIO_PRICE_ID,
  agency: AGENCY_PRICE_ID,
};

export default function PricingPage() {
  const [loadingTier, setLoadingTier] = useState<TierKey | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleCheckout(tier: TierKey) {
    setError(null);

    const priceId = PRICE_MAP[tier];
    if (!priceId) {
      setError(
        `Missing Stripe price ID for ${tier}. Add NEXT_PUBLIC_STRIPE_PRICE_${tier.toUpperCase()} in Vercel env.`
      );
      return;
    }

    try {
      setLoadingTier(tier);

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      });

      const data = await res.json();

      if (!res.ok || !data?.url) {
        console.error("Checkout error:", data);
        setError(data?.error || "Checkout failed. Try again.");
        setLoadingTier(null);
        return;
      }

      // Redirect to Stripe
      window.location.href = data.url;
    } catch (err: any) {
      console.error("Checkout exception:", err);
      setError(err?.message || "Something went wrong.");
      setLoadingTier(null);
    }
  }

  return (
    <main className="pricing-root">
      <section className="pricing-shell">
        <header className="pricing-header">
          <div>
            <h1>Choose your Directr plan</h1>
            <p>Start simple, scale when you&apos;re ready.</p>
          </div>
        </header>

        <div className="pricing-grid">
          {/* Creator Tier */}
          <article className="pricing-card">
            <div className="pricing-card-header">
              <h2>Creator</h2>
              <p>For solo creators getting started.</p>
            </div>

            <div className="pricing-price">
              <span className="pricing-price-main">$19</span>
              <span className="pricing-price-sub">/month</span>
            </div>

            <ul className="pricing-features">
              <li>• X videos / month</li>
              <li>• Basic clipping & captions</li>
              <li>• Single workspace</li>
            </ul>

            <button
              type="button"
              className="pricing-btn"
              onClick={() => handleCheckout("creator")}
              disabled={loadingTier === "creator"}
            >
              {loadingTier === "creator" ? "Redirecting..." : "Start with Creator"}
            </button>
          </article>

          {/* Studio Tier */}
          <article className="pricing-card pricing-card--highlight">
            <div className="pricing-pill">Most popular</div>
            <div className="pricing-card-header">
              <h2>Studio</h2>
              <p>For creators posting daily across platforms.</p>
            </div>

            <div className="pricing-price">
              <span className="pricing-price-main">$49</span>
              <span className="pricing-price-sub">/month</span>
            </div>

            <ul className="pricing-features">
              <li>• Higher video quota</li>
              <li>• Multi-platform outputs</li>
              <li>• Priority processing</li>
              <li>• 2 team seats</li>
            </ul>

            <button
              type="button"
              className="pricing-btn pricing-btn--primary"
              onClick={() => handleCheckout("studio")}
              disabled={loadingTier === "studio"}
            >
              {loadingTier === "studio" ? "Redirecting..." : "Start with Studio"}
            </button>
          </article>

          {/* Agency Tier */}
          <article className="pricing-card">
            <div className="pricing-card-header">
              <h2>Agency</h2>
              <p>For teams running multiple creators/brands.</p>
            </div>

            <div className="pricing-price">
              <span className="pricing-price-main">$99</span>
              <span className="pricing-price-sub">/month</span>
            </div>

            <ul className="pricing-features">
              <li>• Bigger video quota</li>
              <li>• Shared brand libraries</li>
              <li>• Priority support</li>
              <li>• 5+ team seats</li>
            </ul>

            <button
              type="button"
              className="pricing-btn"
              onClick={() => handleCheckout("agency")}
              disabled={loadingTier === "agency"}
            >
              {loadingTier === "agency" ? "Redirecting..." : "Start with Agency"}
            </button>
          </article>
        </div>

        {error && <p className="pricing-error">{error}</p>}
      </section>

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
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        @media (min-width: 900px) {
          .pricing-root {
            padding: 80px 64px 96px;
          }
        }

        .pricing-shell {
          width: 100%;
          max-width: 1024px;
        }

        .pricing-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 16px;
          margin-bottom: 32px;
        }

        .pricing-header h1 {
          font-size: 26px;
          font-weight: 600;
          color: #f5f5f7;
          letter-spacing: 0.01em;
        }

        .pricing-header p {
          margin-top: 6px;
          font-size: 13px;
          color: rgba(255, 255, 255, 0.55);
        }

        .pricing-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 18px;
        }

        @media (min-width: 900px) {
          .pricing-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }

        .pricing-card {
          position: relative;
          border-radius: 24px;
          padding: 22px 20px 20px;
          background: radial-gradient(
                circle at top left,
                rgba(255, 255, 255, 0.02),
                transparent 60%
              ),
            #090a0d;
          border: 1px solid rgba(255, 255, 255, 0.05);
          box-shadow:
            0 18px 40px rgba(0, 0, 0, 0.9),
            inset 0 0 0 0.5px rgba(255, 255, 255, 0.02);
          display: flex;
          flex-direction: column;
          gap: 12px;
          transition:
            transform 0.2s ease-out,
            box-shadow 0.2s ease-out,
            border-color 0.2s ease-out,
            background 0.2s ease-out;
        }

        .pricing-card--highlight {
          background: radial-gradient(
                circle at 0% 0%,
                rgba(139, 187, 255, 0.22),
                transparent 60%
              ),
            #0c0e13;
          border-color: rgba(148, 202, 255, 0.7);
        }

        .pricing-card:hover {
          transform: translateY(-4px);
          border-color: rgba(255, 255, 255, 0.08);
          background: radial-gradient(
                circle at top left,
                rgba(255, 255, 255, 0.04),
                transparent 70%
              ),
            #0c0e13;
          box-shadow:
            0 26px 60px rgba(0, 0, 0, 0.95),
            inset 0 0 0 0.5px rgba(255, 255, 255, 0.03);
        }

        .pricing-card-header h2 {
          font-size: 15px;
          font-weight: 600;
          color: #f5f5f7;
        }

        .pricing-card-header p {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.55);
        }

        .pricing-price {
          display: flex;
          align-items: baseline;
          gap: 4px;
        }

        .pricing-price-main {
          font-size: 28px;
          font-weight: 600;
          color: #f5f7ff;
        }

        .pricing-price-sub {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.6);
        }

        .pricing-features {
          margin: 6px 0 14px;
          padding: 0;
          list-style: none;
          font-size: 12px;
          color: rgba(255, 255, 255, 0.7);
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .pricing-btn {
          margin-top: auto;
          border-radius: 999px;
          padding: 9px 20px;
          border: 1px solid rgba(139, 187, 255, 0.7);
          background: radial-gradient(
                circle at 0% 0%,
                rgba(139, 187, 255, 0.35),
                rgba(50, 80, 130, 0.6)
              ),
            #171c26;
          color: #f5f7ff;
          font-weight: 500;
          font-size: 13px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          box-shadow:
            0 0 0 1px rgba(20, 40, 70, 0.7),
            0 12px 30px rgba(0, 0, 0, 0.9);
          transition:
            transform 0.18s ease-out,
            box-shadow 0.18s ease-out,
            filter 0.18s ease-out,
            background 0.18s ease-out,
            opacity 0.15s ease-out;
        }

        .pricing-btn--primary {
          border-color: rgba(163, 210, 255, 0.9);
          background: radial-gradient(
                circle at 0% 0%,
                rgba(163, 210, 255, 0.7),
                rgba(60, 100, 170, 0.9)
              ),
            #171c26;
        }

        .pricing-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow:
            0 0 0 1px rgba(148, 202, 255, 0.8),
            0 18px 45px rgba(0, 0, 0, 1);
          filter: brightness(1.04);
        }

        .pricing-btn:disabled {
          opacity: 0.7;
          cursor: default;
        }

        .pricing-pill {
          position: absolute;
          top: 12px;
          right: 16px;
          padding: 3px 10px;
          border-radius: 999px;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          background: rgba(16, 185, 129, 0.1);
          color: #6ee7b7;
          border: 1px solid rgba(16, 185, 129, 0.3);
        }

        .pricing-error {
          margin-top: 16px;
          font-size: 12px;
          color: #ff7b7b;
        }
      `}</style>
    </main>
  );
}
