import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Directr",
  description: "Upload raw video → get a captioned, social-ready clip back.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-dvh antialiased">
        <header className="border-b border-white/10 bg-black/60 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
            <a href="/" className="text-lg font-semibold">Directr</a>
            <nav className="flex items-center gap-6 text-sm text-gray-300">
              <a href="/app" className="hover:text-white">Create</a>
              <a href="/campaigns" className="hover:text-white">Campaigns</a>
              <a href="/analytics" className="hover:text-white">Analytics</a>
              <a href="/settings" className="hover:text-white">Settings</a>
            </nav>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-8">
          {children}
        </main>

        <footer className="mx-auto max-w-6xl px-4 py-8 text-xs text-gray-400 border-t border-white/10">
          © {new Date().getFullYear()} Directr — <a className="underline" href="/privacy">Privacy</a> · <a className="underline" href="/terms">Terms</a>
        </footer>
      </body>
    </html>
  );
}
