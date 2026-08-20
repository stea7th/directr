import Storefront from "./_components/Storefront";
import { computeMetrics } from "@/lib/velzi/metrics";
import { getStoreData } from "@/lib/velzi/store";

export const dynamic = "force-dynamic";

export default async function VelziPage() {
  const data = await getStoreData();
  const metrics = computeMetrics(data);

  return <Storefront shop={data.shop} product={data.products[0]} metrics={metrics} />;
}
