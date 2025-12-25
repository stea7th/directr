// src/app/layout.tsx
import "./globals.css";
import Link from "next/link";
import { cookies } from "next/headers";
import { createServerClient } from "@/lib/supabase/server";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // ✅ Next 15: cookies() is async in server components
  const cookieStore = await cookies();

  const lockEnabled = process.env.SITE_LOCK_ENABLED === "true";
  const unlocked = cookieStore.get("directr_unlocked")?.value === "true";

  async function signOut() {
    "use server";
    const s = createServerClient();
    await s.auth.signOut();
  }

  async function unlock(formData: FormData) {
    "use server";
    const password = String(formData.get("password") || "");
    const expected = process.env.SITE_LOCK_PASSWORD || "";

    if (!expected) return; // fail closed if not set
    if (password !== expected) return;

    const c = await cookies();
    c.set("directr_unlocked", "true", {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
  }

  const showLock = lockEnabled && !unlocked;

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

        <div className="page">
          {showLock ? (
            <main className="lock">
              <div className="lock__bg" aria-hidden="true" />
              <div className="lock__wrap">
                <div className="lock__badge">
                  <span className="lock__dot" />
                  Private build • founder access
                </div>

                <h1 className="lock__title">Directr is in private mode.</h1>
                <p className="lock__sub">
                  AI-powered creation → clips → captions. Access is limited while we
                  stabilize uploads + editing.
                </p>

                <div className="lock__grid">
                  <div className="lock__card">
                    <div className="lock__cardTop">
                      <span className="lock__pill">CREATE</span>
                      <span className="lock__mini">Scripts • angles • notes</span>
                    </div>
                    <p className="lock__cardText">
                      Turn a prompt or upload into a clean content plan.
                    </p>
                  </div>

                  <div className="lock__card">
                    <div className="lock__cardTop">
                      <span className="lock__pill">CLIPPER</span>
                      <span className="lock__mini">Hooks • moments</span>
                    </div>
                    <p className="lock__cardText">
                      Find the best segments and generate a clip plan.
                    </p>
                  </div>

                  <div className="lock__card">
                    <div className="lock__cardTop">
                      <span className="lock__pill">PLANNER</span>
                      <span className="lock__mini">Weekly execution</span>
                    </div>
                    <p className="lock__cardText">
                      Turn outputs into a posting schedule + checklist.
                    </p>
                  </div>
                </div>

                <div className="lock__panel">
                  <div className="lock__panelHead">
                    <h3>Enter access key</h3>
                    <p>Your device stays unlocked for 7 days.</p>
                  </div>

                  <form action={unlock} className="lock__form">
                    <input
                      className="input lock__input"
                      name="password"
                      type="password"
                      placeholder="Access key"
                      autoComplete="current-password"
                      required
                    />
                    <button className="btn btn--primary lock__btn" type="submit">
                      Unlock
                    </button>
                  </form>

                  <div className="lock__hint">
                    Tip: set <code>SITE_LOCK_ENABLED=false</code> to disable the lock.
                  </div>
                </div>
              </div>
            </main>
          ) : (
            children
          )}
        </div>
      </body>
    </html>
  );
}
