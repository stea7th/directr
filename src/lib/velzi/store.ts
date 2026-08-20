// Store data loader.
//
// With Admin API credentials configured the catalog, orders and customers are
// fetched live and the sales timeseries is rebuilt from real orders. Without
// them the dashboard renders the captured snapshot in ./snapshot.ts.
//
// Note on traffic: Shopify's Admin API does not expose session analytics
// (sessions / cart adds / checkouts come from the Analytics reports), so those
// fields always carry the captured values. The UI labels that card accordingly.

import { SNAPSHOT } from "./snapshot";
import type {
  Customer,
  DayPoint,
  FinancialStatus,
  FulfillmentStatus,
  Order,
  Product,
  ShopInfo,
  StoreData,
} from "./types";

const API_VERSION = "2025-07";
const WINDOW_DAYS = 31;

function credentials() {
  const domain = process.env.SHOPIFY_STORE_DOMAIN;
  const token = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
  return domain && token ? { domain, token } : null;
}

async function adminQuery<T>(
  creds: { domain: string; token: string },
  query: string,
): Promise<T> {
  const res = await fetch(`https://${creds.domain}/admin/api/${API_VERSION}/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": creds.token,
    },
    body: JSON.stringify({ query }),
    // Store data changes constantly; let the dashboard route control caching.
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Shopify Admin API responded ${res.status}`);
  }

  const payload = (await res.json()) as { data?: T; errors?: unknown };
  if (payload.errors || !payload.data) {
    throw new Error(`Shopify Admin API error: ${JSON.stringify(payload.errors)}`);
  }

  return payload.data;
}

const STORE_QUERY = `{
  shop {
    name
    primaryDomain { host }
    myshopifyDomain
    email
    plan { displayName }
    currencyCode
    ianaTimezone
    billingAddress { country }
  }
  products(first: 50, sortKey: CREATED_AT, reverse: true) {
    edges { node {
      id title handle status createdAt description totalInventory
      featuredMedia { preview { image { url } } }
      priceRangeV2 { minVariantPrice { amount } }
    } }
  }
  orders(first: 100, sortKey: CREATED_AT, reverse: true) {
    edges { node {
      id name createdAt displayFinancialStatus displayFulfillmentStatus
      customer { firstName lastName }
      currentTotalPriceSet { shopMoney { amount currencyCode } }
      lineItems(first: 1) { edges { node { id } } }
    } }
  }
  customers(first: 50, sortKey: CREATED_AT, reverse: true) {
    edges { node {
      id firstName lastName email numberOfOrders createdAt
      amountSpent { amount }
    } }
  }
}`;

type Edges<T> = { edges: { node: T }[] };
type RawStore = {
  shop: {
    name: string;
    primaryDomain: { host: string } | null;
    myshopifyDomain: string;
    email: string;
    plan: { displayName: string } | null;
    currencyCode: string;
    ianaTimezone: string;
    billingAddress: { country: string | null } | null;
  };
  products: Edges<{
    id: string;
    title: string;
    handle: string;
    status: string;
    createdAt: string;
    description: string | null;
    totalInventory: number | null;
    featuredMedia: { preview: { image: { url: string } | null } | null } | null;
    priceRangeV2: { minVariantPrice: { amount: string } };
  }>;
  orders: Edges<{
    id: string;
    name: string;
    createdAt: string;
    displayFinancialStatus: string | null;
    displayFulfillmentStatus: string | null;
    customer: { firstName: string | null; lastName: string | null } | null;
    currentTotalPriceSet: { shopMoney: { amount: string; currencyCode: string } };
    lineItems: Edges<{ id: string }>;
  }>;
  customers: Edges<{
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
    numberOfOrders: string;
    createdAt: string;
    amountSpent: { amount: string };
  }>;
};

const nodes = <T,>(collection: Edges<T>) => collection.edges.map((edge) => edge.node);
const num = (value: string | null | undefined) => Number(value ?? 0) || 0;

function mapShop(shop: RawStore["shop"]): ShopInfo {
  return {
    name: shop.name,
    domain: shop.primaryDomain?.host ?? shop.myshopifyDomain,
    myshopifyDomain: shop.myshopifyDomain,
    email: shop.email,
    planName: shop.plan?.displayName ?? "—",
    currencyCode: shop.currencyCode,
    timezone: shop.ianaTimezone,
    country: shop.billingAddress?.country ?? "—",
  };
}

function mapProducts(raw: RawStore["products"]): Product[] {
  return nodes(raw).map((p) => ({
    id: p.id,
    title: p.title,
    handle: p.handle,
    status: p.status,
    price: num(p.priceRangeV2.minVariantPrice.amount),
    inventory: p.totalInventory ?? 0,
    imageUrl: p.featuredMedia?.preview?.image?.url ?? null,
    description: p.description ?? "",
    createdAt: p.createdAt,
  }));
}

function mapOrders(raw: RawStore["orders"]): Order[] {
  return nodes(raw).map((o) => {
    const name = [o.customer?.firstName, o.customer?.lastName].filter(Boolean).join(" ");
    return {
      id: o.id,
      name: o.name,
      createdAt: o.createdAt,
      customerName: name || "Guest",
      totalPrice: num(o.currentTotalPriceSet.shopMoney.amount),
      currencyCode: o.currentTotalPriceSet.shopMoney.currencyCode,
      financialStatus: (o.displayFinancialStatus ?? "PENDING") as FinancialStatus,
      fulfillmentStatus: (o.displayFulfillmentStatus ?? "UNFULFILLED") as FulfillmentStatus,
      lineItemCount: o.lineItems.edges.length,
    };
  });
}

function mapCustomers(raw: RawStore["customers"]): Customer[] {
  return nodes(raw).map((c) => ({
    id: c.id,
    firstName: c.firstName,
    lastName: c.lastName,
    email: c.email ?? "—",
    ordersCount: num(c.numberOfOrders),
    totalSpent: num(c.amountSpent.amount),
    createdAt: c.createdAt,
  }));
}

/**
 * Rebuild the daily sales series from live orders, keeping the captured
 * traffic figures for each day (the Admin API has no session data).
 */
function seriesFromOrders(orders: Order[], timezone: string): DayPoint[] {
  const dayKey = (iso: string) => {
    try {
      // en-CA renders as YYYY-MM-DD, which is what the series keys on.
      return new Date(iso).toLocaleDateString("en-CA", { timeZone: timezone });
    } catch {
      return iso.slice(0, 10);
    }
  };

  const byDay = new Map<string, { orders: number; gross: number; net: number }>();
  for (const order of orders) {
    const key = dayKey(order.createdAt);
    const bucket = byDay.get(key) ?? { orders: 0, gross: 0, net: 0 };
    const refunded =
      order.financialStatus === "REFUNDED" || order.financialStatus === "PARTIALLY_REFUNDED";
    bucket.orders += 1;
    bucket.gross += order.totalPrice;
    bucket.net += refunded ? 0 : order.totalPrice;
    byDay.set(key, bucket);
  }

  const traffic = new Map(SNAPSHOT.series.map((point) => [point.day, point]));
  const today = new Date();
  const out: DayPoint[] = [];

  for (let i = WINDOW_DAYS - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setUTCDate(d.getUTCDate() - i);
    const day = d.toISOString().slice(0, 10);
    const sales = byDay.get(day);
    const captured = traffic.get(day);
    out.push({
      day,
      orders: sales?.orders ?? 0,
      grossSales: sales?.gross ?? 0,
      netSales: sales?.net ?? 0,
      sessions: captured?.sessions ?? 0,
      cartAdds: captured?.cartAdds ?? 0,
      reachedCheckout: captured?.reachedCheckout ?? 0,
      completedCheckout: captured?.completedCheckout ?? 0,
    });
  }

  return out;
}

/** Live store data when credentials allow it, otherwise the captured snapshot. */
export async function getStoreData(): Promise<StoreData> {
  const creds = credentials();
  if (!creds) return SNAPSHOT;

  try {
    const raw = await adminQuery<RawStore>(creds, STORE_QUERY);
    const shop = mapShop(raw.shop);
    const orders = mapOrders(raw.orders);

    return {
      shop,
      products: mapProducts(raw.products),
      orders,
      customers: mapCustomers(raw.customers),
      series: seriesFromOrders(orders, shop.timezone),
      source: "live",
      capturedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error("[velzi] live Shopify fetch failed, using snapshot:", error);
    return SNAPSHOT;
  }
}
