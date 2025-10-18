// src/app/reset/confirm/page.tsx
export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import ClientConfirm from './ClientConfirm';

export default function ResetConfirmPage() {
  return (
    <Suspense fallback={<div style={{ padding: 24 }}>Loading…</div>}>
      <ClientConfirm />
    </Suspense>
  );
}
