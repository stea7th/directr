"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@supabase/supabase-js";

// ---- Supabase (browser) — public keys only ----
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Heuristics so users don’t need to pick a “type”
function inferJobType(prompt: string, hasFile: boolean): "hooks" | "caption" | "clip" | "resize" {
  const p = prompt.toLowerCase();
  if (!hasFile) return "hooks";
  if (/(caption|subtitle|transcribe|transcript|srt|vtt)/i.test(p)) return "caption";
  if (/(clip|highlights|cut|short|snippet)/i.test(p)) return "clip";
  if (/(resize|9:16|vertical|portrait|reformat)/i.test(p)) return "resize";
  // default when a file exists but user is vague
  return "caption";
}

export default function HomePage() {
  const [prompt, setPrompt] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploadPct, setUploadPct] = useState<number>(0);
  const [busy, setBusy] = useState(false);

  const [jobId, setJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<"queued" | "processing" | "done" | "error" | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const pollRef = useRef<NodeJS.Timeout | null>(null);

  // ---------- Upload to Supabase (public bucket "uploads") ----------
  const uploadToSupabase = useCallback(
    async (f: File): Promise<string> => {
      // progress UI: we can’t get native % with supabase-js yet; fake smooth ramp
      setUploadPct(5);
      const key = `${Date.now()}-${f.name}`.replace(/\s+/g, "_");
      // Small progressive animation
      const anim = setInterval(() => setUploadPct((p) => Math.min(95, p + 1)), 120);

      const { error } = await supabase.storage.from("uploads").upload(key, f, {
        cacheControl: "3600",
        upsert: false,
        contentType: f.type || undefined,
      });

      clearInterval(anim);
      if (error) throw new Error(error.message);

      const { data } = supabase.storage.from("uploads").getPublicUrl(key);
      setUploadPct(100);
      return data.publicUrl;
    },
    []
  );

  // ---------- Create job + poll until finished ----------
  const submit = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault();
      setBusy(true);
      setErrorMsg(null);
      setResultUrl(null);
      setJobId(null);
      setJobStatus(null);
      setUploadPct(0);

      try {
        // 1) Decide job type
        const type = inferJobType(prompt, !!file);

        // 2) Upload (only if we actually need a file for this kind of job)
        let input_url: string | undefined;
        if (file && type !== "hooks") {
          input_url = await uploadToSupabase(file);
        }

        // 3) Create job (server decides the rest)
        const res = await fetch("/api/jobs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: "Untitled Job",
            prompt: prompt || undefined,
            input_url,
            type, // "hooks" | "caption" | "clip" | "resize"
          }),
        });

        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || "Failed to create job");

        const id: string = json.id;
        setJobId(id);
        setJobStatus("queued");

        // 4) Poll for completion
        if (pollRef.current) clearInterval(pollRef.current);
        pollRef.current = setInterval(async () => {
          try {
            const r = await fetch(`/api/jobs/${id}`, { cache: "no-store" });
            const j = await r.json();

            if (j?.status) setJobStatus(j.status);
            if (j?.error) setErrorMsg(j.error);

            if (j?.result_url) {
              setResultUrl(j.result_url);
            }

            if (j?.status === "done" || j?.status === "error") {
              if (pollRef.current) clearInterval(pollRef.current);
              setBusy(false);
            }
          } catch (err: any) {
            setErrorMsg(err?.message || "Polling failed");
            if (pollRef.current) clearInterval(pollRef.current);
            setBusy(false);
          }
        }, 1200);
      } catch (err: any) {
        setErrorMsg(err?.message || "Something went wrong");
        setBusy(false);
      }
    },
    [file, prompt, uploadToSupabase]
  );

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  // ---------- UI ----------
  return (
    <div className="min-h-screen bg-[#0b0d10] text-zinc-200">
      <header className="px-6 py-4 border-b border-white/5">
        <div className="max-w-4xl mx-auto font-bold text-xl">directr.</div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">
        <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-xl font-semibold mb-4">Type what you want or upload a file</h2>

          <form onSubmit={submit} className="space-y-4">
            <textarea
              className="w-full h-32 rounded-xl border border-white/10 bg-black/40 p-4 outline-none focus:border-blue-500/60"
              placeholder="Example: Turn this podcast into 5 viral TikToks with captions and timestamps."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />

            {/* File picker / drop zone */}
            <label
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const f = e.dataTransfer.files?.[0];
                if (f) setFile(f);
              }}
              className="flex items-center justify-between gap-3 rounded-xl border border-dashed border-white/15 bg-black/30 p-3"
            >
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-white/10">📁</span>
                <div className="text-sm">
                  <div className="font-medium">{file ? file.name : "Choose file / Drop here"}</div>
                  <div className="opacity-60">
                    {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : "Video or audio for caption/clip/resize"}
                  </div>
                </div>
              </div>
              <input
                type="file"
                accept="video/*,audio/*"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="hidden"
                id="file-input"
              />
              <label
                htmlFor="file-input"
                className="px-3 py-2 bg-white/10 rounded-lg text-sm cursor-pointer hover:bg-white/15"
              >
                Browse
              </label>
            </label>

            {/* Upload progress (only when uploading) */}
            {busy && uploadPct > 0 && uploadPct < 100 && (
              <div className="w-full bg-white/5 rounded-lg h-2 overflow-hidden">
                <div
                  className="bg-blue-500 h-2 transition-all"
                  style={{ width: `${uploadPct}%` }}
                />
              </div>
            )}

            {/* Action + state */}
            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={busy}
                className={`px-5 py-2 rounded-lg font-semibold ${
                  busy ? "bg-slate-600 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-500"
                }`}
              >
                {busy ? "Working…" : "Generate"}
              </button>

              {jobStatus && (
                <div className="text-sm opacity-80">
                  Status: <span className="font-medium">{jobStatus}</span>
                  {jobId ? <span className="opacity-60"> · {jobId.slice(0, 8)}</span> : null}
                </div>
              )}
            </div>

            {/* Result */}
            {resultUrl && jobStatus === "done" && (
              <div className="mt-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                <div className="mb-2 font-medium">Your file is ready.</div>
                <div className="flex items-center gap-3">
                  <a
                    href={resultUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-sm font-semibold"
                  >
                    Download
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      setPrompt("");
                      setFile(null);
                      setUploadPct(0);
                      setJobId(null);
                      setJobStatus(null);
                      setResultUrl(null);
                      setErrorMsg(null);
                    }}
                    className="px-3 py-2 bg-white/10 hover:bg-white/15 rounded-lg text-sm"
                  >
                    New job
                  </button>
                </div>
              </div>
            )}

            {/* Error */}
            {errorMsg && (
              <div className="mt-2 p-3 rounded-lg bg-rose-600/10 border border-rose-600/30 text-rose-200">
                {errorMsg}
              </div>
            )}
          </form>
        </section>
      </main>
    </div>
  );
}
