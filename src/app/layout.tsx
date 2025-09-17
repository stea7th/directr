import "./globals.css"
import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Directr",
  description: "AI video assistant",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-gray-950 text-white">
        {/* Navbar */}
        <header className="border-b border-gray-800">
          <nav className="mx-auto max-w-5xl px-4 py-3 flex justify-between items-center">
            <Link href="/" className="font-semibold text-lg">
              Directr
            </Link>
            <div className="flex gap-6 text-sm text-gray-300">
              <Link href="/app">Create</Link>
              <Link href="/app/campaigns">Campaigns</Link>
              <Link href="/app/analytics">Analytics</Link>
              <Link href="/app/settings">Settings</Link>
            </div>
          </nav>
        </header>

        {/* Page content */}
        <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
      </body>
    </html>
  )
}