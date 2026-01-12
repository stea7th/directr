"use client";

import "./page.css";
import React, { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";

type Mode = "basic" | "advanced";

type PlanState = {
  loading: boolean;
  isPro: boolean;
  used: number;
  freeLimit: number;
};

export default function CreatePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const upgraded = searchParams.get("upgraded") === "1";
  const canceled = searchParams.get("canceled") === "1";

  const [mode, setMode] = useState<Mode>("basic");
  const [prompt, setPrompt] = useState("");
  const [platform, setPlatform] = useState("TikTok");
  const [goal, setGoal] = useState("Get more views, drive sales, grow page, etc.");
  const [lengthSeconds, setLengthSeconds] = useState("30");
  const [tone, setTone] = useState("Casual");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [limitReached, setLimitReached] = useState(false);

  const [result, setResult] = useState<string | null>(null);
  const [editedUrl, setEditedUrl] = useState<string | null>(null);

  const [plan, setPlan] = useState<PlanState>({
    loading: true,
    isPro: false,
    used: 0,
    freeLimit: 3,
  });

  // ✅ Auth state + popup
  const [authLoading, setAuthLoading] = useState(true);
  const [isAuthed, setIsAuthed] = useState(false);
  const [showSignin, setShowSignin] = useState(false);

  const statusLine = useMemo(() => {
    if (plan.loading) return "Checking your plan…";
    if (plan.isPro) return "✅ Pro unlocked • unlimited hooks";
    return `${Math.min(plan.used, plan.freeLimit)} / ${plan.freeLimit} free generations used • then $19/mo`;
  }, [plan.loading, plan.isPro, plan.used, plan.freeLimit]);

  async function refreshAuth() {
    try {
      setAuthLoading(true);

      // ✅ reliable: getSession for "am I signed in?"
      const { data, error } = await supabase.auth.getSession();
      if (error) console.error("getSession error:", error);

      const authed = !!data?.session?.user;
      setIsAuthed(authed);

      // if authed, never show popup
      if (authed) setShowSignin(false);
    } catch (e) {
      console.error("refreshAuth error:", e);
      setIsAuthed(false);
    } finally {
      setAuthLoading(false);
    }
  }

  async function requireAuthOrPopup(): Promise<boolean> {
    // If auth is still loading, do a live check instead of popping incorrectly
    const { data } = await supabase.auth.getSession();
    const authed = !!data?.session?.user;

    setIsAuthed(authed);
    setAuthLoading(false);

    if (authed) {
      setShowSignin(false);
      return true;
    }

    setShowSignin(true);
    return false;
  }

  async function refreshPlan() {
    try {
      setPlan((p) => ({ ...p, loading: true }));

      const { data } = await supabase.auth.getSession();
      const user = data?.session?.user;

      if (!user) {
        setPlan({ loading: false, isPro: false, used: 0, freeLimit: 3 });
        return;
      }

      const { data: profile, error: profileErr } = await supabase
        .from("profiles")
        .select("is_pro, generations_used")
        .eq("id", user.id)
        .maybeSingle();

      if (profileErr) {
        console.error("Plan fetch error:", profileErr);
        setPlan((p) => ({ ...p, loading: false }));
        return;
      }

      const isPro = !!profile?.is_pro;
      const used = Number(profile?.generations_used ?? 0);

      setPlan({ loading: false, isPro, used, freeLimit: 3 });

      if (isPro) setLimitReached(false);
    } catch (e) {
      console.error("refreshPlan error:", e);
      setPlan((p) => ({ ...p, loading: false }));
    }
  }

  useEffect(() => {
    // initial checks
    refreshAuth();
    refreshPlan();

    // ✅ keep auth state synced in realtime (don’t flicker popup)
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      const authed = !!session?.user;
      setIsAuthed(authed);
      setAuthLoading(false);
      if (authed) setShowSignin(false);

      // refresh plan on auth changes
      refreshPlan();
    });

    return () => {
      data?.subscription?.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleGenerate() {
    setError(null);
    setLimitReached(false);
    setResult(null);
    setEditedUrl(null);

    // ✅ gate with reliable session check
    const ok = await requireAuthOrPopup();
    if (!ok) return;

    if (!prompt.trim()) {
      setError("Add a quick idea first.");
      return;
    }

    setLoading(true);
    try {
      // TEXT ONLY → hook generator
      const body = { prompt, platform, goal, lengthSeconds, tone };

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.status === 401) {
        setShowSignin(true);
        return;
      }

      if (res.status === 402) {
        setLimitReached(true);
        await refreshPlan();
        return;
      }

      const contentType = res.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        const text = await res.text();
        console.error("Non-JSON response from /api/generate:", {
          status: res.status,
          textSnippet: text.slice(0, 200),
        });
        setError(`Server returned non-JSON (status ${res.status}). Route might be misconfigured.`);
        return;
      }

      const data = await res.json();

      if (!data.success) {
        if (data?.error === "limit_reached") {
          setLimitReached(true);
          await refreshPlan();
          return;
        }
        if (data?.error === "signin_required") {
          setShowSignin(true);
          return;
        }
        setError(data.error || "Failed to generate hooks.");
        return;
      }

      const notes = data?.text || "Generated successfully, but no hooks were returned.";
      setResult(notes);
      setEditedUrl(null);

      await refreshPlan();
    } catch (err: any) {
      console.error("Generate error (client):", err);
      setError(err?.message || "Unexpected error.");
    } finally {
      setLoading(false);
    }
  }

  async function handleUpgrade() {
    const ok = await requireAuthOrPopup();
    if (!ok) return;

    try {
      setError(null);
      setLoading(true);

      const priceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID || "";
      if (!priceId) {
        router.push("/pricing");
        return;
      }

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      });

      if (res.status === 401) {
        setShowSignin(true);
        return;
      }

      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.success || !data?.url) {
        if (data?.error === "signin_required") {
          setShowSignin(true);
          return;
        }
        setError(data?.error || "Could not start checkout. Try again.");
        return;
      }

      window.location.href = data.url;
    } catch (e: any) {
      setError(e?.message || "Could not start checkout. Try again.");
    } finally {
      setLoading(false);
    }
  }

  function goToLogin() {
    const next = encodeURIComponent("/create");
    router.push(`/login?next=${next}`);
  }

  return (
    <main className="create-root">
      {/* ✅ Sign-in popup (ONLY when truly not authed) */}
      {showSignin && !isAuthed && !authLoading && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 50,
            background: "rgba(0,0,0,0.65)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
          onClick={() => setShowSignin(false)}
        >
          <div
            className="card"
            style={{ maxWidth: 520, width: "100%" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="card__head">
              <div>
                <div className="title">Please sign in first</div>
                <div className="subtitle">Create an account in seconds. Then generate hooks.</div>
              </div>
            </div>

            <button
              type="button"
              className="btn btn--primary"
              style={{ width: "100%", marginBottom: 10 }}
              onClick={goToLogin}
            >
              Sign in / Create account
            </button>

            <button
              type="button"
              className="btn btn--ghost"
              style={{ width: "100%" }}
              onClick={() => setShowSignin(false)}
            >
              Not now
            </button>
          </div>
        </div>
      )}

      <section className="create-shell">
        <header className="create-header">
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <h1 style={{ marginBottom: 0 }}>Fix your hook before you post</h1>

            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <span
                style={{
                  fontSize: 12,
                  color: plan.isPro ? "rgba(160, 255, 200, 0.9)" : "rgba(255,255,255,0.55)",
                  border: "1px solid rgba(255,255,255,0.10)",
                  background: "rgba(0,0,0,0.20)",
                  padding: "6px 10px",
                  borderRadius: 999,
                }}
              >
                {statusLine}
              </span>

              {upgraded && (
                <span style={{ fontSize: 12, color: "rgba(160, 255, 200, 0.9)" }}>
                  ✅ Payment received — Pro is active
                </span>
              )}

              {canceled && (
                <span style={{ fontSize: 12, color: "rgba(255, 190, 120, 0.9)" }}>
                  Checkout canceled — you can upgrade anytime
                </span>
              )}
            </div>
          </div>

          <div className="create-mode-toggle">
            <button
              type="button"
              className={`create-mode-btn ${mode === "basic" ? "create-mode-btn--active" : ""}`}
              onClick={() => setMode("basic")}
            >
              Quick
            </button>
            <button
              type="button"
              className={`create-mode-btn ${mode === "advanced" ? "create-mode-btn--active" : ""}`}
              onClick={() => setMode("advanced")}
            >
              Dialed
            </button>
          </div>
        </header>

        <div className={`create-main-card ${loading ? "is-loading" : ""}`}>
          <div className="create-textarea-wrap">
            <textarea
              name="prompt"
              className="create-textarea"
              placeholder={"Example: I’m making a video about (topic). Give me 10 hooks that sound human."}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </div>

          {mode === "advanced" && (
            <div className="create-advanced-row">
              <div className="create-adv-field">
                <label>Platform</label>
                <select value={platform} onChange={(e) => setPlatform(e.target.value)}>
                  <option value="TikTok">TikTok</option>
                  <option value="Reels">Instagram Reels</option>
                  <option value="Shorts">YouTube Shorts</option>
                  <option value="All">All of the above</option>
                </select>
              </div>

              <div className="create-adv-field">
                <label>Goal</label>
                <input
                  type="text"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  placeholder="Get more views, drive sales, grow page, etc."
                />
              </div>

              <div className="create-adv-field">
                <label>Length (seconds)</label>
                <input
                  type="number"
                  min={5}
                  max={180}
                  value={lengthSeconds}
                  onChange={(e) => setLengthSeconds(e.target.value)}
                />
              </div>

              <div className="create-adv-field">
                <label>Tone</label>
                <select value={tone} onChange={(e) => setTone(e.target.value)}>
                  <option value="Casual">Casual</option>
                  <option value="High-energy">High-energy</option>
                  <option value="Storytelling">Storytelling</option>
                  <option value="Authority">Authority</option>
                </select>
              </div>
            </div>
          )}

          <div className="create-bottom-row">
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, width: "100%" }}>
              <button type="button" className="create-generate-btn" onClick={handleGenerate} disabled={loading}>
                {loading ? "Finding hooks..." : "Generate hooks"}
              </button>

              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.55)" }}>
                {plan.isPro ? "✅ Pro active • unlimited generations" : "3 free generations • then $19/mo for unlimited hooks"}
              </span>
            </div>
          </div>

          <p className="create-tip">
            Tip: Paste your idea + what the video is about. The first 3 seconds decide everything.
          </p>

          {error && <p className="create-error">{error}</p>}

          {limitReached && !error && !plan.isPro && (
            <div className="create-result">
              <h3>You’ve used your free hooks.</h3>
              <p style={{ margin: "8px 0 12px", color: "rgba(255,255,255,0.75)", fontSize: 13, lineHeight: 1.5 }}>
                Creators who post consistently don’t guess their hooks.
                <br />
                They generate them.
              </p>

              <button type="button" className="create-generate-btn" onClick={handleUpgrade} disabled={loading}>
                {loading ? "Opening checkout..." : "Unlock unlimited hooks — $19/mo"}
              </button>

              <p style={{ margin: "10px 0 0", fontSize: 12, color: "rgba(255,255,255,0.55)" }}>
                Cancel anytime. One viral video pays for this 100×.
              </p>
            </div>
          )}

          {(result || editedUrl) && !error && !limitReached && (
            <div className="create-result">
              <h3>Hooks</h3>

              {editedUrl && (
                <p style={{ marginBottom: 8 }}>
                  <strong>Clip:</strong>{" "}
                  <a href={editedUrl} target="_blank" rel="noreferrer">
                    Open
                  </a>
                </p>
              )}

              {result && (
                <>
                  <strong>Output:</strong>
                  <pre>{result}</pre>
                </>
              )}
            </div>
          )}
        </div>
      </section>

      <section className="create-tiles-section">
        <div className="create-tiles-grid">
          <article className="create-tile">
            <h2>Hooks</h2>
            <p>Scroll-stopping hook lines</p>
          </article>

          <article className="create-tile">
            <h2>Captions</h2>
            <p>3 captions + 1 CTA per video</p>
          </article>

          <article className="create-tile">
            <h2>Flow</h2>
            <p>Opening delivery + video structure</p>
          </article>
        </div>
      </section>
    </main>
  );
}
