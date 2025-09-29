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
            <nav className="flex items-center gap-6 text-sm">
  <Link href="/app" className="text-white/80 hover:text-white">Create</Link>
  <Link href="/campaigns" className="text-white/60 hover:text-white">Campaigns</Link>
  <Link href="/analytics" className="text-white/60 hover:text-white">Analytics</Link>
  <Link href="/settings" className="text-white/60 hover:text-white">Settings</Link>

  <Link
    href="/signup"
    className="rounded-lg border border-white/10 px-3 py-1.5 text-white/90 hover:bg-white/5"
  >
    Create account
  </Link>
  <Link
    href="/login"
    className="rounded-lg border border-white/10 px-3 py-1.5 text-white/90 hover:bg-white/5"
  >
    Sign in
  </Link>
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
