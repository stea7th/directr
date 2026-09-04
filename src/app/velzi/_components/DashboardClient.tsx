"use client";

import { useState } from "react";
import { compactMoney, money, percent, shortDate } from "@/lib/velzi/metrics";
import type { Metrics } from "@/lib/velzi/metrics";
import { buildInsights, toneColor } from "@/lib/velzi/insights";
import type { StoreData } from "@/lib/velzi/types";
import Funnel from "./Funnel";
import ProductImage from "./ProductImage";
import StatTile from "./StatTile";
import TimeChart from "./TimeChart";
import Tools from "./Tools";
import { Reveal } from "./motion";
import {
  IconAlert,
  IconBox,
  IconCart,
  IconCheck,
  IconGauge,
  IconPulse,
  IconRevenue,
  IconUsers,
} from "./Icons";

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "traffic", label: "Traffic & funnel" },
  { id: "orders", label: "Orders & customers" },
  { id: "tools", label: "Tool bench" },
] as const;

type TabId = (typeof TABS)[number]["id"];

function StatusChip({ status }: { status: string }) {
  const map: Record<string, { cls: string; icon: React.ReactNode }> = {
    PAID: { cls: "good", icon: <IconCheck size={11} /> },
    FULFILLED: { cls: "good", icon: <IconCheck size={11} /> },
    REFUNDED: { cls: "critical", icon: <IconAlert size={11} /> },
    PARTIALLY_REFUNDED: { cls: "serious", icon: <IconAlert size={11} /> },
    UNFULFILLED: { cls: "warning", icon: <IconAlert size={11} /> },
    PENDING: { cls: "muted", icon: <IconAlert size={11} /> },
  };
  const tone = map[status] ?? { cls: "muted", icon: null };
  const label = status.replace(/_/g, " ").toLowerCase();

  return (
    <span className={`v-chip v-chip--${tone.cls}`}>
      {tone.icon}
      {label}
    </span>
  );
}

export default function DashboardClient({
  data,
  metrics,
}: {
  data: StoreData;
  metrics: Metrics;
}) {
  const [tab, setTab] = useState<TabId>("overview");
  const insights = buildInsights(metrics);
  const product = data.products[0];

  // Only the days the store has actually been open carry signal; the flat
  // fortnight before launch would squash every chart.
  const live = data.series.filter((d) => d.sessions > 0 || d.grossSales > 0);
  const chartDays = live.length >= 5 ? live : data.series.slice(-10);

  const revenuePoints = chartDays.map((d) => ({ day: d.day, value: d.grossSales }));
  const sessionPoints = chartDays.map((d) => ({ day: d.day, value: d.sessions }));

  return (
    <div className="v-wrap v-dash">
      <div className="v-dash__head">
        <div>
          <span className="v-eyebrow">
            {data.shop.name} · {data.shop.planName} plan · {data.shop.country}
          </span>
          <h1>Store control room</h1>
          <p>
            {data.shop.domain} · last 30 days · all figures in {data.shop.currencyCode}
          </p>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
          <span className="v-live">
            <span className="v-live__dot" aria-hidden="true" />
            {data.source === "live" ? "Live from Shopify" : `Snapshot · ${shortDate(data.capturedAt)}`}
          </span>
          <a
            className="v-btn"
            href={`https://admin.shopify.com/store/${data.shop.myshopifyDomain.split(".")[0]}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Shopify admin
          </a>
        </div>
      </div>

      <div className="v-tabs" role="tablist" aria-label="Dashboard sections">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            className={`v-tab ${tab === t.id ? "is-active" : ""}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "overview" ? (
        <>
          <div className="v-panelgrid">
            <div className="v-col-12">
              <div className="v-kpis">
                <StatTile
                  label="Gross sales"
                  icon={<IconRevenue size={14} />}
                  value={metrics.grossSales}
                  format={(n) => money(n, data.shop.currencyCode)}
                  note={`${money(metrics.netSales)} net after refunds`}
                  spark={chartDays.map((d) => d.grossSales)}
                  color="var(--series-1)"
                />
                <StatTile
                  label="Orders"
                  icon={<IconCart size={14} />}
                  value={metrics.orderCount}
                  format={(n) => Math.round(n).toString()}
                  note={`${metrics.paidOrders} paid · ${metrics.refundedOrders} refunded`}
                  spark={chartDays.map((d) => d.orders)}
                  color="var(--series-2)"
                />
                <StatTile
                  label="Sessions"
                  icon={<IconPulse size={14} />}
                  value={metrics.sessions}
                  format={(n) => Math.round(n).toLocaleString("en-US")}
                  note={`${money(metrics.revenuePerSession)} revenue per session`}
                  spark={chartDays.map((d) => d.sessions)}
                  color="var(--series-3)"
                />
                <StatTile
                  label="Conversion rate"
                  icon={<IconGauge size={14} />}
                  value={metrics.conversionRate * 100}
                  format={(n) => `${n.toFixed(2)}%`}
                  note={`${metrics.orderCount} orders from ${metrics.sessions.toLocaleString("en-US")} sessions`}
                  color="var(--series-4)"
                />
                <StatTile
                  label="Average order value"
                  icon={<IconRevenue size={14} />}
                  value={metrics.averageOrderValue}
                  format={(n) => money(n, data.shop.currencyCode)}
                  note="Single-product catalogue"
                  color="var(--series-1)"
                />
                <StatTile
                  label="Inventory on hand"
                  icon={<IconBox size={14} />}
                  value={metrics.inventoryUnits}
                  format={(n) => Math.round(n).toLocaleString("en-US")}
                  note={`${compactMoney(metrics.inventoryRetailValue)} at retail`}
                  color="var(--series-3)"
                />
              </div>
            </div>

            <Reveal className="v-col-8">
              <div className="v-block">
                <div className="v-block__head">
                  <h3>Gross sales per day</h3>
                  <span className="v-chip v-chip--muted">
                    {money(metrics.grossSales)} total
                  </span>
                </div>
                <p className="v-block__sub">
                  Since the store opened on {shortDate(chartDays[0]?.day ?? data.series[0].day)}.
                  Hover any day for its figure.
                </p>
                <TimeChart
                  points={revenuePoints}
                  color="var(--series-1)"
                  format={(n) => money(n, data.shop.currencyCode, 0)}
                  label="Gross sales"
                  gradientId="grad-revenue"
                />
              </div>
            </Reveal>

            <Reveal className="v-col-4" delay={90}>
              <div className="v-block" style={{ height: "100%" }}>
                <div className="v-block__head">
                  <h3>What needs attention</h3>
                </div>
                <p className="v-block__sub">Generated from the numbers above.</p>
                <div className="v-notes">
                  {insights.slice(0, 4).map((insight) => (
                    <div
                      className="v-note"
                      key={insight.id}
                      style={{ ["--tone" as string]: toneColor(insight.tone) }}
                    >
                      <span className="v-note__icon">
                        {insight.tone === "good" ? <IconCheck size={15} /> : <IconAlert size={15} />}
                      </span>
                      <div>
                        <h4>{insight.title}</h4>
                        <p>{insight.body}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </>
      ) : null}

      {tab === "traffic" ? (
        <div className="v-panelgrid">
          <Reveal className="v-col-7" delay={0}>
            <div className="v-block">
              <div className="v-block__head">
                <h3>Sessions per day</h3>
                <span className="v-chip v-chip--muted">
                  {metrics.sessions.toLocaleString("en-US")} total
                </span>
              </div>
              <p className="v-block__sub">
                Traffic spiked on launch day and has cooled since — the shape to fix before
                spending more.
              </p>
              <TimeChart
                points={sessionPoints}
                color="var(--series-3)"
                kind="bar"
                format={(n) => Math.round(n).toLocaleString("en-US")}
                label="Sessions"
                gradientId="grad-sessions"
              />
            </div>
          </Reveal>

          <Reveal className="v-col-5" delay={90}>
            <div className="v-block" style={{ height: "100%" }}>
              <div className="v-block__head">
                <h3>Conversion funnel</h3>
              </div>
              <p className="v-block__sub">
                Where the {metrics.sessions.toLocaleString("en-US")} visitors went. Each stage is
                a share of total traffic.
              </p>
              <Funnel
                stages={[
                  { label: "Sessions", value: metrics.funnel.sessions },
                  { label: "Added to cart", value: metrics.funnel.cartAdds },
                  { label: "Reached checkout", value: metrics.funnel.reachedCheckout },
                  { label: "Completed purchase", value: metrics.funnel.completedCheckout },
                ]}
              />
            </div>
          </Reveal>

          <Reveal className="v-col-12" delay={140}>
            <div className="v-block">
              <div className="v-block__head">
                <h3>Every signal, read together</h3>
              </div>
              <p className="v-block__sub">
                The full set of callouts derived from this window.
              </p>
              <div className="v-notes">
                {insights.map((insight) => (
                  <div
                    className="v-note"
                    key={insight.id}
                    style={{ ["--tone" as string]: toneColor(insight.tone) }}
                  >
                    <span className="v-note__icon">
                      {insight.tone === "good" ? <IconCheck size={15} /> : <IconAlert size={15} />}
                    </span>
                    <div>
                      <h4>{insight.title}</h4>
                      <p>{insight.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      ) : null}

      {tab === "orders" ? (
        <div className="v-panelgrid" id="orders">
          <Reveal className="v-col-12">
            <div className="v-block">
              <div className="v-block__head">
                <h3>Recent orders</h3>
                <span className="v-chip v-chip--muted">{data.orders.length} in window</span>
              </div>
              <p className="v-block__sub">
                Newest first. Refunded orders still carry their acquisition cost.
              </p>
              <div className="v-tablewrap">
                <table className="v-table">
                  <thead>
                    <tr>
                      <th>Order</th>
                      <th>Customer</th>
                      <th>Placed</th>
                      <th>Payment</th>
                      <th>Fulfilment</th>
                      <th className="v-num">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.orders.map((order, i) => (
                      <tr key={order.id} style={{ animationDelay: `${i * 55}ms` }}>
                        <td>{order.name}</td>
                        <td>{order.customerName}</td>
                        <td>{shortDate(order.createdAt)}</td>
                        <td>
                          <StatusChip status={order.financialStatus} />
                        </td>
                        <td>
                          <StatusChip status={order.fulfillmentStatus} />
                        </td>
                        <td className="v-num">
                          {money(order.totalPrice, order.currencyCode)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Reveal>

          <Reveal className="v-col-7" delay={80}>
            <div className="v-block">
              <div className="v-block__head">
                <h3>Customers</h3>
                <span className="v-chip v-chip--muted">
                  {metrics.buyingCustomers} of {metrics.customerCount} have ordered
                </span>
              </div>
              <p className="v-block__sub">
                Lifetime spend reflects refunds, so a refunded order shows as {money(0)}.
              </p>
              <div className="v-tablewrap">
                <table className="v-table">
                  <thead>
                    <tr>
                      <th>Customer</th>
                      <th>Email</th>
                      <th className="v-num">Orders</th>
                      <th className="v-num">Spend</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.customers.map((customer, i) => (
                      <tr key={customer.id} style={{ animationDelay: `${i * 55}ms` }}>
                        <td>
                          {[customer.firstName, customer.lastName].filter(Boolean).join(" ") ||
                            "No name on file"}
                        </td>
                        <td>{customer.email}</td>
                        <td className="v-num">{customer.ordersCount}</td>
                        <td className="v-num">{money(customer.totalSpent)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Reveal>

          <Reveal className="v-col-5" delay={140}>
            <div className="v-block" style={{ height: "100%" }}>
              <div className="v-block__head">
                <h3>Catalogue</h3>
              </div>
              <p className="v-block__sub">Everything currently published.</p>
              {product ? (
                <div style={{ display: "grid", gap: 14 }}>
                  <ProductImage
                    src={product.imageUrl}
                    alt={product.title}
                    style={{
                      width: "100%",
                      aspectRatio: "1",
                      objectFit: "contain",
                      borderRadius: 12,
                      border: "1px solid var(--v-border)",
                      background: "rgba(255,255,255,.03)",
                    }}
                  />
                  <div>
                    <h4 style={{ margin: "0 0 8px", fontSize: 15 }}>{product.title}</h4>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      <StatusChip status={product.status === "ACTIVE" ? "PAID" : "PENDING"} />
                      <span className="v-chip v-chip--muted">
                        {money(product.price)} · {product.inventory.toLocaleString("en-US")} in stock
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="v-block__sub">No products published yet.</p>
              )}
            </div>
          </Reveal>
        </div>
      ) : null}

      {tab === "tools" ? (
        <>
          <Reveal>
            <div className="v-block" style={{ marginTop: 22 }}>
              <div className="v-block__head">
                <h3>Tool bench</h3>
                <span className="v-chip v-chip--muted">
                  <IconUsers size={11} /> seeded with your live figures
                </span>
              </div>
              <p className="v-block__sub" style={{ marginBottom: 0 }}>
                Six calculators wired to each other. Change the price or product cost in the
                first one and every other tool re-reads it. Nothing here is saved — it is a
                scratchpad for decisions.
              </p>
            </div>
          </Reveal>
          <Tools metrics={metrics} price={product?.price ?? 0} />
        </>
      ) : null}
    </div>
  );
}
