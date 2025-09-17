import "./globals.css"
import type { Metadata } from "next"
import NavLink from "@/components/NavLink"

export const metadata: Metadata = {
  title: "Directr",
  description: "Your AI Content Director",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="sticky top-0 z-20 border-b" style={{borderColor:"var(--border)", background:"rgba(11,11,11,0.6)", backdropFilter:"blur(8px)"}}>
          <nav className="container flex items-center justify-between py-3">
            <a href="/" className="font-semibold tracking-tight">Directr</a>
            <div className="flex items-center gap-6">
              <NavLink href="/app">Create</NavLink>
              <NavLink href="/app/campaigns">Campaigns</NavLink>
              <NavLink href="/app/analytics">Analytics</NavLink>
              <NavLink href="/app/settings">Settings</NavLink>
            </div>
          </nav>
        </header>
        <main className="container py-6">{children}</main>
        <footer className="border-t mt-10 py-8 text-sm muted" style={{borderColor:"var(--border)"}}>
          <div className="container flex items-center justify-between">
            <div>© {new Date().getFullYear()} Directr</div>
            <div className="flex gap-4">
              <a className="hover:underline" href="/privacy">Privacy</a>
              <a className="hover:underline" href="/terms">Terms</a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}
