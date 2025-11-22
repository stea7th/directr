// src/app/layout.tsx
import "./globals.css";
import Link from "next/link";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <nav className="nav">
          <div className="nav__inner">
            <Link href="/" className="logo">
              directr<span className="dot">.</span>
            </Link>

            <div className="menu">
              <Link href="/create">Create</Link>
              <Link href="/clipper">Clipper</Link>
              <Link href="/planner">Planner</Link>
              <Link href="/jobs">Jobs</Link>
              <Link href="/pricing">Pricing</Link>
              {/* Sign in stays, but we’re not forcing auth anywhere now */}
              <Link href="/signin" className="btn btn--primary">
                Sign in
              </Link>
            </div>
          </div>
        </nav>

        <div className="page">{children}</div>
      </body>
    </html>
  );
}
