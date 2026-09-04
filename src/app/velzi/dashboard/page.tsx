import type { Metadata } from "next";
import DashboardClient from "../_components/DashboardClient";
import { computeMetrics } from "@/lib/velzi/metrics";
import { getStoreData } from "@/lib/velzi/store";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Sales, traffic, funnel and unit economics for the velzi store.",
};

// Store data is live whenever credentials allow it, so never cache the page.
export const dynamic = "force-dynamic";

export default async function VelziDashboardPage() {
  const data = await getStoreData();
  const metrics = computeMetrics(data);

  return <DashboardClient data={data} metrics={metrics} />;
}
