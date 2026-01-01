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
    <main style={styles.root}>
      <header style={styles.hero}>
        <h1 style={styles.title}>Choose your plan</h1>
        <p style={styles.subtitle}>Simple pricing. Scale when ready.</p>
      </header>

      <section style={styles.grid}>
        <Plan
          name="Starter"
          price="$0"
          desc="Try Directr for free"
          features={[
            "5 generations / month",
            "Basic captions",
            "Watermarked exports",
          ]}
          cta="Get started"
          onClick={() => (window.location.href = "/login")}
          muted
        />

        <Plan
          name="Creator"
          price="$19.99"
          desc="For solo creators"
          features={[
            "More generations",
            "Clean exports",
            "Single workspace",
          ]}
          cta="Start Creator"
          onClick={() => startCheckout(CREATOR_PRICE_ID)}
        />

        <Plan
          name="Studio"
          price="$49.99"
          desc="Most popular"
          features={[
            "High quota",
            "Multi-platform output",
            "Priority processing",
          ]}
          cta="Start Studio"
          onClick={() => startCheckout(STUDIO_PRICE_ID)}
          highlight
        />

        <Plan
          name="Agency"
          price="$149.99"
          desc="For teams"
          features={[
            "Large quota",
            "Team access",
            "Priority support",
          ]}
          cta="Start Agency"
          onClick={() => startCheckout(AGENCY_PRICE_ID)}
        />
      </section>

      <p style={styles.footer}>
        Just testing?{" "}
        <Link href="/login" style={styles.link}>
          Start free and upgrade later
        </Link>
      </p>
    </main>
  );
}

function Plan({
  name,
  price,
  desc,
  features,
  cta,
  onClick,
  highlight,
  muted,
}: any) {
  return (
    <div
      style={{
        ...styles.card,
        ...(highlight ? styles.cardHighlight : {}),
        ...(muted ? styles.cardMuted : {}),
      }}
    >
      <h2>{name}</h2>
      <p style={{ opacity: 0.7 }}>{desc}</p>
      <div style={styles.price}>{price}</div>

      <ul style={styles.list}>
        {features.map((f: string) => (
          <li key={f}>• {f}</li>
        ))}
      </ul>

      <button style={styles.button} onClick={onClick}>
        {cta}
      </button>
    </div>
  );
}

/* ---------- STYLES (SAFE) ---------- */

const styles: any = {
  root: {
    minHeight: "100vh",
    padding: "80px 24px",
    background: "#050506",
    color: "#fff",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  hero: {
    textAlign: "center",
    marginBottom: 48,
  },
  title: {
    fontSize: 36,
    fontWeight: 600,
    marginBottom: 8,
  },
  subtitle: {
    opacity: 0.6,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: 20,
    width: "100%",
    maxWidth: 1100,
  },
  card: {
    background: "#0b0d12",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 20,
    padding: 24,
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  cardHighlight: {
    borderColor: "#9cc4ff",
    boxShadow: "0 0 40px rgba(120,170,255,.25)",
  },
  cardMuted: {
    opacity: 0.85,
  },
  price: {
    fontSize: 28,
    fontWeight: 600,
  },
  list: {
    listStyle: "none",
    padding: 0,
    opacity: 0.8,
    fontSize: 13,
  },
  button: {
    marginTop: "auto",
    padding: "10px 16px",
    borderRadius: 999,
    border: "1px solid #9cc4ff",
    background: "#141922",
    color: "#fff",
    cursor: "pointer",
  },
  footer: {
    marginTop: 40,
    opacity: 0.6,
    fontSize: 13,
  },
  link: {
    color: "#9cc4ff",
    textDecoration: "underline",
  },
};
