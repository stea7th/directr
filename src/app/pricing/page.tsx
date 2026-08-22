"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// Preserve the production Stripe price and the existing authenticated checkout endpoint.
const STRIPE_PRICE_ID = "price_1SaJGQGPmkdLhZZOj6zwnjxb";

export default function PricingPage() {
  const router = useRouter();
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutMessage, setCheckoutMessage] = useState("");
  const [requiresSignIn, setRequiresSignIn] = useState(false);

  useEffect(() => {
    const search = new URLSearchParams(window.location.search);
    if (search.get("success") === "1") setCheckoutMessage("You’re in. Your Director is ready whenever you are.");
    if (search.get("canceled") === "1") setCheckoutMessage("Checkout canceled. Your free directions are still available.");
  }, []);

  async function startCheckout() {
    setCheckoutLoading(true);
    setCheckoutMessage("");
    setRequiresSignIn(false);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId: STRIPE_PRICE_ID }),
      });
      const result = await response.json() as { success?: boolean; error?: string; message?: string; url?: string };

      if (response.status === 401) {
        setRequiresSignIn(true);
        setCheckoutMessage("Sign in first so your subscription attaches to the right account.");
        return;
      }

      if (!response.ok || !result.success || !result.url) {
        throw new Error(result.message || result.error || "Checkout could not be started.");
      }

      window.location.href = result.url;
    } catch (error) {
      setCheckoutMessage(error instanceof Error ? error.message : "Checkout could not be started.");
    } finally {
      setCheckoutLoading(false);
    }
  }

  return (
    <div className="pricing-shell">
      <header className="pricing-heading"><span className="section-kicker">A director that fits your process</span><h1>Try the direction.<br /><span>Pay when it makes sense.</span></h1><p>Start free, see what Directr actually creates, and upgrade if it earns a place in your routine.</p></header>

      {checkoutMessage && <p className="pricing-message" role="status">{checkoutMessage} {requiresSignIn && <button type="button" onClick={() => router.push("/login?next=%2Fpricing")}>Sign in →</button>}</p>}

      <div className="pricing-options">
        <article className="pricing-option"><div className="pricing-option__top"><span>Start here</span><h2>Free</h2><p>Get the full experience before deciding anything.</p></div><div className="pricing-option__price">$0</div><ul><li>Build your Creator DNA</li><li>Three complete creative directions</li><li>Shot-by-shot Film Mode</li><li>Your personal content Library</li></ul><Link href="/login?next=%2Fonboarding" className="directr-button directr-button--quiet">Get your first direction →</Link></article>

        <article className="pricing-option pricing-option--pro"><div className="pricing-option__top"><span>Your director, on call</span><h2>Directr Pro</h2><p>For creators who are done figuring it out alone.</p></div><div className="pricing-option__price">$19 <span>/ month</span></div><ul><li>Unlimited film-ready directions</li><li>Daily ideas around your Creator DNA</li><li>Structured hooks, flow, shots, and delivery</li><li>Shot-by-shot Film Mode</li><li>Creative coaching around your actual history</li><li>Cancel anytime</li></ul><button type="button" className="directr-button directr-button--accent" disabled={checkoutLoading} onClick={() => void startCheckout()}>{checkoutLoading ? "Opening checkout…" : "Get Directr Pro →"}</button></article>
      </div>
      <p className="pricing-footnote">No promises about views. Just a better idea of what to film.</p>
    </div>
  );
}
