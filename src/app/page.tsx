// src/app/page.tsx
"use client";

import React, { useCallback, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type NewJobPayload = {
  title: string;
  type: string;          // e.g., "hooks" | "clip" | "caption" | "resize" | "auto"
  input_url?: string | null;
  prompt?: string | null;
};

const uid = () =>
  typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

export default function HomePage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [prompt, setPrompt] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // --- Drag & drop handlers ---
  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const f = e.dataTransfer.files?.[0];
    if (f) setFile(f);
  }, []);

  const onPick = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setFile(f);
  }, []);

  const clearError = () => setErr(null);

  // --- Storage upload ---
  const uploadToSupabase = useCallback(
    async (f: File): Promise<string> => {
      // Try to use the signed-in user id for namespacing; fall back to "anon"
      const { data: auth } = await supabase.auth.getUser();
      const userId = auth?.user?.id ?? "anon";
      const ext = f.name.includes(".") ? f.name.split(".").pop()!.toLowerCase() : "bin";
      const key = `${userId}/${uid()}.${ext}`;

      // Use your PUBLIC bucket name here (must exist & be public)
      const bucket = "uploads";

      const { error: upErr } = await supabase.storage.from(bucket).upload(key, f, {
        cacheControl: "3600",
        upsert: false,
      });
      if (upErr) throw new Error(`Upload failed: ${upErr.message}`);

      const { data: pub } = supabase.storage.from(bucket).getPublicUrl(key);
      if (!pub?.publicUrl) throw new Error("Could not get public URL for upload.");

      return pub.publicUrl;
    },
    [supabase]
  );

  // --- Create job via API then navigate to job page ---
  const generate = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault?.();
      clearError();

      if (!prompt.trim() && !file) {
        setErr("Type what you want or add a file.");
        return;
      }

      setBusy(true);
      try {
        // Upload file (if present) to storage and get URL
        let inputUrl: string | undefined;
        if (file) {
          inputUrl = await uploadToSupabase(file);
        }

        // Infer a simple type. Adjust if you have a selector later.
        // If there's a file: default to "auto" (server decides what to do).
        // If no file: assume "hooks" so you get text output.
        const inferredType = file ? "auto" : "hooks";

        const payload: NewJobPayload = {
          title: "Untitled Job",
          type: inferredType,
          input_url: inputUrl ?? null,
          prompt: prompt.trim() || null,
        };

        const res = await fetch("/api/jobs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || `Job create failed (${res.status})`);
        }

        const data = (await res.json()) as { id: string };
        // Send user to the live job page to watch progress & get download link when done
        router.push(`/jobs/${data.id}`);
      } catch (e: any) {
        setErr(e?.message || "Something went wrong creating the job.");
      } finally {
        setBusy(false);
      }
    },
    [file, prompt, router, uploadToSupabase]
  );

  // --- UI ---
  return (
    <main className="min-h-[calc(100vh-72px)] w-full">
      <section className="mx-auto max-w-4xl px-4 pt-12">
        <div className="rounded-2xl border border-neutral-800 bg-neutral-950/60 p-6 md:p-8 shadow-lg">
          <h1 className="text-2xl md:text-3xl font-semibold mb-6">
            Type what you want or upload a file
          </h1>

          <form onSubmit={generate} className="space-y-4">
            <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-3">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onFocus={clearError}
                placeholder="Example: Turn this podcast into 5 viral TikToks"
                className="w-full resize-y rounded-md bg-transparent outline-none p-3 text-sm md:text-base placeholder:text-neutral-500"
                rows={4}
              />
            </div>

            <div
              onDrop={onDrop}
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              className="flex items-center gap-3 rounded-xl border border-dashed border-neutral-800 bg-neutral-900/40 px-3 py-2"
            >
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="rounded-lg border border-neutral-700 px-3 py-2 text-sm hover:bg-neutral-800"
              >
                Choose File / Drop here
              </button>
              <span className="text-sm text-neutral-400">
                {file ? file.name : "Video or audio for caption/clip/resize"}
              </span>
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*,audio/*"
                hidden
                onChange={onPick}
              />
            </div>

            <div className="flex items-center justify-between">
              <p className="text-xs text-neutral-500">
                Tip: Drop a video/audio, or just describe what you want. We’ll handle the rest.
              </p>
              <button
                type="submit"
                disabled={busy}
                className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white disabled:opacity-60"
              >
                {busy ? "Working…" : "Generate"}
              </button>
            </div>

            {err && (
              <div className="rounded-lg border border-red-900/60 bg-red-950/40 p-3 text-sm text-red-300">
                {err}
              </div>
            )}
          </form>
        </div>

        {/* optional quick cards – purely visual, keep or remove */}
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <Card title="Create" desc="Upload → get captioned clips" />
          <Card title="Clipper" desc="Auto-find hooks & moments" />
          <Card title="Planner" desc="Plan posts & deadlines" />
        </div>
      </section>
    </main>
  );
}

function Card({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-950/40 p-5">
      <div className="text-lg font-semibold">{title}</div>
      <div className="mt-1 text-sm text-neutral-400">{desc}</div>
    </div>
  );
}
