// src/app/layout.tsx
import "./globals.css";
import Link from "next/link";
import {
  createServerComponentClient,
  createRouteClient,
} from "@/lib/supabase/server";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // ✅ READ-ONLY supabase client (no cookie writes)
  const supabase = createServerComponentClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // ✅ This is a Server Action, so it CAN modify cookies
  async function signOut() {
    "use server";
    const s = createRouteClient();
    await s.auth.signOut();
  }

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
