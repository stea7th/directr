// Shared shapes for the velzi storefront + dashboard.

export type ShopInfo = {
  name: string;
  domain: string;
  myshopifyDomain: string;
  email: string;
  planName: string;
  currencyCode: string;
  timezone: string;
  country: string;
};

export type Product = {
  id: string;
  title: string;
  handle: string;
  status: string;
  price: number;
  inventory: number;
  imageUrl: string | null;
  description: string;
  createdAt: string;
};

export type FinancialStatus = "PAID" | "REFUNDED" | "PENDING" | "PARTIALLY_REFUNDED" | "VOIDED";
export type FulfillmentStatus = "FULFILLED" | "UNFULFILLED" | "PARTIAL";

export type Order = {
  id: string;
  name: string;
  createdAt: string;
  customerName: string;
  totalPrice: number;
  currencyCode: string;
  financialStatus: FinancialStatus;
  fulfillmentStatus: FulfillmentStatus;
  lineItemCount: number;
};

export type Customer = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  ordersCount: number;
  totalSpent: number;
  createdAt: string;
};

/** One day of the sales + traffic timeseries. */
export type DayPoint = {
  day: string;
  orders: number;
  grossSales: number;
  netSales: number;
  sessions: number;
  cartAdds: number;
  reachedCheckout: number;
  completedCheckout: number;
};

export type StoreData = {
  shop: ShopInfo;
  products: Product[];
  orders: Order[];
  customers: Customer[];
  series: DayPoint[];
  /** Where the numbers came from, so the UI can say so honestly. */
  source: "live" | "snapshot";
  capturedAt: string;
};
