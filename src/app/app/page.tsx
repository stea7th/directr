"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@supabase/supabase-js";

// ---- Supabase browser client (uses your public env keys) ----
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
);

// ---- Types ----
type Job = {
  id: string;
  status: "queued" | "processing" | "done" | "error";
  error?: string | null;
  input_path?: string | null;
  output_path?: string | null;
  created_at?: string;
  options?: any;
};

const FONTS = ["Inter", "Anton", "Montserrat", "Poppins", "Bebas Neue"];
const STYLES = ["Classic White", "Shadow", "Outline", "Glow"];
const POSITIONS = ["Bottom", "Top", "Center"];

export default function CreatePage() {
  const [file, setFile] = useState<File | null>(null);
  const [font, setFont] = useState(FONTS[0]);
  const [size, setSize] = useState(72);
  const [style, setStyle] = useState(STYLES[0]);
  const [position, setPosition] = useState(POSITIONS[0]);
  const [busy, setBusy] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [hovering, setHovering] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // ---- Get user (if you use Supabase Auth) ----
  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      setUserId(data.user?.id ?? null);
    })();
  }, []);

  // ---- Load jobs for the current user ----
  const loadJobs = useCallback(async (uid: string | null) => {
    const query = supabase.from("jobs").select("*").order("created_at", { ascending: false }).limit(25);
    const { data, error } = uid ? await query.eq("user_id", uid) : await query;
    if (!error && data) setJobs(data as Job[]);
  }, []);

  useEffect(() => {
    loadJobs(userId);
  }, [userId, loadJobs]);

  // ---- Upload + enqueue job ----
  const handleUpload = useCallback(async () => {
    if (!file) {
      alert("Choose a file first");
      return;
    }
    setBusy(true);
    try {
      // 1) Upload to storage
      const ext = file.name.split(".").pop()?.toLowerCase() || "mp4";
      const objectName = `${crypto.randomUUID()}.${ext}`;
      const storagePath = `${userId ?? "anon"}/${objectName}`;

      const { error: upErr } = await supabase.storage.from("videos").upload(storagePath, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type || "video/mp4",
      });
      if (upErr) throw upErr;

      // 2) Insert job row (worker picks it up)
      const opts = { font, size, style, position };
      const { error: insErr } = await supabase.from("jobs").insert({
        user_id: userId,
        input_path: storagePath,
        status: "queued",
        options: opts,
      });
      if (insErr) throw insErr;

      setFile(null);
      if (inputRef.current) inputRef.current.value = "";
      await loadJobs(userId);
    } catch (e: any) {
      alert(e?.message ?? "Upload failed");
    } finally {
      setBusy(false);
    }
  }, [file, userId, font, size, style, position, loadJobs]);

  // ---- Get a signed download URL for an output path ----
  const getSigned = useCallback(async (path: string) => {
    const { data, error } = await supabase.storage.from("videos").createSignedUrl(path, 600);
    if (error) throw error;
    return data.signedUrl as string;
  }, []);

  // ---- Accent helpers ----
  const Pill = ({ status }: { status: Job["status"] }) => {
    const map: Record<Job["status"], string> = {
      done: "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30",
      processing: "bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/30",
      queued: "bg-sky-500/15 text-sky-300 ring-1 ring-sky-500/30",
      error: "bg-rose-500/15 text-rose-300 ring-1 ring-rose-500/30",
    };
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${map[status]}`}>
        {status}
      </span>
    );
  };

  const onDropAreaClick = () => inputRef.current?.click();

  const humanCreatedAt = (created?: string) =>
    created ? new Date(created).toLocaleString() : "";

  const dropClasses = useMemo(
    () =>
      [
        "rounded-2xl border border-white/10",
        "bg-gradient-to-b from-zinc-900/60 to-zinc-900/30",
        hovering ? "ring-2 ring-sky-500 shadow-[0_0_40px_-10px_rgba(56,189,248,.5)]" : "ring-1 ring-white/5",
        "transition-all duration-200 cursor-pointer",
      ].join(" "),
    [hovering]
  );

  return (
    <div className="min-h-[calc(100vh-56px)] w-full bg-gradient-to-b from-neutral-950 to-neutral-900">
      <div className="mx-auto max-w-6xl px-4 py-10">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tight text-white">Create</h1>
          <div className="text-sm text-white/40">Upload a video → get a captioned, social-ready clip back.</div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* LEFT: Upload & Options */}
          <section className={`${dropClasses} p-5`}>
            {/* Drop area */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setHovering(true);
              }}
              onDragLeave={() => setHovering(false)}
              onDrop={(e) => {
                e.preventDefault();
                setHovering(false);
                const f = e.dataTransfer.files?.[0];
                if (f) setFile(f);
              }}
              onClick={onDropAreaClick}
              className="flex h-36 items-center justify-center rounded-xl bg-neutral-900/50"
            >
              <input
                ref={inputRef}
                type="file"
                accept="video/*"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
              <div className="text-center">
                <div className="text-white/90">
                  {file ? (
                    <span className="font-medium">{file.name}</span>
                  ) : (
                    <span className="font-medium">
                      Drag & drop your video or{" "}
                      <span className="text-sky-400 underline underline-offset-4">browse</span>
                    </span>
                  )}
                </div>
                <div className="text-xs text-white/40 mt-1">MP4 recommended</div>
              </div>
            </div>

            {/* Options */}
            <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
              <Select label="Font" value={font} onChange={setFont} items={FONTS} />
              <NumberField label="Size" value={size} onChange={setSize} />
              <Select label="Style" value={style} onChange={setStyle} items={STYLES} />
              <Select label="Position" value={position} onChange={setPosition} items={POSITIONS} />
            </div>

            {/* Actions */}
            <div className="mt-5 flex items-center gap-3">
              <button
                onClick={handleUpload}
                disabled={busy || !file}
                className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-4 py-2 text-sm font-medium text-black hover:bg-sky-400 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_10px_30px_-12px_rgba(56,189,248,.6)] transition"
              >
                {busy ? (
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-black/20 border-t-black" />
                ) : (
                  <Lightning />
                )}
                {busy ? "Uploading…" : "Upload & Process"}
              </button>

              <button
                onClick={() => loadJobs(userId)}
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10 transition"
              >
                Refresh
              </button>
            </div>
          </section>

          {/* RIGHT: Jobs */}
          <section className="rounded-2xl border border-white/10 bg-neutral-900/50 p-5 ring-1 ring-white/5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Your recent jobs</h2>
              <button
                onClick={() => loadJobs(userId)}
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/80 hover:bg-white/10 transition"
              >
                Refresh
              </button>
            </div>

            <div className="space-y-3">
              {jobs.length === 0 && (
                <div className="rounded-xl border border-white/10 bg-neutral-900/60 p-4 text-sm text-white/50">
                  No jobs yet.
                </div>
              )}

              {jobs.map((j) => (
                <div
                  key={j.id}
                  className="rounded-xl border border-white/10 bg-neutral-900/60 p-4 ring-1 ring-white/5 hover:ring-sky-500/40 transition"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm text-white/70">Job</div>
                      <div className="text-white/90 break-all">{j.id}</div>
                      {j.created_at && (
                        <div className="mt-1 text-xs text-white/40">{humanCreatedAt(j.created_at)}</div>
                      )}
                    </div>
                    <Pill status={j.status} />
                  </div>

                  {j.error && (
                    <div className="mt-2 text-sm text-rose-300">Error: {String(j.error)}</div>
                  )}

                  <div className="mt-3">
                    {j.output_path ? (
                      <DownloadButton getUrl={() => getSigned(j.output_path!)} />
                    ) : (
                      <button
                        disabled
                        className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/40"
                      >
                        No video yet
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Footer */}
        <footer className="mx-auto mt-10 max-w-6xl border-t border-white/5 pt-6 text-xs text-white/40">
          © {new Date().getFullYear()} Directr —{" "}
          <a href="/privacy" className="text-sky-400 hover:underline">
            Privacy
          </a>{" "}
          ·{" "}
          <a href="/terms" className="text-sky-400 hover:underline">
            Terms
          </a>
        </footer>
      </div>
    </div>
  );
}

// ---- Small UI helpers (no external deps) ----
function Select({
  label,
  value,
  onChange,
  items,
}: {
  label: string;
  value: string;
  items: string[];
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <div className="mb-1 text-xs text-white/50">{label}</div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-white/10 bg-neutral-900/70 px-3 py-2 text-sm text-white/90 outline-none ring-1 ring-white/5 hover:ring-sky-500/30 focus:ring-sky-500/50 transition"
      >
        {items.map((i) => (
          <option key={i} value={i}>
            {i}
          </option>
        ))}
      </select>
    </label>
  );
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <label className="block">
      <div className="mb-1 text-xs text-white/50">{label}</div>
      <input
        type="number"
        min={24}
        max={120}
        step={2}
        value={value}
        onChange={(e) => onChange(globalThis.Number(e.target.value || 0))}
        className="w-full rounded-xl border border-white/10 bg-neutral-900/70 px-3 py-2 text-sm text-white/90 outline-none ring-1 ring-white/5 hover:ring-sky-500/30 focus:ring-sky-500/50 transition"
      />
    </label>
  );
}

function DownloadButton({ getUrl }: { getUrl: () => Promise<string> }) {
  const [downloading, setDownloading] = useState(false);

  const click = async () => {
    setDownloading(true);
    try {
      const url = await getUrl();
      window.location.href = url;
    } finally {
      setDownloading(false);
    }
  };

  return (
    <button
      onClick={click}
      disabled={downloading}
      className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white hover:bg-white/10 transition disabled:opacity-60"
    >
      {downloading ? (
        <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />
      ) : (
        <ArrowDown />
      )}
      Download video
    </button>
  );
}

// Tiny inline icons so you don’t need another library
function Lightning() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
      <path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" />
    </svg>
  );
}
function ArrowDown() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
      <path d="M12 3v14m0 0l-5-5m5 5l5-5M5 21h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
