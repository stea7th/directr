// src/app/pricing/page.tsx
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// ✅ SINGLE SOURCE OF TRUTH — YOUR REAL PRICE ID
const STRIPE_PRICE_ID = "price_1SaJGQGPmkdLhZZOj6zwnjxb";

export default function PricingPage() {
  const router = useRouter();

  const [success, setSuccess] = useState(false);
  const [canceled, setCanceled] = useState(false);

  // ✅ Sign-in required modal
  const [showSignin, setShowSignin] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setSuccess(params.get("success") === "1");
    setCanceled(params.get("canceled") === "1");
  }, []);

  async function startCheckout() {
    try {
      setCheckoutLoading(true);

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId: STRIPE_PRICE_ID }),
      });

      const data = await res.json().catch(() => null);

      // ✅ If not signed in → show clear modal
      if (res.status === 401 && (data?.error === "signin_required" || data?.message)) {
        setShowSignin(true);
        return;
      }

      if (!res.ok || !data?.success || !data?.url) {
        console.error("Checkout error:", data || (await res.text()));
        alert(data?.message || data?.error || "Something went wrong starting checkout. Try again.");
        return;
      }

      window.location.href = data.url;
    } catch (err) {
      console.error("Checkout error:", err);
      alert("Something went wrong starting checkout. Try again.");
    } finally {
      setCheckoutLoading(false);
    }
  }

  function goToLogin() {
    const next = encodeURIComponent("/pricing");
    router.push(`/login?next=${next}`);
  }

  return (
    <main className="pricing-root">
      <section className="pricing-hero">
        <h1>Directr Pro</h1>
        <p>Unlimited scroll-stopping hooks + captions + posting framework.</p>
      </section>

      <section className="pricing-toggle-row">
        <div className="toggle-pill">
          <button className="toggle-btn toggle-btn--active">Monthly</button>
          <button className="toggle-btn toggle-btn--ghost" disabled>
            Yearly (soon)
          </button>
        </div>
        <div className="toggle-save-pill">
          <span>Cancel anytime</span>
        </div>
      </section>

      {(success || canceled) && (
        <section className="pricing-faq-hint" style={{ marginTop: -10 }}>
          {success && (
            <p style={{ color: "rgba(205, 230, 255, 0.9)" }}>
              ✅ Payment successful. Your account is now Pro.{" "}
              <Link href="/create" className="inline-link">
                Go generate hooks
              </Link>
              .
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
            <p>For creators who post consistently and don’t guess hooks.</p>
          </header>

          <div className="plan-price-row">
            <span className="plan-price">$19</span>
            <span className="plan-period">/month</span>
          </div>

          <p className="plan-tagline">Unlimited hooks · captions · posting framework.</p>

          <ul className="plan-features">
            <li>Unlimited hook generations</li>
            <li>Hooks that sound human (not AI)</li>
            <li>3 captions + CTA per video</li>
            <li>Shot list + b-roll ideas</li>
            <li>Posting framework + retention notes</li>
            <li>Cancel anytime</li>
          </ul>

          <button
            type="button"
            className="plan-cta plan-cta--pro"
            onClick={startCheckout}
            disabled={checkoutLoading}
          >
            {checkoutLoading ? "Opening checkout…" : "Start Pro — $19/mo"}
          </button>
        </article>
      </section>

      <section className="pricing-faq-hint">
        <p>
          Not ready yet?{" "}
          <Link href="/create" className="inline-link">
            Try 3 free generations
          </Link>{" "}
          then upgrade when you hit the limit.
        </p>
      </section>

      {/* ✅ Sign-in required modal */}
      {showSignin && (
        <div className="modalOverlay" role="dialog" aria-modal="true">
          <div className="modalCard">
            <div className="modalTitle">Please sign in first</div>
            <div className="modalText">
              You need an account to upgrade to Pro so we can unlock unlimited generations on your profile.
            </div>

            <div className="modalActions">
              <button
                type="button"
                className="btn btn--ghost"
                onClick={() => setShowSignin(false)}
                disabled={checkoutLoading}
              >
                Not now
              </button>

              <button type="button" className="btn btn--primary" onClick={goToLogin} disabled={checkoutLoading}>
                Sign in / Create account
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
      .pricing-root {
  min-height: 100vh;
  width: 100vw;
  margin-left: calc(50% - 50vw);
  margin-right: calc(50% - 50vw);

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

  overflow-x: hidden;
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
          justify-items: center;
        }

        @media (min-width: 900px) {
          .pricing-grid {
            grid-template-columns: 1fr;
          }
        }

        .plan-card {
          width: 100%;
          max-width: 420px;
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

        .plan-cta--pro {
          background: radial-gradient(
                circle at 0 0,
                rgba(205, 230, 255, 0.7),
                rgba(74, 111, 170, 0.9)
              ),
            #141823;
          color: #05060a;
        }

        .plan-cta:disabled {
          opacity: 0.8;
          cursor: not-allowed;
          transform: none;
          filter: none;
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

        /* ✅ Modal (matches your dark UI) */
        .modalOverlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.62);
          backdrop-filter: blur(10px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 18px;
          z-index: 9999;
        }

        .modalCard {
          width: 100%;
          max-width: 440px;
          border-radius: 22px;
          padding: 18px;
          background: radial-gradient(
                circle at top left,
                rgba(255, 255, 255, 0.04),
                transparent 60%
              ),
            #0a0b0f;
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 40px 110px rgba(0, 0, 0, 0.95);
        }

        .modalTitle {
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 6px;
          letter-spacing: 0.02em;
        }

        .modalText {
          font-size: 12px;
          line-height: 1.55;
          color: rgba(255, 255, 255, 0.68);
        }

        .modalActions {
          margin-top: 14px;
          display: flex;
          gap: 10px;
          justify-content: flex-end;
          flex-wrap: wrap;
        }

        /* Uses your global .btn styles */
      `}</style>
    </main>
  );
}
