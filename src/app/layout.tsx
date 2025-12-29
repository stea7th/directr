import "./globals.css";
import NavMobile from "@/components/NavMobile";
import Link from "next/link";
import { relockAction } from "@/app/lock/actions";
import { createServerClient } from "@/lib/supabase/server";
import { Inter, JetBrains_Mono } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  async function signOut() {
    "use server";
    const s = await createServerClient();
    await s.auth.signOut();
  }

  const showLockControls = process.env.SITE_LOCK_ENABLED === "true";

  return (
    <html lang="en" className={`${inter.variable} ${mono.variable}`}>
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

              {showLockControls && (
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

        <main className="page">{children}</main>

        {/* ✅ Mobile “app” nav */}
        <NavMobile showLockControls={showLockControls} isAuthed={!!user} />
      </body>
    </html>
  );
}
