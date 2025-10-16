// src/app/recover/page.tsx
'use client';

import { useEffect } from 'react';

export default function RecoverBridge() {
  useEffect(() => {
    // Preserve everything after the '#'
    const hash = typeof window !== 'undefined' ? window.location.hash : '';
    window.location.replace(`/reset/confirm${hash}`);
  }, []);

  return (
    <main style={{ minHeight: '60vh', display: 'grid', placeItems: 'center' }}>
      <div className="card">Sending you to the reset page…</div>
      <style jsx>{`
        .card {
          padding: 16px 20px;
          border-radius: 12px;
          background: #111418;
          border: 1px solid #1b1d21;
          color: #e9eef3;
        }
      `}</style>
    </main>
  );
}
