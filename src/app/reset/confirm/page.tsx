import { Suspense } from 'react';
import ConfirmClient from './ConfirmClient';

export const dynamic = 'force-dynamic';

export default function ConfirmPage() {
  return (
    <Suspense fallback={<div style={{padding:20}}>Loading…</div>}>
      <ConfirmClient />
    </Suspense>
  );
}
