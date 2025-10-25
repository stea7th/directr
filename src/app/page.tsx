// src/app/page.tsx
"use client";

import React, { useCallback, useMemo, useRef, useState } from "react";
import { createBrowserClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";

type JobType =
  | "hooks"         // Find hooks (GPT)
  | "clip"          // Auto clip
  | "caption"       // Add captions
  | "resize"        // Resize for platforms
  | "transcribe"    // Transcribe only
  | "auto";         // Let the system figure it out

export default function Home() {
  const supabase = createBrowserClient();
  const router = useRouter();

  const [prompt, setPrompt] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState<string>("");
  const [error, setError] = useState<string>("");

  const inputRef = useRef<HTMLInputElement | null>(null);

  const onChoose = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    setFile(e.target.files[0]);
  }, []);

  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) setFile(f);
  }, []);

  const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  function extFromName(name: string) {
    const dot = name.lastIndexOf(".");
    return dot >= 0 ? name.slice(dot + 1).toLowerCase() : "";
  }

  function inferType(promptText: string, fileName?: string): JobType {
    const p = promptText.toLowerCase();
    if (p.includes("hook")) return "hooks";
    if (p.includes("clip")) return "clip";
    if (p.includes("caption") || p.includes("subtitles")) return "caption";
    if (p.includes("resize") || p.includes("tiktok") || p.includes("reel"))
      return "resize";
    if (p.includes("transcrib")) return "transcribe";

    // if the prompt doesn't hint, pick auto and the backend can choose
    return "auto";
  }

  async function ensureSignedIn() {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error || !user) throw new Error("Not signed in.");
    return user;
  }

  async function uploadFileToStorage(userId: string, f: File) {
    setProgress("Uploading file…");
    setIsUploading(true);

    const ext = extFromName(f.name) || "bin";
    const key = `${userId}/${uuidv4()}.${ext}`;

    // Upload to 'inputs' bucket
    const { error: upErr } = await supabase.storage
      .from("inputs")
      .upload(key, f, {
        cacheControl: "3600",
        upsert: false,
      });

    if (upErr) throw upErr;

    // Get a public URL (or you can use signed URL if you prefer)
    const { data } = supabase.storage.from("inputs").getPublicUrl(key);
    const publicUrl = data?.publicUrl;
    if (!publicUrl) throw new Error("Could not create public URL for upload.");

    return publicUrl;
  }

  async function onGenerate() {
    setError("");
    setProgress("");
    setIsGenerating(true);

    try {
      // 1) must be signed in (RLS + uploads)
      const user = await ensureSignedIn();

      // 2) Upload if a file is selected
      let inputUrl = "";
      if (file) {
        inputUrl = await uploadFileToStorage(user.id, file);
      }

      // 3) Pick a job type automatically (backend can also decide)
      const type: JobType = inferType(prompt, file?.name);

      // 4) Create the job on the API
      setProgress("Creating job…");
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Untitled Job",
          type,
          input_url: inputUrl || null,
          prompt: prompt.trim() || null,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Create job failed: ${text || res.status}`);
      }

      const { id } = await res.json();

      // 5) Send user to job page – the worker/backend takes it from here
      router.push(`/jobs/${id}`);
    } catch (e: any) {
      setError(e?.message || "Something went wrong.");
      setIsUploading(false);
      setIsGenerating(false);
      setProgress("");
      return;
    }

    setIsUploading(false);
    setIsGenerating(false);
    setProgress("");
  }

  // Simple, clean UI (tailwind). Matches your screenshot layout.
  return (
    <main className="min-h-screen bg-black text-white">
      <header className="w-full border-b border-white/10">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center gap-4">
          <span className="font-bold">directr.</span>
          <nav className="ml-auto flex items-center gap-6 text-sm text-white/70">
            <a href="/create" className="hover:text-white">Create</a>
            <a href="/campaigns" className="hover:text-white">Campaigns</a>
            <a href="/analytics" className="hover:text-white">Analytics</a>
            <a href="/planner" className="hover:text-white">Planner</a>
            <a href="/settings" className="hover:text-white">Settings</a>
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-4 py-10">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 md:p-8">
          <h1 className="text-xl md:text-2xl font-semibold">
            Type what you want or upload a file
          </h1>

          <div className="mt-6 grid gap-4">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Example: Turn this podcast into 5 viral TikToks"
              className="min-h-[120px] w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 outline-none placeholder:text-white/40 focus:border-white/30"
            />

            <div
              onDrop={onDrop}
              onDragOver={onDragOver}
              className="group flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-white/20 bg-black/30 px-4 py-8 text-center"
            >
              <p className="text-white/80">
                {file ? (
                  <>
                    <span className="font-medium">Selected:</span>{" "}
                    {file.name}
                  </>
                ) : (
                  <>Choose File / Drop here</>
                )}
              </p>
              <p className="text-xs text-white/50">
                Video or audio for caption/clip/resize
              </p>
              <button
                onClick={() => inputRef.current?.click()}
                className="rounded-lg bg-white/10 px-3 py-2 text-sm hover:bg-white/15"
              >
                Browse
              </button>
              <input
                ref={inputRef}
                type="file"
                accept="video/*,audio/*"
                className="hidden"
                onChange={onChoose}
              />
            </div>

            <div className="flex items-center justify-between">
              <p className="text-xs text-white/50">
                Tip: Drop a video/audio, or just describe what you want. We’ll handle the rest.
              </p>

              <button
                disabled={isUploading || isGenerating}
                onClick={onGenerate}
                className="rounded-xl bg-[#3B82F6] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
              >
                {isUploading
                  ? "Uploading…"
                  : isGenerating
                  ? "Creating…"
                  : "Generate"}
              </button>
            </div>

            {(progress || error) && (
              <div className="mt-2 text-sm">
                {progress && <p className="text-white/70">{progress}</p>}
                {error && <p className="text-red-400">{error}</p>}
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <a
            href="/create"
            className="rounded-2xl border border-white/10 bg-white/5 p-5 hover:bg-white/[0.07]"
          >
            <h3 className="font-semibold">Create</h3>
            <p className="mt-1 text-sm text-white/60">Upload → get captioned clips</p>
          </a>
          <a
            href="/clipper"
            className="rounded-2xl border border-white/10 bg-white/5 p-5 hover:bg-white/[0.07]"
          >
            <h3 className="font-semibold">Clipper</h3>
            <p className="mt-1 text-sm text-white/60">Auto-find hooks & moments</p>
          </a>
          <a
            href="/planner"
            className="rounded-2xl border border-white/10 bg-white/5 p-5 hover:bg-white/[0.07]"
          >
            <h3 className="font-semibold">Planner</h3>
            <p className="mt-1 text-sm text-white/60">Plan posts & deadlines</p>
          </a>
        </div>
      </section>
    </main>
  );
}
