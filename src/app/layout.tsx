export const metadata = {
  title: "Directr",
  description: "Upload raw video → get a captioned, social-ready clip back.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full text-gray-200 antialiased">
        <div className="mx-auto max-w-6xl px-4 py-8">
          <header className="mb-8 flex items-center justify-between">
            <a href="/" className="text-xl font-bold">Directr</a>
            <nav className="space-x-6 text-sm">
              <a href="/app" className="hover:text-white">Create</a>
              <a href="/campaigns" className="hover:text-white">Campaigns</a>
              <a href="/analytics" className="hover:text-white">Analytics</a>
              <a href="/settings" className="hover:text-white">Settings</a>
            </nav>
          </header>
          {children}
          <footer className="mt-16 border-t border-white/10 pt-6 text-xs text-gray-400">
            © {new Date().getFullYear()} Directr — <a href="/privacy" className="underline">Privacy</a> · <a href="/terms" className="underline">Terms</a>
          </footer>
        </div>
        <link rel="stylesheet" href="/src/app/globals.css" />
      </body>
    </html>
  );
}
