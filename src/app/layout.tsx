// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Directr",
  description: "Upload → get a captioned, social-ready clip back.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[var(--bg)] text-[var(--fg)]">
        <header className="sticky top-0 z-10 border-b border-white/10 bg-black/60 backdrop-blur">
          <div className="container flex h-14 items-center justify-between">
            <a href="/" className="text-lg font-semibold">Directr</a>
            <nav className="flex items-center gap-6 text-sm text-gray-300">
              <a href="/app" className="hover:text-white">Create</a>
              <a href="/campaigns" className="hover:text-white">Campaigns</a>
              <a href="/analytics" className="hover:text-white">Analytics</a>
              <a href="/settings" className="hover:text-white">Settings</a>
            </nav>
          </div>
        </header>

        <main className="container py-8">{children}</main>

        <footer className="container py-10 text-xs text-gray-400">
          © {new Date().getFullYear()} Directr —{" "}
          <a className="underline" href="/privacy">Privacy</a> •{" "}
          <a className="underline" href="/terms">Terms</a>
        </footer>
      </body>
    </html>
  );
}
