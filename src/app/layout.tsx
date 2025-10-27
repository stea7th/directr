import type { Metadata } from 'next';
import './globals.css';
import './page.css';

export const metadata: Metadata = {
  title: 'Directr',
  description:
    'Upload a file or type a command — get clips, hooks, captions, and exports automatically.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="site">
        {/* Top Nav */}
        <header className="nav">
          <div className="nav__inner">
            <a href="/" className="logo">directr<span className="dot">.</span></a>
            <nav className="menu">
              <a href="/create">Create</a>
              <a href="/clipper">Clipper</a>
              <a href="/planner">Planner</a>
              <a className="link--muted" href="/jobs">Jobs</a>
            </nav>
          </div>
        </header>

        {/* Page content */}
        <main className="page">{children}</main>

        {/* Footer */}
        <footer className="footer">
          <div className="footer__inner">
            <span>© {new Date().getFullYear()} Directr</span>
            <span className="spacer">·</span>
            <a href="/privacy">Privacy</a>
            <span className="spacer">·</span>
            <a href="/terms">Terms</a>
          </div>
        </footer>
      </body>
    </html>
  );
}
