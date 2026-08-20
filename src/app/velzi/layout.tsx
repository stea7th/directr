import type { Metadata } from "next";
import "./velzi.css";
import VelziNav from "./_components/VelziNav";
import { getStoreData } from "@/lib/velzi/store";

export const metadata: Metadata = {
  title: {
    // `absolute` stops the directr root layout's "%s | Directr" template
    // from wrapping velzi pages.
    absolute: "velzi — 360° oral care",
    template: "%s | velzi",
  },
  description:
    "velzi builds the VELZI 360 bidirectional electric toothbrush — a cylindrical brush head that wraps the tooth instead of skating across it.",
};

export default async function VelziLayout({ children }: { children: React.ReactNode }) {
  const data = await getStoreData();
  const storeName = data.shop.myshopifyDomain.split(".")[0];

  return (
    <div className="velzi">
      <div className="velzi__aurora" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <div className="velzi__grid" aria-hidden="true" />

      <div className="velzi__shell">
        <VelziNav
          adminUrl={`https://admin.shopify.com/store/${storeName}`}
          storeUrl={`https://${data.shop.domain}`}
        />
        {children}
      </div>
    </div>
  );
}
