"use client";

import React, { useCallback, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

const uid = () =>
  typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

export default function HomePage() {
  const router = useRouter();
  const supabase = useMemo(
    () =>
      createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL as string,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
      ),
    []
  );

  const [prompt, setPrompt] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const uploadToSupabase = async (f: File): Promise<string> => {
    const { data: auth } = await supabase.auth.getUser();
    const userId = auth?.user?.id ?? "anon";
    const ext = f.name.split(".").pop() || "bin";
    const key = `${userId}/${uid()}.${ext}`;
    const bucket = "uploads";

    const { error: upErr } = await supabase.storage.from(bucket).upload(key, f);
    if (upErr) throw new Error(upErr.message);

    const { data } = supabase.storage.from(bucket).getPublicUrl(key);
    return data.publicUrl;
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!prompt && !file) return setError("Type what you want or upload a file.");

    try {
      setLoading(true);
      let inputUrl: string | undefined;
      if (file) inputUrl = await uploadToSupabase(file);

      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Untitled Job",
          type: file ? "auto" : "hooks",
          input_url: inputUrl ?? null,
          prompt: prompt || null,
        }),
      });

      if (!res.ok) throw new Error(await res.text());
      const { id } = await res.json();
      router.push(`/jobs/${id}`);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen w-full bg-neutral-950 text-white flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-3xl bg-neutral-900/70 border border-neutral-800 rounded-2xl p-8 shadow-lg">
        <h1 className="text-2xl md:text-3xl font-semibold mb-6 text-center">
          Type what you want or upload a file
        </h1>

        <form onSubmit={handleGenerate} className="flex flex-col gap-5">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Example: Turn this podcast into 5 viral TikToks"
            className="w-full rounded-xl bg-neutral-800 border border-neutral-700 p-4 text-sm placeholder:text-neutral-400 resize-none outline-none focus:border-blue-600"
            rows={4}
          />

          <div
            onDrop={(e) => {
              e.preventDefault();
              const f = e.dataTransfer.files?.[0];
              if (f) setFile(f);
            }}
            onDragOver={(e) => e.preventDefault()}
            className="w-full flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-neutral-700 bg-neutral-800/40 p-6 text-sm text-neutral-400 hover:border-blue-600 transition"
          >
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="rounded-lg bg-neutral-700 px-4 py-2 text-white font-medium hover:bg-blue-600 transition"
            >
              Choose File / Drop here
            </button>
            <p className="mt-2">{file ? file.name : "Video or audio for caption/clip/resize"}</p>
            <input
              ref={fileRef}
              type="file"
              hidden
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              accept="video/*,audio/*"
            />
          </div>

          {error && (
            <div className="text-red-400 text-sm bg-red-950/40 border border-red-900/40 rounded-lg p-3">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 hover:bg-blue-500 transition text-white font-medium py-3 disabled:opacity-60"
          >
            {loading ? "Working…" : "Generate"}
          </button>
        </form>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card title="Create" desc="Upload → get captioned clips" />
          <Card title="Clipper" desc="Auto-find hooks & moments" />
          <Card title="Planner" desc="Plan posts & deadlines" />
        </div>
      </div>

      <footer className="mt-10 text-xs text-neutral-600">
        © 2025 directr — Privacy · Terms
      </footer>
    </main>
  );
}

function Card({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-4">
      <div className="text-lg font-semibold text-white">{title}</div>
      <div className="text-sm text-neutral-400">{desc}</div>
    </div>
  );
}
