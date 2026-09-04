// Real velzi store data, captured from the Shopify Admin API on 2026-08-20.
// Used verbatim when live Admin API credentials are not configured, so the
// dashboard always renders truthful numbers rather than invented ones.

import type { Customer, DayPoint, Order, Product, ShopInfo, StoreData } from "./types";

export const CAPTURED_AT = "2026-08-20T12:38:00Z";

export const SHOP: ShopInfo = {
  name: "velzi",
  domain: "tryvelzi.com",
  myshopifyDomain: "fhx138-s0.myshopify.com",
  email: "wesleysteben@gmail.com",
  planName: "Basic",
  currencyCode: "USD",
  timezone: "MST",
  country: "United States",
};

export const PRODUCTS: Product[] = [
  {
    id: "gid://shopify/Product/7656675213409",
    title: "VELZI 360 | 3-in-1 Electric Toothbrush",
    handle: "velzi-3-in-1-toothbrush",
    status: "ACTIVE",
    price: 59.99,
    inventory: 7798,
    imageUrl:
      "https://cdn.shopify.com/s/files/1/0649/4955/1201/files/6897A934-6AB2-4131-9CF6-72C36FD24EE1.webp?v=1786998589",
    description:
      "VELZI 360° Bidirectional Electric Toothbrush. A different approach to everyday brushing — a cylindrical rotating brush head designed to wrap the tooth surface instead of skating across it.",
    createdAt: "2026-08-17T20:29:21Z",
  },
];

export const ORDERS: Order[] = [
  {
    id: "gid://shopify/Order/6780477702241",
    name: "#1004",
    createdAt: "2026-08-20T12:37:53Z",
    customerName: "Abigail Williams",
    totalPrice: 59.99,
    currencyCode: "USD",
    financialStatus: "PAID",
    fulfillmentStatus: "UNFULFILLED",
    lineItemCount: 1,
  },
  {
    id: "gid://shopify/Order/6777347932257",
    name: "#1003",
    createdAt: "2026-08-19T01:24:24Z",
    customerName: "Rachel Jean",
    totalPrice: 59.99,
    currencyCode: "USD",
    financialStatus: "REFUNDED",
    fulfillmentStatus: "UNFULFILLED",
    lineItemCount: 1,
  },
  {
    id: "gid://shopify/Order/6775763239009",
    name: "#1002",
    createdAt: "2026-08-18T18:28:55Z",
    customerName: "Donna Cobb",
    totalPrice: 59.99,
    currencyCode: "USD",
    financialStatus: "REFUNDED",
    fulfillmentStatus: "UNFULFILLED",
    lineItemCount: 1,
  },
  {
    id: "gid://shopify/Order/6774595256417",
    name: "#1001",
    createdAt: "2026-08-18T03:50:42Z",
    customerName: "Tonya Goffney",
    totalPrice: 59.99,
    currencyCode: "USD",
    financialStatus: "PAID",
    fulfillmentStatus: "FULFILLED",
    lineItemCount: 1,
  },
];

export const CUSTOMERS: Customer[] = [
  {
    id: "gid://shopify/Customer/8609088077921",
    firstName: "Abigail",
    lastName: "Williams",
    email: "riffs.chaises86@icloud.com",
    ordersCount: 1,
    totalSpent: 59.99,
    createdAt: "2026-08-20T12:37:52Z",
  },
  {
    id: "gid://shopify/Customer/8597310701665",
    firstName: "Rachel",
    lastName: "Jean",
    email: "cameronbeaufils@yahoo.com",
    ordersCount: 1,
    totalSpent: 0,
    createdAt: "2026-08-19T01:24:23Z",
  },
  {
    id: "gid://shopify/Customer/8595326566497",
    firstName: "Donna",
    lastName: "Cobb",
    email: "rndonnac@ameritech.net",
    ordersCount: 1,
    totalSpent: 0,
    createdAt: "2026-08-18T18:27:31Z",
  },
  {
    id: "gid://shopify/Customer/8594697289825",
    firstName: null,
    lastName: null,
    email: "wesleysteben@gmail.com",
    ordersCount: 0,
    totalSpent: 0,
    createdAt: "2026-08-18T16:00:44Z",
  },
  {
    id: "gid://shopify/Customer/8589953335393",
    firstName: "Tonya",
    lastName: "Goffney",
    email: "tgoff3@me.com",
    ordersCount: 1,
    totalSpent: 59.99,
    createdAt: "2026-08-18T03:50:41Z",
  },
];

/**
 * Days with any activity in the 30-day window, in store-local time (MST).
 * Every other day in the window was flat zero on both reports.
 * [orders, grossSales, netSales, sessions, cartAdds, reachedCheckout, completedCheckout]
 */
const ACTIVE_DAYS: Record<string, [number, number, number, number, number, number, number]> = {
  "2026-08-15": [0, 0, 0, 11, 0, 0, 0],
  "2026-08-16": [0, 0, 0, 2, 0, 0, 0],
  "2026-08-17": [1, 59.99, 59.99, 306, 10, 5, 1],
  "2026-08-18": [2, 119.98, 0, 172, 15, 13, 2],
  "2026-08-19": [0, 0, 0, 68, 1, 4, 0],
  "2026-08-20": [1, 59.99, 59.99, 57, 6, 2, 1],
};

const WINDOW_END = "2026-08-20";
const WINDOW_DAYS = 31;

function buildSeries(): DayPoint[] {
  const end = new Date(`${WINDOW_END}T00:00:00Z`);
  const out: DayPoint[] = [];

  for (let i = WINDOW_DAYS - 1; i >= 0; i--) {
    const d = new Date(end);
    d.setUTCDate(d.getUTCDate() - i);
    const day = d.toISOString().slice(0, 10);
    const [orders, grossSales, netSales, sessions, cartAdds, reachedCheckout, completedCheckout] =
      ACTIVE_DAYS[day] ?? [0, 0, 0, 0, 0, 0, 0];
    out.push({
      day,
      orders,
      grossSales,
      netSales,
      sessions,
      cartAdds,
      reachedCheckout,
      completedCheckout,
    });
  }

  return out;
}

export const SERIES: DayPoint[] = buildSeries();

export const SNAPSHOT: StoreData = {
  shop: SHOP,
  products: PRODUCTS,
  orders: ORDERS,
  customers: CUSTOMERS,
  series: SERIES,
  source: "snapshot",
  capturedAt: CAPTURED_AT,
};
