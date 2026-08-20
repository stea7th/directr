"use client";

import Link from "next/link";
import { money } from "@/lib/velzi/metrics";
import type { Metrics } from "@/lib/velzi/metrics";
import type { Product, ShopInfo } from "@/lib/velzi/types";
import ProductImage from "./ProductImage";
import { Reveal, useSheen, useTilt } from "./motion";
import { IconBrush, IconGauge, IconPulse, IconShield, IconSpark, IconStore } from "./Icons";

const FEATURES = [
  {
    icon: <IconBrush size={18} />,
    title: "360° cylindrical head",
    body: "The brush head is a rotating cylinder rather than a flat oscillating disc, so it wraps the curve of each tooth instead of skating across the front of it.",
  },
  {
    icon: <IconRotate />,
    title: "Bidirectional drive",
    body: "The cylinder reverses direction as it works, sweeping both along the gum line and away from it rather than pushing debris in one direction.",
  },
  {
    icon: <IconSpark size={18} />,
    title: "Three modes in one handle",
    body: "A single handle covers the three settings most people actually switch between, so there is nothing to swap out mid-routine.",
  },
  {
    icon: <IconShield size={18} />,
    title: "Built for daily use",
    body: "Sealed handle, USB charging, and a head designed to be replaced on a schedule rather than replaced because it wore out early.",
  },
  {
    icon: <IconGauge size={18} />,
    title: "Two-minute cadence",
    body: "The timer follows the routine dentists actually ask for — four quadrants, thirty seconds each, without you counting.",
  },
  {
    icon: <IconStore size={18} />,
    title: "Ships from stock",
    body: "Inventory is on hand and ready today, so an order placed now is not waiting on a production run.",
  },
];

function IconRotate() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 12a9 9 0 1 1-2.6-6.4" />
      <path d="M21 3v5h-5" />
    </svg>
  );
}

function FeatureCard({ feature, delay }: { feature: (typeof FEATURES)[number]; delay: number }) {
  const ref = useSheen<HTMLElement>();
  return (
    <Reveal delay={delay}>
      <article className="v-card" ref={ref}>
        <span className="v-card__icon">{feature.icon}</span>
        <h3>{feature.title}</h3>
        <p>{feature.body}</p>
      </article>
    </Reveal>
  );
}

export default function Storefront({
  shop,
  product,
  metrics,
}: {
  shop: ShopInfo;
  product: Product | undefined;
  metrics: Metrics;
}) {
  const stageRef = useTilt<HTMLDivElement>(8);

  const ticker = [
    `${metrics.sessions.toLocaleString("en-US")} sessions in the last 30 days`,
    `${metrics.orderCount} orders placed`,
    `${metrics.inventoryUnits.toLocaleString("en-US")} units in stock`,
    `Ships from ${shop.country}`,
    `${money(metrics.averageOrderValue)} average order`,
    `${metrics.customerCount} customers on file`,
  ];

  return (
    <>
      <section className="v-hero">
        <div className="v-wrap v-hero__grid">
          <div>
            <Reveal>
              <span className="v-eyebrow">
                <IconPulse size={13} /> {shop.domain}
              </span>
            </Reveal>

            <Reveal delay={70}>
              <h1>
                Brushing that goes <em>around</em> the tooth.
              </h1>
            </Reveal>

            <Reveal delay={140}>
              <p className="v-hero__sub">
                {product?.description ??
                  "A cylindrical rotating brush head designed to wrap the tooth surface instead of skating across it."}
              </p>
            </Reveal>

            <Reveal delay={210}>
              <div className="v-hero__cta">
                <a
                  className="v-btn v-btn--primary"
                  href={`https://${shop.domain}/products/${product?.handle ?? ""}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Buy for {product ? money(product.price) : "—"}
                </a>
                <Link className="v-btn" href="/velzi/dashboard">
                  Open the dashboard
                </Link>
              </div>
            </Reveal>

            <Reveal delay={280}>
              <div className="v-hero__facts">
                <div>
                  <div className="v-fact__value">{product ? money(product.price) : "—"}</div>
                  <div className="v-fact__label">One price, one handle</div>
                </div>
                <div>
                  <div className="v-fact__value">
                    {metrics.inventoryUnits.toLocaleString("en-US")}
                  </div>
                  <div className="v-fact__label">Units ready to ship</div>
                </div>
                <div>
                  <div className="v-fact__value">3-in-1</div>
                  <div className="v-fact__label">Modes in the handle</div>
                </div>
              </div>
            </Reveal>
          </div>

          <Reveal delay={160}>
            <div className="v-stage" ref={stageRef}>
              <span className="v-stage__halo" aria-hidden="true" />
              <span className="v-stage__halo" aria-hidden="true" />
              <span className="v-stage__halo" aria-hidden="true" />
              <ProductImage
                src={product?.imageUrl ?? null}
                alt={product?.title ?? "VELZI 360"}
                style={{ width: "76%", height: "76%" }}
              />
              <span className="v-stage__tag">
                <IconSpark size={13} /> VELZI 360
              </span>
            </div>
          </Reveal>
        </div>
      </section>

      <div className="v-ticker" aria-hidden="true">
        <div className="v-ticker__track">
          {[0, 1].map((copy) => (
            <div key={copy} style={{ display: "flex", gap: 46 }}>
              {ticker.map((item) => (
                <span className="v-ticker__item" key={`${copy}-${item}`}>
                  <b>·</b> {item}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <section className="v-section">
        <div className="v-wrap">
          <div className="v-section__head">
            <Reveal>
              <span className="v-eyebrow">The product</span>
            </Reveal>
            <Reveal delay={60}>
              <h2>Built around one idea, done properly.</h2>
            </Reveal>
            <Reveal delay={120}>
              <p>
                {product?.title ?? "VELZI 360"} is the whole catalogue. One product means every
                decision — the head geometry, the drive, the timer — went into the same handle.
              </p>
            </Reveal>
          </div>

          <div className="v-cards">
            {FEATURES.map((feature, i) => (
              <FeatureCard key={feature.title} feature={feature} delay={i * 70} />
            ))}
          </div>
        </div>
      </section>

      <section className="v-section" style={{ paddingTop: 0 }}>
        <div className="v-wrap">
          <Reveal>
            <div
              className="v-panel"
              style={{
                padding: "clamp(28px, 5vw, 52px)",
                display: "grid",
                gap: 24,
                gridTemplateColumns: "minmax(0, 1fr) auto",
                alignItems: "center",
              }}
            >
              <div>
                <span className="v-eyebrow">Behind the counter</span>
                <h2
                  style={{
                    margin: "14px 0 0",
                    fontSize: "clamp(24px, 3.4vw, 34px)",
                    letterSpacing: "-0.035em",
                    lineHeight: 1.1,
                  }}
                >
                  The same store, from the operator&rsquo;s side.
                </h2>
                <p
                  style={{
                    margin: "14px 0 0",
                    color: "var(--v-muted)",
                    fontSize: 15,
                    lineHeight: 1.65,
                    maxWidth: "56ch",
                  }}
                >
                  Live sales, the conversion funnel, every order and a bench of six calculators
                  for pricing, ad spend, inventory and refunds — all reading from real Shopify
                  data.
                </p>
              </div>
              <Link className="v-btn v-btn--primary" href="/velzi/dashboard">
                Open dashboard
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <footer className="v-footer">
        <div className="v-wrap v-footer__inner">
          <span>
            © {new Date().getFullYear()} {shop.name} · {shop.domain}
          </span>
          <span style={{ display: "flex", gap: 18 }}>
            <a href={`https://${shop.domain}`} target="_blank" rel="noopener noreferrer">
              Live store
            </a>
            <Link href="/velzi/dashboard">Dashboard</Link>
            <a href={`mailto:${shop.email}`}>Contact</a>
          </span>
        </div>
      </footer>
    </>
  );
}
