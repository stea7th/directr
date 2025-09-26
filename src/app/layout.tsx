import './globals.css';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'directr',
  description: 'Upload a video → get a captioned, social-ready clip back.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-screen bg-neutral-950 text-white">
        {/* HEADER (only here) */}
        <header className="sticky top-0 z-10 border-b border-white/10 bg-neutral-950/80 backdrop-blur">
          <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
            <Link href="/app" className="font-semibold tracking-tight text-white text-lg">
              directr<span className="text-sky-400">.</span>
            </Link>
            <nav className="flex items-center gap-6 text-sm">
              <Link href="/app" className="text-white/80 hover:text-white">Create</Link>
              <Link href="/campaigns" className="text-white/60 hover:text-white">Campaigns</Link>
              <Link href="/analytics" className="text-white/60 hover:text-white">Analytics</Link>
              <Link href="/settings" className="text-white/60 hover:text-white">Settings</Link>
            </nav>
          </div>
        </header>

        {/* PAGE CONTENT */}
        {children}

        {/* FOOTER (only here) */}
        <footer className="mx-auto max-w-6xl px-4 py-10 text-xs text-white/50">
          © 2025 directr —{' '}
          <Link href="/privacy" className="hover:text-white">Privacy</Link> ·{' '}
          <Link href="/terms" className="hover:text-white">Terms</Link>
        </footer>
      </body>
    </html>
  );
}
