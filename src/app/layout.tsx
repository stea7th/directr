import type { ReactNode } from "react";
import "./globals.css";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";

export default async function RootLayout({ children }: { children: ReactNode }) {
  // DO NOT await — createServerClient is sync
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  async function signOut() {
    "use server";
    const s = createServerClient();
    await s.auth.signOut();
    redirect("/login");
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
              <Link href="/">Create</Link>
              <Link href="/clipper">Clipper</Link>
              <Link href="/planner">Planner</Link>
              <Link href="/jobs">Jobs</Link>
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
