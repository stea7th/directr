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
  const lockEnabled = process.env.SITE_LOCK_ENABLED === "true";
  const cookieStore = cookies();
  const unlocked = cookieStore.get("directr_unlocked")?.value === "true";

  async function unlock(formData: FormData) {
    "use server";
    const pass = String(formData.get("password") || "");
    if (pass && pass === process.env.SITE_PASSWORD) {
      cookies().set("directr_unlocked", "true", {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
    }
  }

  async function lock() {
    "use server";
    cookies().set("directr_unlocked", "", {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });
  }

  // ✅ LOCK SCREEN (mini landing page)
  if (lockEnabled && !unlocked) {
    return (
      <html lang="en">
        <body>
          <main className="lock">
            <div className="lock__top">
              <div className="lock__brand">
                <div className="lock__logo">
                  directr<span className="dot">.</span>
                </div>
                <div className="lock__tag">Private build • founder access</div>
              </div>
            </div>

            <section className="lock__hero">
              <h1 className="lock__title">Directr is in private mode.</h1>
              <p className="lock__sub">
                AI-powered creation → clips → captions. We’re shipping fast right now.
              </p>

              <div className="lock__grid">
                <div className="lock__card">
                  <div className="lock__kicker">Create</div>
                  <div className="lock__text">Upload or type a prompt. Get scripts + notes.</div>
                </div>
                <div className="lock__card">
                  <div className="lock__kicker">Clipper</div>
                  <div className="lock__text">Find hooks & moments and package them.</div>
                </div>
                <div className="lock__card">
                  <div className="lock__kicker">Planner</div>
                  <div className="lock__text">Turn outputs into a posting plan.</div>
                </div>
              </div>

              <div className="lock__panel">
                <div className="lock__panelHead">
                  <div>
                    <div className="lock__panelTitle">Enter password</div>
                    <div className="lock__panelHint">Only you (and whoever you share it with) can get in.</div>
                  </div>
                </div>

                <form action={unlock} className="lock__form">
                  <input
                    className="input lock__input"
                    name="password"
                    type="password"
                    placeholder="Password"
                    autoComplete="current-password"
                    required
                  />
                  <button className="btn btn--primary lock__btn" type="submit">
                    Unlock
                  </button>
                </form>

                <div className="lock__footer">
                  <span className="lock__muted">Need access?</span>{" "}
                  <span className="lock__muted">DM the founder.</span>
                </div>
              </div>
            </section>
          </main>

          <style jsx global>{`
            .lock {
              min-height: 100vh;
              padding: 64px 20px 80px;
              background:
                radial-gradient(circle at 10% 0%, rgba(14,165,233,.18), transparent 55%),
                radial-gradient(circle at 90% 10%, rgba(255,255,255,.06), transparent 60%),
                var(--bg);
              color: var(--fg);
            }
            .lock__top {
              max-width: 1100px;
              margin: 0 auto 38px;
              display: flex;
              align-items: center;
              justify-content: space-between;
              gap: 16px;
            }
            .lock__brand { display: flex; flex-direction: column; gap: 6px; }
            .lock__logo {
              font-weight: 800;
              letter-spacing: .2px;
              font-size: 18px;
            }
            .lock__tag {
              color: var(--muted);
              font-size: 12px;
            }
            .lock__hero {
              max-width: 1100px;
              margin: 0 auto;
            }
            .lock__title {
              margin: 0 0 10px;
              font-size: 34px;
              letter-spacing: -0.02em;
              line-height: 1.05;
            }
            .lock__sub {
              margin: 0 0 22px;
              color: var(--muted);
              font-size: 14px;
              max-width: 720px;
            }
            .lock__grid {
              display: grid;
              grid-template-columns: 1fr;
              gap: 12px;
              margin: 18px 0 18px;
            }
            @media (min-width: 900px) {
              .lock__grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
            }
            .lock__card {
              background: rgba(255,255,255,.03);
              border: 1px solid var(--border);
              border-radius: 18px;
              padding: 16px;
              box-shadow: 0 0 0 1px rgba(255,255,255,.02) inset;
            }
            .lock__kicker {
              font-size: 12px;
              color: rgba(255,255,255,.88);
              font-weight: 700;
              letter-spacing: .06em;
              text-transform: uppercase;
              margin-bottom: 8px;
            }
            .lock__text {
              color: var(--muted);
              font-size: 13px;
              line-height: 1.4;
            }
            .lock__panel {
              margin-top: 18px;
              background: radial-gradient(circle at 10% 0%, rgba(14,165,233,.10), transparent 60%), var(--panel);
              border: 1px solid var(--border);
              border-radius: 20px;
              padding: 18px;
              max-width: 560px;
            }
            .lock__panelHead {
              display: flex;
              align-items: flex-start;
              justify-content: space-between;
              gap: 12px;
              margin-bottom: 12px;
            }
            .lock__panelTitle {
              font-weight: 700;
              margin-bottom: 2px;
            }
            .lock__panelHint {
              color: var(--muted);
              font-size: 12px;
            }
            .lock__form {
              display: flex;
              gap: 10px;
              align-items: center;
            }
            .lock__input { flex: 1; }
            .lock__btn { white-space: nowrap; }
            .lock__footer {
              margin-top: 10px;
              font-size: 12px;
              color: var(--muted);
            }
            .lock__muted { color: var(--muted); }
          `}</style>
        </body>
      </html>
    );
  }

  // ✅ NORMAL APP LAYOUT (unlocked)
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

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
                <>
                  <form action={signOut}>
                    <button className="btn btn--ghost" type="submit">
                      Sign out
                    </button>
                  </form>
                  <form action={lock}>
                    <button className="btn btn--ghost" type="submit">
                      Lock site
                    </button>
                  </form>
                </>
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
