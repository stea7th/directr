import { Suspense } from 'react';
import ConfirmClient from './ConfirmClient';

// Ensure this page is rendered dynamically (no prerender) since it depends on URL params.
export const dynamic = 'force-dynamic';

function Fallback() {
  return (
    <div style={{ minHeight: '60vh', display: 'grid', placeItems: 'center', color: '#9aa3af' }}>
      Validating your link…
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<Fallback />}>
      {/* Client component that uses useSearchParams */}
      <ConfirmClient />
    </Suspense>
  );
}
