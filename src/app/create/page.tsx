"use client";

import "./page.css";
import React, { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";

type Mode = "quick" | "blueprint";

type PlanState = {
  loading: boolean;
  isPro: boolean;
  used: number;
  freeLimit: number;
};

type CreatorVoice =
  | "Calm & minimal"
  | "High-energy & expressive"
  | "Direct / no-BS"
  | "Story-first"
  | "Authority / teacher"
  | "Raw & conversational";

type AudienceLevel = "Beginner" | "Aware but stuck" | "Advanced / niche";

type HookAngle =
  | "Call-out"
  | "Pattern interrupt"
  | "Contrarian"
  | "Curiosity gap"
  | "Relatable mistake"
  | "Proof-based"
  | "Identity-based";

type CtaIntent = "Comments" | "Follows" | "Saves" | "DM replies" | "Click link";

export default function CreatePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const upgraded = searchParams.get("upgraded") === "1";
  const canceled = searchParams.get("canceled") === "1";

  const [mode, setMode] = useState<Mode>("quick");
  const [prompt, setPrompt] = useState("");

  // Quick mode minimal defaults (still used by Blueprint too)
  const [platform, setPlatform] = useState("TikTok");
  const [goal, setGoal] = useState("Get more views, drive sales, grow page, etc.");
  const [lengthSeconds, setLengthSeconds] = useState("30");

  // ✅ New Blueprint controls
  const [voice, setVoice] = useState<CreatorVoice>("Raw & conversational");
  const [audienceLevel, setAudienceLevel] = useState<AudienceLevel>("Aware but stuck");
  const [hookAngles, setHookAngles] = useState<HookAngle[]>(["Curiosity gap"]);
  const [ctaIntent, setCtaIntent] = useState<CtaIntent>("Comments");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [limitReached, setLimitReached] = useState(false);

  const [result, setResult] = useState<string | null>(null);

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

      const { data, error } = await supabase.auth.getSession();
      if (error) console.error("getSession error:", error);

      const authed = !!data?.session?.user;
      setIsAuthed(authed);

      if (authed) setShowSignin(false);
    } catch (e) {
      console.error("refreshAuth error:", e);
      setIsAuthed(false);
    } finally {
      setAuthLoading(false);
    }
  }

  async function requireAuthOrPopup(): Promise<boolean> {
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
    refreshAuth();
    refreshPlan();

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      const authed = !!session?.user;
      setIsAuthed(authed);
      setAuthLoading(false);
      if (authed) setShowSignin(false);
      refreshPlan();
    });

    return () => {
      data?.subscription?.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function toggleHookAngle(angle: HookAngle) {
    setError(null);

    setHookAngles((prev) => {
      const exists = prev.includes(angle);

      // remove if exists
      if (exists) return prev.filter((a) => a !== angle);

      // add if room
      if (prev.length >= 2) {
        setError("Pick up to 2 hook angles.");
        return prev;
      }

      return [...prev, angle];
    });
  }

  async function handleGenerate() {
    setError(null);
    setLimitReached(false);
    setResult(null);

    const ok = await requireAuthOrPopup();
    if (!ok) return;

    if (!prompt.trim()) {
      setError("Add a quick idea first.");
      return;
    }

    // Blueprint: ensure at least 1 angle picked
    if (mode === "blueprint" && hookAngles.length === 0) {
      setError("Pick at least 1 hook angle.");
      return;
    }

    setLoading(true);
    try {
      const body =
        mode === "blueprint"
          ? {
              prompt,
              platform,
              goal,
              lengthSeconds,
              // ✅ new blueprint fields
              voice,
              audienceLevel,
              hookAngles,
              ctaIntent,
              mode: "blueprint",
            }
          : {
              prompt,
              platform,
              goal,
              lengthSeconds,
              mode: "quick",
            };

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
        setError(data.error || "Failed to generate.");
        return;
      }

      setResult(data?.text || "Generated successfully, but no output was returned.");
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

  const generateLabel =
    loading ? "Building your plan..." : mode === "blueprint" ? "Generate a blueprint" : "Generate hooks";

  return (
    <main className="create-root">
      {/* ✅ Sign-in popup */}
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
          <div className="card" style={{ maxWidth: 520, width: "100%" }} onClick={(e) => e.stopPropagation()}>
            <div className="card__head">
              <div>
                <div className="title">Please sign in first</div>
                <div className="subtitle">Create an account in seconds. Then generate your plan.</div>
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

            <button type="button" className="btn btn--ghost" style={{ width: "100%" }} onClick={() => setShowSignin(false)}>
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
                <span style={{ fontSize: 12, color: "rgba(160, 255, 200, 0.9)" }}>✅ Payment received — Pro is active</span>
              )}

              {canceled && (
                <span style={{ fontSize: 12, color: "rgba(255, 190, 120, 0.9)" }}>Checkout canceled — you can upgrade anytime</span>
              )}
            </div>
          </div>

          <div className="create-mode-toggle">
            <button
              type="button"
              className={`create-mode-btn ${mode === "quick" ? "create-mode-btn--active" : ""}`}
              onClick={() => setMode("quick")}
            >
              Quick
            </button>
            <button
              type="button"
              className={`create-mode-btn ${mode === "blueprint" ? "create-mode-btn--active" : ""}`}
              onClick={() => setMode("blueprint")}
            >
              Blueprint
            </button>
          </div>
        </header>

        <div className={`create-main-card ${loading ? "is-loading" : ""}`}>
          <div className="create-textarea-wrap">
            <textarea
              name="prompt"
              className="create-textarea"
              placeholder={
                mode === "blueprint"
                  ? "Paste your idea + what the video is about. (One sentence is enough.)"
                  : "Example: Give me 10 scroll-stopping hooks for a video about (topic)."
              }
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </div>

          {/* ✅ Blueprint controls */}
          {mode === "blueprint" && (
            <div className="create-advanced-row">
              <div className="create-adv-field">
                <label>Platform</label>
                <select value={platform} onChange={(e) => setPlatform(e.target.value)}>
                  <option value="TikTok">TikTok</option>
                  <option value="Instagram Reels">Instagram Reels</option>
                  <option value="YouTube Shorts">YouTube Shorts</option>
                  <option value="All platforms">All platforms</option>
                </select>
              </div>

              <div className="create-adv-field">
                <label>Primary goal</label>
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
                <label>Creator voice</label>
                <select value={voice} onChange={(e) => setVoice(e.target.value as CreatorVoice)}>
                  <option value="Calm & minimal">Calm & minimal</option>
                  <option value="High-energy & expressive">High-energy & expressive</option>
                  <option value="Direct / no-BS">Direct / no-BS</option>
                  <option value="Story-first">Story-first</option>
                  <option value="Authority / teacher">Authority / teacher</option>
                  <option value="Raw & conversational">Raw & conversational</option>
                </select>
              </div>

              <div className="create-adv-field">
                <label>Audience level</label>
                <select value={audienceLevel} onChange={(e) => setAudienceLevel(e.target.value as AudienceLevel)}>
                  <option value="Beginner">Beginner</option>
                  <option value="Aware but stuck">Aware but stuck</option>
                  <option value="Advanced / niche">Advanced / niche</option>
                </select>
              </div>

              <div className="create-adv-field">
                <label>Primary CTA</label>
                <select value={ctaIntent} onChange={(e) => setCtaIntent(e.target.value as CtaIntent)}>
                  <option value="Comments">Comments</option>
                  <option value="Follows">Follows</option>
                  <option value="Saves">Saves</option>
                  <option value="DM replies">DM replies</option>
                  <option value="Click link">Click link</option>
                </select>
              </div>

              <div className="create-adv-field" style={{ gridColumn: "1 / -1" }}>
                <label>Hook angle (pick up to 2)</label>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                    gap: 10,
                  }}
                >
                  {(
                    [
                      "Call-out",
                      "Pattern interrupt",
                      "Contrarian",
                      "Curiosity gap",
                      "Relatable mistake",
                      "Proof-based",
                      "Identity-based",
                    ] as HookAngle[]
                  ).map((angle) => {
                    const checked = hookAngles.includes(angle);
                    return (
                      <button
                        key={angle}
                        type="button"
                        onClick={() => toggleHookAngle(angle)}
                        className="btn btn--ghost"
                        style={{
                          justifyContent: "flex-start",
                          borderRadius: 12,
                          padding: "10px 12px",
                          border: checked ? "1px solid rgba(148,202,255,0.55)" : "1px solid rgba(255,255,255,0.12)",
                          background: checked
                            ? "radial-gradient(circle at 0 0, rgba(148,202,255,0.25), rgba(47,79,130,0.18)), rgba(0,0,0,0.25)"
                            : "rgba(0,0,0,0.18)",
                          color: checked ? "rgba(235,245,255,0.95)" : "rgba(255,255,255,0.78)",
                          fontSize: 12,
                          fontWeight: 600,
                        }}
                      >
                        <span style={{ marginRight: 8, opacity: 0.9 }}>{checked ? "✓" : "•"}</span>
                        {angle}
                      </button>
                    );
                  })}
                </div>

                <div style={{ marginTop: 8, fontSize: 12, color: "rgba(255,255,255,0.55)" }}>
                  Included in every plan: hooks • best pick • delivery notes • video flow • shot list • captions + CTA
                </div>
              </div>
            </div>
          )}

          {/* Bottom row */}
          <div className="create-bottom-row">
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, width: "100%" }}>
              <button type="button" className="create-generate-btn" onClick={handleGenerate} disabled={loading}>
                {generateLabel}
              </button>

              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.55)" }}>
                {plan.isPro ? "✅ Pro active • unlimited generations" : "3 free generations • then $19/mo for unlimited hooks"}
              </span>
            </div>
          </div>

          <p className="create-tip">
            Tip: Quick = fast hook ideas. Blueprint = full plan (voice + angles + CTA) so you can film immediately.
          </p>

          {error && <p className="create-error">{error}</p>}

          {/* Paywall */}
          {limitReached && !error && !plan.isPro && (
            <div className="create-result">
              <h3>You’ve used your free hooks.</h3>
              <p style={{ margin: "8px 0 12px", color: "rgba(255,255,255,0.75)", fontSize: 13, lineHeight: 1.5 }}>
                Stop guessing what to say.
                <br />
                Generate a plan and post.
              </p>

              <button type="button" className="create-generate-btn" onClick={handleUpgrade} disabled={loading}>
                {loading ? "Opening checkout..." : "Unlock unlimited hooks — $19/mo"}
              </button>

              <p style={{ margin: "10px 0 0", fontSize: 12, color: "rgba(255,255,255,0.55)" }}>
                Cancel anytime. One good post pays for this.
              </p>
            </div>
          )}

          {result && !error && !limitReached && (
            <div className="create-result">
              <h3>Output</h3>
              <pre>{result}</pre>
            </div>
          )}
        </div>
      </section>

      {/* Tiles */}
      <section className="create-tiles-section">
        <div className="create-tiles-grid">
          <article className="create-tile">
            <h2>Quick</h2>
            <p>Fast hook ideas when you just need options.</p>
          </article>

          <article className="create-tile">
            <h2>Blueprint</h2>
            <p>Voice + angles + CTA → a full filming plan you can execute.</p>
          </article>

          <article className="create-tile">
            <h2>Post faster</h2>
            <p>Less guessing. More shipping.</p>
          </article>
        </div>
      </section>
    </main>
  );
}
