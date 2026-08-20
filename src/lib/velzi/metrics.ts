// Derived store metrics. Everything here is computed from StoreData — no
// constants, so live and snapshot data flow through identical maths.

import type { DayPoint, Order, StoreData } from "./types";

export type Funnel = {
  sessions: number;
  cartAdds: number;
  reachedCheckout: number;
  completedCheckout: number;
};

export type Metrics = {
  grossSales: number;
  netSales: number;
  refundedAmount: number;
  orderCount: number;
  paidOrders: number;
  refundedOrders: number;
  refundRate: number;
  averageOrderValue: number;
  sessions: number;
  conversionRate: number;
  revenuePerSession: number;
  funnel: Funnel;
  inventoryUnits: number;
  inventoryRetailValue: number;
  unfulfilledOrders: number;
  customerCount: number;
  buyingCustomers: number;
  activeDays: number;
  bestDay: DayPoint | null;
  /** Average units sold per day across days with any traffic. */
  dailySellRate: number;
  /** Days of stock left at the current sell rate; null when nothing is selling. */
  inventoryRunwayDays: number | null;
};

const sum = <T,>(rows: T[], pick: (row: T) => number) =>
  rows.reduce((total, row) => total + pick(row), 0);

const ratio = (numerator: number, denominator: number) =>
  denominator > 0 ? numerator / denominator : 0;

function isRefunded(order: Order) {
  return order.financialStatus === "REFUNDED" || order.financialStatus === "PARTIALLY_REFUNDED";
}

export function computeMetrics(data: StoreData): Metrics {
  const { series, orders, customers, products } = data;

  const grossSales = sum(series, (d) => d.grossSales);
  const netSales = sum(series, (d) => d.netSales);
  const orderCount = sum(series, (d) => d.orders);
  const sessions = sum(series, (d) => d.sessions);

  const refundedOrders = orders.filter(isRefunded);
  const paidOrders = orders.filter((o) => o.financialStatus === "PAID");
  const refundedAmount = sum(refundedOrders, (o) => o.totalPrice);

  const funnel: Funnel = {
    sessions,
    cartAdds: sum(series, (d) => d.cartAdds),
    reachedCheckout: sum(series, (d) => d.reachedCheckout),
    completedCheckout: sum(series, (d) => d.completedCheckout),
  };

  const inventoryUnits = sum(products, (p) => p.inventory);
  const inventoryRetailValue = sum(products, (p) => p.inventory * p.price);

  // Only days that saw traffic count as "live" days — the store opened
  // mid-window, so averaging across the full 30 days would understate the rate.
  const liveDays = series.filter((d) => d.sessions > 0);
  const dailySellRate = ratio(
    sum(liveDays, (d) => d.orders),
    liveDays.length,
  );

  const bestDay = series.reduce<DayPoint | null>((best, day) => {
    if (day.grossSales <= 0) return best;
    return best === null || day.grossSales > best.grossSales ? day : best;
  }, null);

  return {
    grossSales,
    netSales,
    refundedAmount,
    orderCount,
    paidOrders: paidOrders.length,
    refundedOrders: refundedOrders.length,
    refundRate: ratio(refundedOrders.length, orders.length),
    averageOrderValue: ratio(grossSales, orderCount),
    sessions,
    conversionRate: ratio(orderCount, sessions),
    revenuePerSession: ratio(grossSales, sessions),
    funnel,
    inventoryUnits,
    inventoryRetailValue,
    unfulfilledOrders: orders.filter((o) => o.fulfillmentStatus === "UNFULFILLED").length,
    customerCount: customers.length,
    buyingCustomers: customers.filter((c) => c.ordersCount > 0).length,
    activeDays: liveDays.length,
    bestDay,
    dailySellRate,
    inventoryRunwayDays: dailySellRate > 0 ? inventoryUnits / dailySellRate : null,
  };
}

// ---- formatting helpers shared by the storefront and dashboard ----

export function money(value: number, currency = "USD", maximumFractionDigits = 2) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits,
  }).format(value);
}

export function compactMoney(value: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    notation: value >= 10_000 ? "compact" : "standard",
    maximumFractionDigits: value >= 10_000 ? 1 : 2,
  }).format(value);
}

export function percent(value: number, digits = 1) {
  return `${(value * 100).toFixed(digits)}%`;
}

export function shortDate(iso: string) {
  return new Date(`${iso.slice(0, 10)}T12:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}
