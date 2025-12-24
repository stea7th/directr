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

  // ✅ LOCK SCREEN (server-safe: no styled-jsx)
  if (lockEnabled && !unlocked) {
    return (
      <html lang="en">
        <body style={{ margin: 0 }}>
          <main
            style={{
              minHeight: "100vh",
              padding: "64px 20px 80px",
              background:
                "radial-gradient(circle at 10% 0%, rgba(14,165,233,.18), transparent 55%), radial-gradient(circle at 90% 10%, rgba(255,255,255,.06), transparent 60%), var(--bg)",
              color: "var(--fg)",
            }}
          >
            <div
              style={{
                maxWidth: 1100,
                margin: "0 auto 38px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 16,
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
            </div>

            <section style={{ maxWidth: 1100, margin: "0 auto" }}>
              <h1
                style={{
                  margin: "0 0 10px",
                  fontSize: 34,
                  letterSpacing: "-0.02em",
                  lineHeight: 1.05,
                }}
              >
                Directr is in private mode.
              </h1>
              <p style={{ margin: "0 0 22px", color: "var(--muted)", fontSize: 14, maxWidth: 720 }}>
                AI-powered creation → clips → captions. We’re shipping fast right now.
              </p>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr",
                  gap: 12,
                  margin: "18px 0 18px",
                }}
              >
                <div style={cardStyle}>
                  <div style={kickerStyle}>Create</div>
                  <div style={textStyle}>Upload or type a prompt. Get scripts + notes.</div>
                </div>
                <div style={cardStyle}>
                  <div style={kickerStyle}>Clipper</div>
                  <div style={textStyle}>Find hooks & moments and package them.</div>
                </div>
                <div style={cardStyle}>
                  <div style={kickerStyle}>Planner</div>
                  <div style={textStyle}>Turn outputs into a posting plan.</div>
                </div>
              </div>

              <div
                style={{
                  marginTop: 18,
                  background:
                    "radial-gradient(circle at 10% 0%, rgba(14,165,233,.10), transparent 60%), var(--panel)",
                  border: "1px solid var(--border)",
                  borderRadius: 20,
                  padding: 18,
                  maxWidth: 560,
                }}
              >
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontWeight: 700, marginBottom: 2 }}>Enter password</div>
                  <div style={{ color: "var(--muted)", fontSize: 12 }}>
                    Only you (and whoever you share it with) can get in.
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
                  Need access? DM the founder.
                </div>
              </div>
            </section>
          </main>
        </body>
      </html>
    );
  }

  // ✅ NORMAL APP
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

const cardStyle: React.CSSProperties = {
  background: "rgba(255,255,255,.03)",
  border: "1px solid var(--border)",
  borderRadius: 18,
  padding: 16,
  boxShadow: "0 0 0 1px rgba(255,255,255,.02) inset",
};

const kickerStyle: React.CSSProperties = {
  fontSize: 12,
  color: "rgba(255,255,255,.88)",
  fontWeight: 700,
  letterSpacing: ".06em",
  textTransform: "uppercase",
  marginBottom: 8,
};

const textStyle: React.CSSProperties = {
  color: "var(--muted)",
  fontSize: 13,
  lineHeight: 1.4,
};
