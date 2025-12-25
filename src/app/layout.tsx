// src/app/layout.tsx
import "./globals.css";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // ✅ Next 15: cookies() can be async depending on runtime
  const cookieStore = await cookies();

  const lockEnabled = process.env.SITE_LOCK_ENABLED === "true";
  const unlocked = cookieStore.get("directr_unlocked")?.value === "true";
  const showLock = lockEnabled && !unlocked;

  const wrongKey = cookieStore.get("directr_unlock_error")?.value === "1";

  async function signOut() {
    "use server";
    const s = createServerClient();
    await s.auth.signOut();
    redirect("/login");
  }

  async function unlock(formData: FormData) {
    "use server";
    const key = String(formData.get("key") || "").trim();
    const expected = String(process.env.SITE_LOCK_KEY || "").trim();

    const c = await cookies();

    if (!expected || key !== expected) {
      // quick feedback flag
      c.set("directr_unlock_error", "1", {
        httpOnly: false,
        sameSite: "lax",
        secure: true,
        path: "/",
        maxAge: 10,
      });
      redirect("/create");
    }

    // success
    c.set("directr_unlocked", "true", {
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    // clear error flag
    c.set("directr_unlock_error", "0", {
      httpOnly: false,
      sameSite: "lax",
      secure: true,
      path: "/",
      maxAge: 1,
    });

    redirect("/create");
  }

  // Keep your auth logic (optional)
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

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
              <div className="lock__bg" />

              <div className="lock__wrap">
                <div className="lock__pill">
                  <span className="lock__dot" />
                  Private build • founder access
                </div>

                <h1 className="lock__title">Directr is in private mode.</h1>
                <p className="lock__sub">
                  AI-powered creation → clips → captions. Access is limited while we stabilize uploads + editing.
                </p>

                <div className="lock__cards">
                  <div className="lockCard">
                    <div className="lockCard__top">
                      <span className="lockCard__kicker">Create</span>
                      <span className="lockCard__tag">scripts • angles • notes</span>
                    </div>
                    <p className="lockCard__p">Turn a prompt or upload into a clean content plan.</p>
                  </div>

                  <div className="lockCard">
                    <div className="lockCard__top">
                      <span className="lockCard__kicker">Clipper</span>
                      <span className="lockCard__tag">hooks • moments</span>
                    </div>
                    <p className="lockCard__p">Find the best segments and generate a clip plan.</p>
                  </div>

                  <div className="lockCard">
                    <div className="lockCard__top">
                      <span className="lockCard__kicker">Planner</span>
                      <span className="lockCard__tag">weekly execution</span>
                    </div>
                    <p className="lockCard__p">Turn outputs into a posting schedule + checklist.</p>
                  </div>
                </div>

                <div className="lockPanel">
                  <div className="lockPanel__head">
                    <div>
                      <div className="lockPanel__title">Enter access key</div>
                      <div className="lockPanel__hint">This device stays unlocked for 7 days.</div>
                    </div>
                    {wrongKey && (
                      <div className="lockPanel__error">Wrong key. Try again.</div>
                    )}
                  </div>

                  <form action={unlock} className="lockPanel__form">
                    <input
                      className="input lockPanel__input"
                      name="key"
                      type="password"
                      placeholder="Access key"
                      autoComplete="current-password"
                      required
                    />
                    <button className="btn btn--primary lockPanel__btn" type="submit">
                      Unlock
                    </button>
                  </form>

                  <div className="lockPanel__foot">
                    Tip: set <code>SITE_LOCK_ENABLED=false</code> to disable.
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
