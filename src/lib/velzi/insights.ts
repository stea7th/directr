// Turns metrics into plain-language callouts. Thresholds live here so the
// dashboard never hardcodes a claim about the store.

import { money, percent } from "./metrics";
import type { Metrics } from "./metrics";

export type Tone = "good" | "warning" | "serious" | "critical";

export type Insight = {
  id: string;
  tone: Tone;
  title: string;
  body: string;
};

const TONE_VAR: Record<Tone, string> = {
  good: "var(--st-good)",
  warning: "var(--st-warning)",
  serious: "var(--st-serious)",
  critical: "var(--st-critical)",
};

export const toneColor = (tone: Tone) => TONE_VAR[tone];

export function buildInsights(m: Metrics): Insight[] {
  const out: Insight[] = [];

  // Refunds — the loudest signal when half the orders come back.
  if (m.refundedOrders > 0) {
    const severe = m.refundRate >= 0.3;
    out.push({
      id: "refunds",
      tone: severe ? "critical" : "serious",
      title: `${percent(m.refundRate, 0)} of orders were refunded`,
      body: `${m.refundedOrders} of ${m.paidOrders + m.refundedOrders} orders came back, handing ${money(m.refundedAmount)} of revenue with it. The ad spend that bought those orders does not come back — at this rate you are paying full acquisition cost for roughly half the sales you keep.`,
    });
  }

  // Checkout abandonment.
  const { reachedCheckout, completedCheckout, cartAdds, sessions } = m.funnel;
  if (reachedCheckout > 0) {
    const abandonRate = 1 - completedCheckout / reachedCheckout;
    if (abandonRate >= 0.5) {
      out.push({
        id: "checkout",
        tone: abandonRate >= 0.75 ? "critical" : "serious",
        title: `${percent(abandonRate, 0)} of checkouts are abandoned`,
        body: `${reachedCheckout} shoppers reached checkout and ${completedCheckout} finished. People this far down the funnel already want the product — shipping cost shown late, a slow payment step, or missing express payment options are the usual culprits.`,
      });
    }
  }

  // Traffic that never reaches a cart.
  if (sessions > 0 && cartAdds >= 0) {
    const addRate = cartAdds / sessions;
    if (addRate < 0.08) {
      out.push({
        id: "addtocart",
        tone: "warning",
        title: `Only ${percent(addRate, 1)} of visitors add to cart`,
        body: `${sessions.toLocaleString("en-US")} sessions produced ${cartAdds} cart adds. That gap is a product-page problem, not a traffic problem — the visitors are arriving and leaving before they are convinced.`,
      });
    }
  }

  // Conversion rate against a typical DTC band.
  if (m.sessions > 0) {
    if (m.conversionRate < 0.01) {
      out.push({
        id: "cvr",
        tone: "warning",
        title: `Conversion rate is ${percent(m.conversionRate, 2)}`,
        body: `Most direct-to-consumer stores land between 1% and 3%. At ${m.sessions.toLocaleString("en-US")} sessions you would expect roughly ${Math.round(m.sessions * 0.015)} orders at the middle of that band, against ${m.orderCount} actual.`,
      });
    } else {
      out.push({
        id: "cvr",
        tone: "good",
        title: `Conversion rate is ${percent(m.conversionRate, 2)}`,
        body: `That sits inside the healthy 1–3% band for direct-to-consumer. Revenue per session is ${money(m.revenuePerSession)}, which is the number to watch as you scale spend.`,
      });
    }
  }

  // Unfulfilled backlog.
  if (m.unfulfilledOrders > 0) {
    out.push({
      id: "fulfilment",
      tone: m.unfulfilledOrders >= 3 ? "serious" : "warning",
      title: `${m.unfulfilledOrders} order${m.unfulfilledOrders === 1 ? "" : "s"} still unfulfilled`,
      body: `Unshipped orders are the fastest route to more refunds and chargebacks. Clearing the backlog is the cheapest revenue protection available to you right now.`,
    });
  }

  // Inventory versus sell-through.
  if (m.inventoryRunwayDays !== null && m.inventoryRunwayDays > 365) {
    out.push({
      id: "inventory",
      tone: "warning",
      title: `${Math.round(m.inventoryRunwayDays / 365)}+ years of stock on hand`,
      body: `${m.inventoryUnits.toLocaleString("en-US")} units at ${m.dailySellRate.toFixed(1)} orders a day is ${money(m.inventoryRetailValue, "USD", 0)} of retail value sitting still. Demand, not supply, is the constraint — the stock is there the moment traffic converts.`,
    });
  }

  return out;
}
