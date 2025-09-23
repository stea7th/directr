import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Directr",
  description: "Your AI Content Director",
};

const NavLink = ({ href, label }: { href: string; label: string }) => (
  <Link
    href={href}
    className="text-sm text-neutral-300 hover:text-white px-3 py-2 rounded-md transition-colors"
  >
    {label}
  </Link>
);

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-dvh bg-neutral-950 text-neutral-100 antialiased">
        <header className="border-b border-neutral-900 bg-neutral-950/70 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
            <Link href="/" className="font-semibold tracking-tight text-white">
              Directr
            </Link>
            <nav className="flex items-center gap-1">
              <NavLink href="/app" label="Create" />
              <NavLink href="/campaigns" label="Campaigns" />
              <NavLink href="/analytics" label="Analytics" />
              <NavLink href="/settings" label="Settings" />
            </nav>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>

        <footer className="mt-16 border-t border-neutral-900">
          <div className="mx-auto max-w-6xl px-4 py-6 text-xs text-neutral-400">
            © {new Date().getFullYear()} Directr — <Link href="/privacy" className="hover:text-white">Privacy</Link> ·{" "}
            <Link href="/terms" className="hover:text-white">Terms</Link>
          </div>
        </footer>
      </body>
    </html>
  );
}
