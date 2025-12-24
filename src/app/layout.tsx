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
  const cookieStore = await cookies();
  const unlocked = cookieStore.get("directr_unlocked")?.value === "true";

  async function unlock(formData: FormData) {
    "use server";
    const pass = String(formData.get("password") || "");
    if (pass && pass === process.env.SITE_PASSWORD) {
      const c = await cookies();
      c.set("directr_unlocked", "true", {
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
    const c = await cookies();
    c.set("directr_unlocked", "", {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });
  }

  // ----------------------------
  // LOCK SCREEN (mini landing)
  // ----------------------------
  if (lockEnabled && !unlocked) {
    return (
      <html lang="en">
        <body style={{ margin: 0 }}>
          <main
            style={{
              minHeight: "100vh",
              padding: "72px 20px 88px",
              background:
                "radial-gradient(circle at 10% 0%, rgba(14,165,233,.18), transparent 55%), radial-gradient(circle at 90% 10%, rgba(255,255,255,.06), transparent 60%), var(--bg)",
              color: "var(--fg)",
            }}
          >
            <div
              style={{
                maxWidth: 1100,
                margin: "0 auto",
                display: "flex",
                flexDirection: "column",
                gap: 28,
              }}
            >
              {/* Top bar */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 14,
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <div style={{ fontWeight: 800, letterSpacing: ".2px", fontSize: 18 }}>
                    directr<span className="dot">.</span>
                  </div>
                  <div style={{ color: "var(--muted)", fontSize: 12 }}>
                    Private build • founder access
                  </div>
                </div>

                <div
                  style={{
                    display: "inline-flex",
                    gap: 8,
                    alignItems: "center",
                    color: "var(--muted)",
                    fontSize: 12,
                    border: "1px solid var(--border)",
                    background: "rgba(255,255,255,.03)",
                    borderRadius: 999,
                    padding: "7px 10px",
                  }}
                >
                  <span
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: 999,
                      background: "rgba(14,165,233,.95)",
                      boxShadow: "0 0 0 3px rgba(14,165,233,.18)",
                      display: "inline-block",
                    }}
                  />
                  Shipping updates daily
                </div>
              </div>

              {/* Hero */}
              <section style={{ maxWidth: 980 }}>
                <h1
                  style={{
                    margin: 0,
                    fontSize: 38,
                    letterSpacing: "-0.03em",
                    lineHeight: 1.05,
                  }}
                >
                  Directr is locked.
                </h1>
                <p
                  style={{
                    margin: "12px 0 0",
                    color: "var(--muted)",
                    fontSize: 14,
                    lineHeight: 1.5,
                    maxWidth: 720,
                  }}
                >
                  AI-powered creation → clips → captions. We’re in build mode and limiting access
                  while we stabilize uploads + editing.
                </p>
              </section>

              {/* Feature cards */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr",
                  gap: 12,
                }}
              >
                <div style={lockCard}>
                  <div style={lockKicker}>Create</div>
                  <div style={lockText}>Type a prompt or upload. Get scripts, angles, notes.</div>
                </div>
                <div style={lockCard}>
                  <div style={lockKicker}>Clipper</div>
                  <div style={lockText}>Find hooks & key moments (then generate clip plan).</div>
                </div>
                <div style={lockCard}>
                  <div style={lockKicker}>Planner</div>
                  <div style={lockText}>Turn outputs into a weekly posting plan + execution list.</div>
                </div>
              </div>

              {/* Unlock panel */}
              <div
                style={{
                  maxWidth: 560,
                  background:
                    "radial-gradient(circle at 10% 0%, rgba(14,165,233,.10), transparent 60%), var(--panel)",
                  border: "1px solid var(--border)",
                  borderRadius: 20,
                  padding: 18,
                  boxShadow: "0 0 0 1px rgba(255,255,255,.02) inset",
                }}
              >
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontWeight: 700, marginBottom: 2 }}>Enter password</div>
                  <div style={{ color: "var(--muted)", fontSize: 12 }}>
                    Your session stays unlocked for 7 days on this device.
                  </div>
                </div>

                <form action={unlock} style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <input
                    className="input"
                    name="password"
                    type="password"
                    placeholder="Password"
                    autoComplete="current-password"
                    required
                    style={{ flex: 1 }}
                  />
                  <button className="btn btn--primary" type="submit" style={{ whiteSpace: "nowrap" }}>
                    Unlock
                  </button>
                </form>

                <div style={{ marginTop: 10, fontSize: 12, color: "var(--muted)" }}>
                  Tip: set <code>SITE_LOCK_ENABLED=false</code> to disable lock.
                </div>
              </div>
            </div>
          </main>
        </body>
      </html>
    );
  }

  // ----------------------------
  // NORMAL APP
  // ----------------------------
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

const lockCard: React.CSSProperties = {
  background: "rgba(255,255,255,.03)",
  border: "1px solid var(--border)",
  borderRadius: 18,
  padding: 16,
  boxShadow: "0 0 0 1px rgba(255,255,255,.02) inset",
};

const lockKicker: React.CSSProperties = {
  fontSize: 12,
  color: "rgba(255,255,255,.88)",
  fontWeight: 700,
  letterSpacing: ".06em",
  textTransform: "uppercase",
  marginBottom: 8,
};

const lockText: React.CSSProperties = {
  color: "var(--muted)",
  fontSize: 13,
  lineHeight: 1.4,
};
