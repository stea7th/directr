"use client";

import { Suspense } from "react";
import ConfirmClient from "./ConfirmClient";

export default function Page() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-md p-6">
          <h1 className="text-2xl font-semibold">Confirming…</h1>
          <p className="mt-4">Loading…</p>
        </main>
      }
    >
      <ConfirmClient />
    </Suspense>
  );
}
