import { Suspense } from 'react';
import ClientConfirm from './ClientConfirm';

// ✅ These must be on a server file, not a client one
export const revalidate = 0;
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default function Page() {
  return (
    <Suspense
      fallback={
        <main style={{ minHeight: '70vh', display: 'grid', placeItems: 'center', color: '#e9eef3' }}>
          <div style={{ opacity: 0.8 }}>Loading…</div>
        </main>
      }
    >
      <ClientConfirm />
    </Suspense>
  );
}
