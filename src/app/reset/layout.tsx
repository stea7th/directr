// src/app/reset/layout.tsx
export default function ResetLayout({ children }: { children: React.ReactNode }) {
  // No headers, no auth checks, no redirects — just render reset pages.
  return <>{children}</>;
}
