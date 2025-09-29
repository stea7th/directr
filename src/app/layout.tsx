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
      <body className="app-body">
        {/* Header */}
        <header className="site-header">
          <div className="container header-inner">
            <Link href="/" className="brand">
              directr<span className="accent">.</span>
            </Link>

            <nav className="main-nav">
              <Link href="/app" className="nav-link">Create</Link>
              <Link href="/campaigns" className="nav-link subdued">Campaigns</Link>
              <Link href="/analytics" className="nav-link subdued">Analytics</Link>
              <Link href="/settings" className="nav-link subdued">Settings</Link>
              <Link href="/signup" className="chip">Create account</Link>
              <Link href="/login" className="chip">Sign in</Link>
            </nav>
          </div>
        </header>

        {/* Content */}
        <main className="container main-content">{children}</main>

        {/* Footer */}
        <footer className="site-footer">
          <div className="container footer-inner">
            <span>© 2025 directr</span>
            <span className="footer-links">
              <Link href="/privacy">Privacy</Link>
              <span>·</span>
              <Link href="/terms">Terms</Link>
            </span>
          </div>
        </footer>
      </body>
    </html>
  );
}
