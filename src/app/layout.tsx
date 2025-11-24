import "./globals.css";
import Link from "next/link";

// ❗ REMOVE all server-side Supabase calls from the layout

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

              {/* 
                We CANNOT check auth from here.
                The nav should always show "Sign in" 
                because the login page will redirect 
                AFTER session is fully active.
              */}

              <Link href="/login" className="btn btn--primary">
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
