"use client";

import Link from "next/link";

const CREATOR_PRICE_ID = "price_1SaJGQGPmkdLhZZOj6zwnjxb";
const STUDIO_PRICE_ID = "price_1SaJGoGPmkdLhZZOlFe3ljRj";
const AGENCY_PRICE_ID = "price_1SaJHBGPmkdLhZZO1jG3jUci";

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
    <main className="pricing">
      <header className="hero">
        <h1>Choose your Directr plan</h1>
        <p>Start simple. Scale when you’re ready.</p>
      </header>

      <section className="grid">
        <article className="card muted">
          <h2>Starter</h2>
          <p className="price">$0</p>
          <ul>
            <li>5 clips / month</li>
            <li>Basic captions</li>
            <li>Watermark</li>
          </ul>
          <Link href="/login" className="btn ghost">
            Get started
          </Link>
        </article>

        <article className="card">
          <h2>Creator</h2>
          <p className="price">$19.99</p>
          <ul>
            <li>More videos</li>
            <li>No watermark</li>
          </ul>
          <button className="btn" onClick={() => startCheckout(CREATOR_PRICE_ID)}>
            Start Creator
          </button>
        </article>

        <article className="card pro">
          <span className="badge">Most popular</span>
          <h2>Studio</h2>
          <p className="price">$49.99</p>
          <ul>
            <li>Higher limits</li>
            <li>Teams</li>
            <li>Priority</li>
          </ul>
          <button className="btn primary" onClick={() => startCheckout(STUDIO_PRICE_ID)}>
            Start Studio
          </button>
        </article>

        <article className="card">
          <h2>Agency</h2>
          <p className="price">$149.99</p>
          <ul>
            <li>Multiple brands</li>
            <li>Team seats</li>
          </ul>
          <button className="btn outline" onClick={() => startCheckout(AGENCY_PRICE_ID)}>
            Start Agency
          </button>
        </article>
      </section>
    </main>
  );
}
