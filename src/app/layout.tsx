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
  // ----------------------------
  // Supabase user (server)
  // ----------------------------
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  async function signOut() {
    "use server";
    const s = await createServerClient();
    await s.auth.signOut();
    redirect("/");
  }

  // ----------------------------
  // Site Lock (no middleware)
  // ----------------------------
  const lockEnabled = process.env.SITE_LOCK_ENABLED === "true";
  const expectedKey = process.env.SITE_LOCK_KEY ?? "";

  const store = await cookies();
  const unlocked = store.get("directr_unlocked")?.value === "true";

  const showLock = lockEnabled && !!expectedKey && !unlocked;

  async function unlock(formData: FormData) {
    "use server";
    const entered = String(formData.get("key") || "").trim();

    if (!expectedKey) redirect("/?lock=env-missing");
    if (!entered || entered !== expectedKey) redirect("/?lock=wrong");

    const s = await cookies();
    s.set("directr_unlocked", "true", {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    redirect("/"); // refresh -> lock disappears
  }

  async function relock() {
    "use server";
    const s = await cookies();
    s.set("directr_unlocked", "", {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });
    redirect("/");
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

              {/* dev-only convenience: remove later */}
              {lockEnabled && (
                <form action={relock}>
                  <button className="btn btn--ghost" type="submit">
                    Relock
                  </button>
                </form>
              )}
            </div>
          </div>
        </nav>

        <div className="page">{showLock ? <LockScreen unlock={unlock} /> : children}</div>
      </body>
    </html>
  );
}

function LockScreen({
  unlock,
}: {
  unlock: (formData: FormData) => Promise<void>;
}) {
  return (
    <main className="lock">
      <div className="lock__bg" />
      <div className="lock__wrap">
        <div className="lock__badge">
          <span className="lock__badgeDot" />
          Private build • founder access
        </div>

        <h1 className="lock__title">Directr is locked.</h1>
        <p className="lock__subtitle">
          We’re stabilizing uploads + editing. Access is limited while we ship.
        </p>

        <div className="lock__grid">
          <div className="lockCard">
            <div className="lockCard__top">
              <div className="lockCard__kicker">CREATE</div>
              <div className="lockCard__tag">scripts • angles • notes</div>
            </div>
            <p className="lockCard__p">Turn an idea into a clean content plan.</p>
          </div>

          <div className="lockCard">
            <div className="lockCard__top">
              <div className="lockCard__kicker">CLIPPER</div>
              <div className="lockCard__tag">hooks • moments</div>
            </div>
            <p className="lockCard__p">Find the best segments and plan clips.</p>
          </div>

          <div className="lockCard">
            <div className="lockCard__top">
              <div className="lockCard__kicker">PLANNER</div>
              <div className="lockCard__tag">weekly execution</div>
            </div>
            <p className="lockCard__p">Ship consistently with a posting system.</p>
          </div>
        </div>

        <div className="lockPanel">
          <div className="lockPanel__head">
            <div>
              <div className="lockPanel__title">Enter access key</div>
              <div className="lockPanel__hint">
                This device stays unlocked for 7 days.
              </div>
            </div>
          </div>

          <form className="lockPanel__form" action={unlock}>
            <input
              className="input lockPanel__input"
              name="key"
              placeholder="Access key"
              autoComplete="off"
            />
            <button className="btn btn--primary lockPanel__btn" type="submit">
              Unlock
            </button>
          </form>

          <div className="lockPanel__actions">
            <a className="lockLink" href="https://forms.gle/">
              Join waitlist
            </a>
            <a
              className="lockLink lockLink--ghost"
              href="mailto:you@yourdomain.com?subject=Directr%20Access%20Request"
            >
              Request access
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
