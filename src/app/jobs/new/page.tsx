import { Suspense } from "react";
import ClientNew from "./ClientNew";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "default-no-store";

export default function Page() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-2xl p-6">
          <h1 className="text-2xl font-semibold">Job #new</h1>
          <p className="mt-2">Creating job…</p>
        </main>
      }
    >
      <ClientNew />
    </Suspense>
  );
}
