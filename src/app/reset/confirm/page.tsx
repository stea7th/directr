// src/app/reset/confirm/page.tsx
import { Suspense } from "react";
import ConfirmClient from "./ConfirmClient";

export const dynamic = "force-dynamic";   // don’t prerender
export const revalidate = 0;

export default function Page() {
  return (
    <Suspense fallback={<div style={{ padding: 24, color: "#fff" }}>Loading…</div>}>
      <ConfirmClient />
    </Suspense>
  );
}
