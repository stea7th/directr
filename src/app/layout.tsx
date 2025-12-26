// src/app/layout.tsx
import "./globals.css";
import Link from "next/link";
import { relockAction } from "@/app/lock/actions";
import { createServerClient } from "@/lib/supabase/server";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // ✅ your helper returns a Promise, so await it
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  async function signOut() {
    "use server";
    const s = await createServerClient(); // ✅ await here too
    await s.auth.signOut();
  }

  return (
    <html lang="en">
      <body className="site">
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
              
{process.env.SITE_LOCK_ENABLED === "true" && (
  <form action={relockAction}>
    <button className="btn btn--ghost" type="submit">
      Relock
    </button>
  </form>
)}
              {user ? (
                <form action={signOut}>
                  <button className="btn btn--ghost" type="submit">
                    Sign out
                  </button>
                </form>
              ) : (
                <Link href="/login" className="btn btn--primary">
                  Sign in
                </Link>
              )}
            </div>
          </div>
        </nav>

        <div className="page">{children}</div>
      </body>
    </html>
  );
}
