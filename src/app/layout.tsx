import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata = {
  title: "directr",
  description: "Upload a video → get a captioned, social-ready clip back.",
  icons: {
    icon: "/favicon.png?v=3" // lives in /public
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="root">
        <header className="site-header">
          <div className="container nav">
            <Link href="/app" className="logo">directr<span className="accent">.</span></Link>
            <nav className="nav-links">
              <Link href="/app">Create</Link>
              <Link href="/campaigns">Campaigns</Link>
              <Link href="/analytics">Analytics</Link>
              <Link href="/settings">Settings</Link>
            </nav>
          </div>
        </header>

        <main className="container main">{children}</main>

        <footer className="site-footer">
          <div className="container foot">
            <span>© {new Date().getFullYear()} directr</span>
            <div className="foot-links">
              <Link href="/privacy">Privacy</Link>
              <span>·</span>
              <Link href="/terms">Terms</Link>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
