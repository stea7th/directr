export const dynamic = "force-dynamic";

type SearchParams = { from?: string };

export default async function LockPage(props: {
  searchParams?: Promise<SearchParams>;
}) {
  const sp = (await props.searchParams) ?? {};
  const from = sp.from ?? "/";

  async function unlock(formData: FormData) {
    "use server";
    const key = String(formData.get("key") || "");
    const expected = process.env.SITE_LOCK_KEY || "";

    if (!expected || key !== expected) return;

    const { cookies } = await import("next/headers");
    const store = await cookies();

    store.set("directr_unlocked", "true", {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
  }

  async function lockAgain() {
    "use server";
    const { cookies } = await import("next/headers");
    const store = await cookies();
    store.set("directr_unlocked", "", {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });
  }

  return (
    <main
      style={{
        minHeight: "calc(100vh - 64px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <div
        style={{
          width: "min(980px, 100%)",
          borderRadius: 28,
          border: "1px solid rgba(255,255,255,.10)",
          background:
            "radial-gradient(circle at 20% 10%, rgba(14,165,233,.18), transparent 40%), radial-gradient(circle at 90% 20%, rgba(99,102,241,.14), transparent 45%), #0b0b0f",
          boxShadow: "0 40px 90px rgba(0,0,0,.75)",
          padding: 28,
        }}
      >
        <div style={{ opacity: 0.85, fontSize: 12, marginBottom: 10 }}>
          Private build • founder access
        </div>

        <h1 style={{ margin: 0, fontSize: 44, letterSpacing: "-.02em" }}>
          Directr is in private mode.
        </h1>

        <p style={{ marginTop: 10, color: "rgba(255,255,255,.72)", maxWidth: 620 }}>
          AI-powered creation → clips → captions. Access is limited while we stabilize uploads + editing.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: 12, marginTop: 18 }}>
          {[
            { t: "Create", d: "Scripts • angles • notes" },
            { t: "Clipper", d: "Hooks • moments" },
            { t: "Planner", d: "Weekly execution" },
          ].map((x) => (
            <div
              key={x.t}
              style={{
                borderRadius: 18,
                border: "1px solid rgba(255,255,255,.10)",
                background: "rgba(255,255,255,.04)",
                padding: 14,
              }}
            >
              <div style={{ fontSize: 12, letterSpacing: ".12em", opacity: 0.85 }}>
                {x.t.toUpperCase()}
              </div>
              <div style={{ marginTop: 6, color: "rgba(255,255,255,.70)", fontSize: 13 }}>
                {x.d}
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 14, alignItems: "flex-end", flexWrap: "wrap", marginTop: 18 }}>
          <form action={unlock} style={{ flex: "1 1 420px", display: "flex", gap: 10 }}>
            <input
              name="key"
              placeholder="Access key"
              style={{
                flex: 1,
                height: 44,
                borderRadius: 14,
                border: "1px solid rgba(255,255,255,.14)",
                background: "rgba(0,0,0,.35)",
                color: "white",
                padding: "0 14px",
                outline: "none",
              }}
            />
            <button
              type="submit"
              style={{
                height: 44,
                padding: "0 16px",
                borderRadius: 14,
                border: "1px solid rgba(14,165,233,.55)",
                background: "rgba(14,165,233,.18)",
                color: "white",
                cursor: "pointer",
              }}
            >
              Unlock
            </button>
          </form>

          <form action={lockAgain}>
            <button
              type="submit"
              style={{
                height: 44,
                padding: "0 14px",
                borderRadius: 14,
                border: "1px solid rgba(255,255,255,.14)",
                background: "transparent",
                color: "rgba(255,255,255,.8)",
                cursor: "pointer",
              }}
            >
              Lock this device
            </button>
          </form>

          <div style={{ flex: "1 1 100%", marginTop: 6, color: "rgba(255,255,255,.5)", fontSize: 12 }}>
            Trying to open: <span style={{ opacity: 0.9 }}>{from}</span>
          </div>
        </div>
      </div>
    </main>
  );
}
