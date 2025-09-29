// src/app/layout.tsx
import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "directr",
  description: "Upload a video → get a captioned, social-ready clip back.",
  metadataBase: new URL("https://directr-beta.vercel.app"),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="site">
        {/* Top nav */}
        <header className="nav">
          <div className="nav__inner">
            <Link href="/app" className="logo">
              directr<span className="dot">.</span>
            </Link>
            <nav className="menu">
              <Link href="/app">Create</Link>
              <Link href="/campaigns">Campaigns</Link>
              <Link href="/analytics">Analytics</Link>
              <Link href="/settings">Settings</Link>
              <Link href="/signup" className="link--muted">Create account</Link>
              <Link href="/login" className="link--muted">Sign in</Link>
            </nav>
          </div>
        </header>

        {/* Page */}
        <main className="page">{children}</main>

        {/* Footer */}
        <footer className="footer">
          <div className="footer__inner">
            <span>© 2025 directr</span>
            <span className="spacer">—</span>
            <Link href="/privacy">Privacy</Link>
            <span>·</span>
            <Link href="/terms">Terms</Link>
          </div>
        </footer>
      </body>
    </html>
  );
}
