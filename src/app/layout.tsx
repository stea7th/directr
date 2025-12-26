import "./globals.css";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";

const LOCK_COOKIE = "directr_unlocked";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const lockEnabled = process.env.SITE_LOCK_ENABLED === "true";
  const cookieStore = await cookies();
  const unlocked = cookieStore.get(LOCK_COOKIE)?.value === "true";

  // allow lock page + api routes to work even while locked
  const pathname = cookieStore.get("next-url")?.value || "";

  if (lockEnabled && !unlocked) {
    // always show lock instead of any page
    redirect("/lock");
  }

  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  async function signOut() {
    "use server";
    const s = createServerClient();
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
                  <button className="btn btn--ghost" type="submit">Sign out</button>
                </form>
              ) : (
                <Link href="/login" className="btn btn--primary">Sign in</Link>
              )}
            </div>
          </div>
        </nav>

        <div className="page">{children}</div>
      </body>
    </html>
  );
}
