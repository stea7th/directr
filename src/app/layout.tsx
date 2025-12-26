// src/app/layout.tsx
import "./globals.css";
import Link from "next/link";
import { cookies } from "next/headers";
import LockScreen from "./lock/LockScreen";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();

  const lockEnabled = process.env.SITE_LOCK_ENABLED === "true";
  const unlocked = cookieStore.get("directr_unlocked")?.value === "true";

  // 🔒 HARD GATE: if locked, render ONLY the lock screen (no app routes can render)
  if (lockEnabled && !unlocked) {
    return (
      <html lang="en">
        <body>
          <LockScreen />
        </body>
      </html>
    );
  }

  // ✅ Normal app shell
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

              {/* optional relock */}
              <form action={async () => {
                "use server";
                const c = await cookies();
                c.set("directr_unlocked", "", { maxAge: 0, path: "/" });
              }}>
                <button className="btn btn--ghost" type="submit">Relock</button>
              </form>
            </div>
          </div>
        </nav>

        <div className="page">{children}</div>
      </body>
    </html>
  );
}
