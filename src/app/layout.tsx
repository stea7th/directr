// src/app/layout.tsx
import "./globals.css";
import Link from "next/link";
import { cookies } from "next/headers";
import { createServerClient } from "@/lib/supabase/server";
import LockScreen from "./lock/LockScreen";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Supabase user for nav (optional)
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // ✅ Lock gate (applies globally)
  const lockEnabled = process.env.SITE_LOCK_ENABLED === "true";
  const cookieStore = await cookies(); // Next 15: cookies() is async
  const unlocked = cookieStore.get("directr_unlocked")?.value === "true";

  async function signOut() {
    "use server";
    const s = await createServerClient();
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

              {/* ✅ Founder badge when unlocked */}
              {lockEnabled && unlocked ? (
                <span className="badge badge--ok">Founder access</span>
              ) : null}

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

        <div className="page">
          {/* ✅ If locked, show lock screen no matter what URL they type */}
          {lockEnabled && !unlocked ? <LockScreen /> : children}
        </div>
      </body>
    </html>
  );
}
