// src/app/pricing/page.tsx
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

// 🔒 SINGLE SOURCE OF TRUTH — YOUR REAL PRICE ID
const STRIPE_PRICE_ID = "price_1SaJGQGPmkdLhZZOj6zwnjxb";

async function startCheckout() {
  try {
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ priceId: STRIPE_PRICE_ID }),
    });

    if (!res.ok) {
      console.error("Checkout error:", await res.text());
      alert("Failed to start checkout.");
      return;
    }

    const data = await res.json();
    if (!data?.url) {
      alert("No Stripe checkout URL returned.");
      return;
    }

    window.location.href = data.url;
  } catch (err) {
    console.error("Checkout error:", err);
    alert("Checkout failed.");
  }
}

export default function PricingPage() {
  const [success, setSuccess] = useState(false);
  const [canceled, setCanceled] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setSuccess(params.get("success") === "1");
    setCanceled(params.get("canceled") === "1");
  }, []);

  return (
    <main className="pricing-root">
      <section className="pricing-hero">
        <h1>Directr Pro</h1>
        <p>Hooks that don’t sound AI. A posting framework that actually converts.</p>
      </section>

      {(success || canceled) && (
        <section className="pricing-faq-hint">
          {success && (
            <p style={{ color: "rgba(205,230,255,.9)" }}>
              ✅ You’re Pro.{" "}
              <Link href="/create" className="inline-link">
                Go generate hooks
              </Link>
            </p>
          )}
          {canceled && <p>Checkout canceled. You can upgrade anytime.</p>}
        </section>
      )}

      <section className="pricing-grid">
        <article className="plan-card plan-card--pro">
          <div className="plan-badge">Only plan</div>

          <header className="plan-header">
            <h2>Pro</h2>
            <p>For creators who care about retention.</p>
          </header>

          <div className="plan-price-row">
            <span className="plan-price">$19</span>
            <span className="plan-period">/month</span>
          </div>

          <p className="plan-tagline">Unlimited hooks · captions · posting framework</p>

          <ul className="plan-features">
            <li>Unlimited hook generations</li>
            <li>Human-sounding hooks (no AI fluff)</li>
            <li>Shot list + b-roll ideas</li>
            <li>3 captions + CTA per video</li>
            <li>Posting + retention framework</li>
            <li>Cancel anytime</li>
          </ul>

          <button
            type="button"
            className="plan-cta plan-cta--pro"
            onClick={startCheckout}
          >
            Start Pro — $19/mo
          </button>
        </article>
      </section>

      <section className="pricing-faq-hint">
        <p>
          Want to try first?{" "}
          <Link href="/create" className="inline-link">
            Use 3 free generations
          </Link>
        </p>
      </section>

      {/* ⬇️ CSS UNCHANGED (exact UI preserved) */}
      {/* KEEP YOUR EXISTING STYLE BLOCK HERE — unchanged */}
    </main>
  );
}in>
  );
}
