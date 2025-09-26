// src/app/layout.tsx
import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "directr",
  description: "Upload a video → get a captioned, social-ready clip back.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-dvh bg-neutral-950 text-white">
        {/* ---- TOP NAV (the only header) ---- */}
        <header className="sticky top-0 z-40 border-b border-white/10 bg-neutral-950/80 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
            <Link
              href="/app"
              className="font-semibold tracking-tight text-white"
              aria-label="directr home"
            >
              <span className="select-none">directr.</span>
            </Link>

            <nav className="flex items-center gap-6 text-sm text-white/70">
              <Link href="/app" className="hover:text-white">
                Create
              </Link>
              <Link href="/campaigns" className="hover:text-white">
                Campaigns
              </Link>
              <Link href="/analytics" className="hover:text-white">
                Analytics
              </Link>
              <Link href="/settings" className="hover:text-white">
                Settings
              </Link>
            </nav>
          </div>
        </header>

        {/* ---- PAGE CONTENT ---- */}
        <main className="mx-auto max-w-6xl px-5 py-8">{children}</main>

        {/* ---- FOOTER (single) ---- */}
        <footer className="mt-16 border-t border-white/10">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-6 text-xs text-white/50">
            <span>© {new Date().getFullYear()} directr</span>
            <div className="flex items-center gap-4">
              <Link href="/privacy" className="hover:text-white/80">
                Privacy
              </Link>
              <span>·</span>
              <Link href="/terms" className="hover:text-white/80">
                Terms
              </Link>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
