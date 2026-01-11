// src/app/create/page.tsx
"use client";

import "./page.css";
import React, { useEffect, useMemo, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { useRouter, useSearchParams } from "next/navigation";

type Mode = "basic" | "advanced";

type PlanState = {
  loading: boolean;
  isPro: boolean;
  used: number;
  freeLimit: number;
};

function isAuthErrorCode(code: any) {
  return (
    code === "unauthorized" ||
    code === "signin_required" ||
    code === "auth_getUser_failed" ||
    code === "invalid_jwt" ||
    code === "bad_jwt"
  );
}

export default function CreatePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const upgraded = searchParams.get("upgraded") === "1";
  const canceled = searchParams.get("canceled") === "1";

  const [mode, setMode] = useState<Mode>("basic");
  const [prompt, setPrompt] = useState("");
  const [platform, setPlatform] = useState("TikTok");
  const [goal, setGoal] = useState("Get more views, drive sales, grow page, etc.");
  const [lengthSeconds, setLengthSeconds] = useState("30");
  const [tone, setTone] = useState("Casual");
  const [file, setFile] = useState<File | null>(null);

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

  // ✅ auth popup (used when logged out / auth breaks)
  const [authOpen, setAuthOpen] = useState(false);
  const [authMsg, setAuthMsg] = useState("Please sign in first to use Directr.");
  const [authNext, setAuthNext] = useState("/create");

  function openAuthPopup(message?: string, next?: string) {
    setAuthMsg(message || "Please sign in first to use Directr.");
    setAuthNext(next || "/create");
    setAuthOpen(true);
  }

  function closeAuthPopup() {
    setAuthOpen(false);
  }

  const statusLine = useMemo(() => {
    if (plan.loading) return "Checking your plan…";
    if (plan.isPro) return "✅ Pro unlocked • unlimited hooks";
    return `${Math.min(plan.used, plan.freeLimit)} / ${plan.freeLimit} free generations used • then $19/mo`;
  }, [plan.loading, plan.isPro, plan.used, plan.freeLimit]);

  async function refreshPlan() {
    try {
      setPlan((p) => ({ ...p, loading: true }));

      const { data, error: getUserErr } = await supabaseBrowser.auth.getUser();

      if (getUserErr || !data?.user) {
        // treat as logged out, do NOT show an error
        setPlan({ loading: false, isPro: false, used: 0, freeLimit: 3 });
        return;
      }

      const user = data.user;

      const { data: profile, error: profileErr } = await supabaseBrowser
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

      // If pro, never show paywall UI state
      if (isPro) setLimitReached(false);
    } catch (e) {
      console.error("refreshPlan error:", e);
      setPlan((p) => ({ ...p, loading: false }));
    }
  }

  useEffect(() => {
    refreshPlan();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function requireAuthOrPopup(next = "/create") {
    const { data, error: getUserErr } = await supabaseBrowser.auth.getUser();
    if (getUserErr || !data?.user) {
      openAuthPopup("Please sign in first to use Directr.", next);
      return null;
    }
    return data.user;
  }

  async function handleGenerate() {
    setError(null);
    setLimitReached(false);
    setResult(null);
    setEditedUrl(null);

    if (!prompt.trim() && !file) {
      setError("Add a quick idea or upload a file first.");
      return;
    }

    setLoading(true);
    try {
      // ✅ ALWAYS require auth before doing anything (prevents confusing red errors)
      const user = await requireAuthOrPopup("/create");
      if (!user) return;

      // CASE 1: FILE PRESENT → upload to Supabase → send URL to /api/clipper
      if (file) {
        const path = `${Date.now()}-${file.name}`;

        const { data: uploadData, error: uploadError } =
          await supabaseBrowser.storage.from("raw_uploads").upload(path, file, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError || !uploadData) {
          console.error("Supabase upload error:", uploadError);
          setError("Failed to upload file. Try a smaller file or different format.");
          return;
        }

        const {
          data: { publicUrl },
        } = supabaseBrowser.storage.from("raw_uploads").getPublicUrl(uploadData.path);

        const res = await fetch("/api/clipper", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fileUrl: publicUrl, prompt }),
        });

        // handle limit reached
        if (res.status === 402) {
          setLimitReached(true);
          await refreshPlan();
          return;
        }

        // ✅ handle auth required
        if (res.status === 401) {
          openAuthPopup("Please sign in first to use Directr.", "/create");
          return;
        }

        const contentType = res.headers.get("content-type") || "";
        if (!contentType.includes("application/json")) {
          const text = await res.text();
          console.error("Non-JSON response from /api/clipper:", {
            status: res.status,
            textSnippet: text.slice(0, 200),
          });
          setError(`Server returned non-JSON (status ${res.status}). Route might be misconfigured.`);
          return;
        }

        const data = await res.json();

        // ✅ if auth breaks, popup instead of red error
        if (!data?.success && isAuthErrorCode(data?.error)) {
          openAuthPopup(data?.message || "Please sign in first to use Directr.", "/create");
          return;
        }

        if (!data.success) {
          if (data?.error === "limit_reached") {
            setLimitReached(true);
            await refreshPlan();
            return;
          }

          if (isAuthErrorCode(data?.error)) {
            openAuthPopup(data?.message || "Please sign in first to use Directr.", "/create");
            return;
          }

          setError(data.error || "Failed to find hooks.");
          return;
        }

        const transcript: string = data.transcript || "";
        const clips: any[] = Array.isArray(data.clips) ? data.clips : [];

        let text = "";

        if (transcript) {
          text += "TRANSCRIPT\n──────────\n";
          text += transcript.trim();
          text += "\n\n";
        }

        if (clips.length > 0) {
          text += "HOOKS + MOMENTS\n──────────────\n";
          text += clips
            .map((clip, idx) => {
              const start = clip.start ?? clip.start_seconds ?? 0;
              const end = clip.end ?? clip.end_seconds ?? 0;
              const hook = clip.hook_line || "";
              const desc = clip.description || "";

              return [
                `Moment ${idx + 1}`,
                `  Time: ${start.toFixed?.(2) ?? start} → ${end.toFixed?.(2) ?? end}s`,
                hook ? `  Hook: ${hook}` : null,
                desc ? `  Why it works: ${desc}` : null,
              ]
                .filter(Boolean)
                .join("\n");
            })
            .join("\n\n");
        } else {
          text += "No moments were returned, but the transcript is available above.";
        }

        setResult(text);
        setEditedUrl(null);

        await refreshPlan();
        return;
      }

      // CASE 2: NO FILE → hook generator
      const body = { prompt, platform, goal, lengthSeconds, tone };

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.status === 402) {
        setLimitReached(true);
        await refreshPlan();
        return;
      }

      // ✅ handle auth required
      if (res.status === 401) {
        openAuthPopup("Please sign in first to generate hooks.", "/create");
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

      // ✅ if auth breaks, popup instead of red error
      if (!data?.success && isAuthErrorCode(data?.error)) {
        openAuthPopup(data?.message || "Please sign in first to generate hooks.", "/create");
        return;
      }

      if (!data.success) {
        if (data?.error === "limit_reached") {
          setLimitReached(true);
          await refreshPlan();
          return;
        }

        if (isAuthErrorCode(data?.error)) {
          openAuthPopup(data?.message || "Please sign in first to generate hooks.", "/create");
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

      // ✅ if error looks like auth, show popup
      const maybeMsg = String(err?.message || "");
      if (maybeMsg.includes("auth") || maybeMsg.includes("JWT") || maybeMsg.includes("unauthorized")) {
        openAuthPopup("Please sign in first to use Directr.", "/create");
        return;
      }

      setError(err?.message || "Unexpected error.");
    } finally {
      setLoading(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) setFile(f);
  }

  async function handleUpgrade() {
    try {
      setError(null);
      setLoading(true);

      // ✅ require auth before checkout
      const user = await requireAuthOrPopup("/pricing");
      if (!user) return;

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
        const data = await res.json().catch(() => null);
        openAuthPopup(data?.message || "Please sign in first.", "/pricing");
        return;
      }

      const data = await res.json();

      if (!res.ok || !data?.success || !data?.url) {
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

  return (
    <main className="create-root">
      {/* ✅ AUTH POPUP */}
      {authOpen && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={closeAuthPopup}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.55)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: 16,
          }}
        >
          <div
            className="card"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 520,
              borderRadius: 18,
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(8,10,14,0.92)",
              boxShadow: "0 40px 90px rgba(0,0,0,0.85)",
              padding: 18,
            }}
          >
            <div className="card__head" style={{ marginBottom: 10 }}>
              <div>
                <div className="title">Please sign in</div>
                <div className="subtitle">{authMsg}</div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button
                type="button"
                className="btn btn--primary"
                onClick={() => router.push(`/login?next=${encodeURIComponent(authNext)}`)}
                style={{ flex: 1, minWidth: 170 }}
              >
                Sign in / Create account
              </button>

              <button
                type="button"
                className="btn btn--ghost"
                onClick={closeAuthPopup}
                style={{ flex: 1, minWidth: 140 }}
              >
                Not now
              </button>
            </div>

            <div style={{ marginTop: 10, fontSize: 12, opacity: 0.7, lineHeight: 1.4 }}>
              You’ll get 3 free generations after signing in.
            </div>
          </div>
        </div>
      )}

      <section className="create-shell">
        <header className="create-header">
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <h1 style={{ marginBottom: 0 }}>Fix your hook before you post</h1>

            {/* ✅ plan badge line */}
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
              placeholder={
                file
                  ? "Optional: what should viewers feel / do after watching?"
                  : "Example: Give me 10 scroll-stopping hooks for a video about (topic)."
              }
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </div>

          {mode === "advanced" && !file && (
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
            <label className="create-file-bar">
              <span className="create-file-label">
                <span className="create-file-bullet">•</span>
                {file ? file.name : "Choose file / drop here"}
              </span>
              <input type="file" name="file" className="create-file-input" onChange={handleFileChange} />
            </label>

            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
              <button type="button" className="create-generate-btn" onClick={handleGenerate} disabled={loading}>
                {loading ? "Finding hooks..." : file ? "Find hooks from file" : "Generate viral hooks"}
              </button>

              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.55)" }}>
                {plan.isPro ? "✅ Pro active • unlimited generations" : "3 free generations • then $19/mo for unlimited hooks"}
              </span>
            </div>
          </div>

          <p className="create-tip">
            Tip: Drop a video/audio to auto-find the strongest moments + hook lines, or type your idea to generate scroll-stopping hooks.
          </p>

          {/* ✅ Only show red error if it's NOT auth-related */}
          {error && !isAuthErrorCode(error) && <p className="create-error">{error}</p>}

          {/* ✅ CONVERSION PAYWALL CARD */}
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
            <p>Upload → get scroll-stopping hook lines</p>
          </article>

          <article className="create-tile">
            <h2>Moments</h2>
            <p>Auto-find the strongest points to clip</p>
          </article>

          <article className="create-tile">
            <h2>Captions</h2>
            <p>Captions designed to keep viewers watching</p>
          </article>
        </div>
      </section>
    </main>
  );
}
