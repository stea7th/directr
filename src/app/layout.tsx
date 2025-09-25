// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Directr",
  description: "Upload a video → get a captioned, social-ready clip back.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-neutral-950 text-neutral-200">
        <header className="border-b border-white/10 bg-neutral-950/70 backdrop-blur supports-[backdrop-filter]:bg-neutral-950/50">
          <div className="mx-auto max-w-6xl px-4">
            <div className="flex h-14 items-center justify-between">
              <div className="font-bold text-lg tracking-tight">directr<span className="text-sky-400">.</span></div>
              <nav className="hidden gap-6 text-sm md:flex">
                <a href="/app" className="text-neutral-300 hover:text-white">Create</a>
                <a href="/campaigns" className="text-neutral-300 hover:text-white">Campaigns</a>
                <a href="/analytics" className="text-neutral-300 hover:text-white">Analytics</a>
                <a href="/settings" className="text-neutral-300 hover:text-white">Settings</a>
              </nav>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-10">{children}</main>

        <footer className="mt-12 border-t border-white/10">
          <div className="mx-auto max-w-6xl px-4 py-6 text-xs text-neutral-400">
            © {new Date().getFullYear()} Directr — <a href="/privacy" className="underline hover:text-neutral-200">Privacy</a> · <a href="/terms" className="underline hover:text-neutral-200">Terms</a>
          </div>
        </footer>
      </body>
    </html>
  );
}
