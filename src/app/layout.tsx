import "./globals.css"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Directr",
  description: "Your AI Content Director",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {/* Navbar */}
        <header className="navbar">
          <div className="container nav">
            <a href="/" className="font-semibold" style={{letterSpacing:"-.01em"}}>Directr</a>
            <nav className="navlinks">
              <a href="/app">Create</a>
              <a href="/app/campaigns">Campaigns</a>
              <a href="/app/analytics">Analytics</a>
              <a href="/app/settings">Settings</a>
            </nav>
          </div>
        </header>

        {/* Page content */}
        <main className="container" style={{paddingTop:24, paddingBottom:24}}>
          {children}
        </main>

        {/* Footer */}
        <div className="hr" />
        <div className="container" style={{paddingBottom:32}}>
          <div className="muted" style={{display:"flex", justifyContent:"space-between", fontSize:14}}>
            <span>© {new Date().getFullYear()} Directr</span>
            <span style={{display:"flex", gap:16}}>
              <a href="/privacy">Privacy</a>
              <a href="/terms">Terms</a>
            </span>
          </div>
        </div>
      </body>
    </html>
  )
}