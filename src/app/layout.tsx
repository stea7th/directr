// src/app/layout.tsx
import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: 'directr',
  description: 'Upload, caption, and publish social-ready clips fast.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-screen bg-neutral-950 text-white antialiased">
        {/* Header */}
        <header className="sticky top-0 z-20 border-b border-white/10 bg-neutral-950/80 backdrop-blur">
          <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
            <Link href="/" className="font-semibold tracking-tight text-white text-lg">
              directr<span className="text-sky-400">.</span>
            </Link>
            <nav className="flex items-center gap-6 text-sm">
              <Link className="text-white/80 hover:text-white" href="/app">Create</Link>
              <Link className="text-white/60 hover:text-white" href="/campaigns">Campaigns</Link>
              <Link className="text-white/60 hover:text-white" href="/analytics">Analytics</Link>
              <Link className="text-white/60 hover:text-white" href="/settings">Settings</Link>
              <Link className="ml-2 rounded-lg border border-white/10 px-3 py-1 text-white/80 hover:text-white hover:ring-1 hover:ring-sky-500/30" href="/signup">
                Create account
              </Link>
              <Link className="rounded-lg border border-white/10 px-3 py-1 text-white/80 hover:text-white hover:ring-1 hover:ring-sky-500/30" href="/login">
                Sign in
              </Link>
            </nav>
          </div>
        </header>

        {/* Page content */}
        <main className="mx-auto max-w-6xl px-4 py-10">
          {children}
        </main>

        {/* Footer */}
        <footer className="mx-auto max-w-6xl px-4 py-10 text-xs text-white/50">
          © 2025 directr — <Link href="/privacy" className="hover:text-white">Privacy</Link> ·{' '}
          <Link href="/terms" className="hover:text-white">Terms</Link>
        </footer>
      </body>
    </html>
  );
}
