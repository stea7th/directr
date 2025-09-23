import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";
import { Inter } from "next/font/google";

export const metadata: Metadata = {
  title: "Directr",
  description: "Your AI Content Director",
};

const inter = Inter({ subsets: ["latin"], display: "swap" });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className={`min-h-dvh bg-neutral-900 text-neutral-100 antialiased ${inter.className}`}>
        <header className="border-b border-neutral-800">
          <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
            <Link href="/" className="text-xl font-semibold tracking-tight">Directr</Link>
            <nav className="flex gap-6 text-sm">
              <Link href="/app" className="hover:text-white text-neutral-300">Create</Link>
              <Link href="/campaigns" className="hover:text-white text-neutral-300">Campaigns</Link>
              <Link href="/analytics" className="hover:text-white text-neutral-300">Analytics</Link>
              <Link href="/settings" className="hover:text-white text-neutral-300">Settings</Link>
            </nav>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>

        <footer className="mt-12 border-t border-neutral-800">
          <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between text-xs text-neutral-400">
            <span>© {new Date().getFullYear()} Directr</span>
            <div className="flex gap-4">
              <Link href="/privacy" className="hover:text-neutral-200">Privacy</Link>
              <Link href="/terms" className="hover:text-neutral-200">Terms</Link>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
