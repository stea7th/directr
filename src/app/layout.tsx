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
  // auth (your existing)
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  async function signOut() {
    "use server";
    const s = createServerClient();
    await s.auth.signOut();
  }

  // --- SITE LOCK ---
  const lockEnabled = process.env.SITE_LOCK_ENABLED === "true";
  const secret = process.env.SITE_LOCK_KEY || ""; // must exist in env
  const cookieStore = await cookies();
  const unlocked = cookieStore.get("directr_unlocked")?.value === "true";

  async function unlock(formData: FormData) {
    "use server";
    const key = String(formData.get("key") || "");
    if (!process.env.SITE_LOCK_KEY) {
      redirect("/?lock=env-missing");
    }
    if (key.trim() && key.trim() === process.env.SITE_LOCK_KEY) {
      const store = await cookies();
      store.set("directr_unlocked", "true", {
        httpOnly: true,
        sameSite: "lax",
        secure: true,
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
      redirect("/"); // refresh + re-render without lock
    }
    redirect("/?lock=wrong");
  }

  const showLock = lockEnabled && !!secret && !unlocked;

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
            <LockScreen action={unlock} />
          ) : (
            children
          )}
        </div>
      </body>
    </html>
  );
}

function LockScreen({ action }: { action: (fd: FormData) => Promise<void> }) {
  // This is a Server Component. No client hooks.
  return (
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
              <div className="lockCard__kicker">Create</div>
              <div className="lockCard__tag">scripts • angles • notes</div>
            </div>
            <p className="lockCard__p">Turn a prompt or upload into a clean content plan.</p>
          </div>

          <div className="lockCard">
            <div className="lockCard__top">
              <div className="lockCard__kicker">Clipper</div>
              <div className="lockCard__tag">hooks • moments</div>
            </div>
            <p className="lockCard__p">Find the best segments and generate a clip plan.</p>
          </div>

          <div className="lockCard">
            <div className="lockCard__top">
              <div className="lockCard__kicker">Planner</div>
              <div className="lockCard__tag">weekly execution</div>
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

            {/* show reason via query param */}
            {/* if you want: remove this */}
          </div>

          <form className="lockPanel__form" action={action}>
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

          <div className="lockPanel__foot">
            Tip: set <code>SITE_LOCK_ENABLED=false</code> to disable.
          </div>
        </div>
      </div>
    </main>
  );
}
