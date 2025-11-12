// src/app/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";

export default function CreatePage() {
  const [file, setFile] = useState<File | null>(null);
  const [prompt, setPrompt] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!file) return alert("Please upload a file first!");
    setIsUploading(true);

    try {
      // placeholder upload logic for now
      await new Promise((r) => setTimeout(r, 1200));
      alert("✅ Upload successful (placeholder)");
    } catch (err) {
      console.error(err);
      alert("Error uploading file");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white px-5 sm:px-6 md:px-8 py-10">
      {/* Header */}
      <header className="mb-8 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold tracking-tight">
          directr<span className="text-sky-400">.</span>
        </Link>
        <nav className="flex items-center gap-4 text-sm text-zinc-400">
          <Link href="/clipper" className="hover:text-white">
            Clipper
          </Link>
          <Link href="/planner" className="hover:text-white">
            Planner
          </Link>
          <Link href="/jobs" className="hover:text-white">
            Jobs
          </Link>
          <Link
            href="/login"
            className="rounded-xl border border-white/10 bg-[#111] px-3 py-1.5 hover:shadow-[0_0_0_2px_rgba(255,255,255,.08)]"
          >
            Sign in
          </Link>
        </nav>
      </header>

      {/* Main create area */}
      <section className="mx-auto max-w-3xl">
        <h1 className="text-2xl font-semibold">Create</h1>
        <p className="mt-1 text-zinc-400">
          Upload a video or start from a text prompt to generate clips.
        </p>

        <div className="mt-6 rounded-2xl border border-white/10 bg-[#111] p-6">
          <label
            htmlFor="upload"
            className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/10 bg-black/20 p-10 text-center cursor-pointer hover:border-sky-500/50 transition-all"
          >
            {file ? (
              <>
                <p className="text-zinc-300">{file.name}</p>
                <p className="mt-1 text-sm text-zinc-500">
                  {Math.round(file.size / 1024 / 1024)}MB selected
                </p>
              </>
            ) : (
              <>
                <p className="text-zinc-300">
                  Drop a file here or click to browse
                </p>
                <p className="mt-1 text-sm text-zinc-500">
                  .mp4 • .mov • up to 2GB
                </p>
              </>
            )}
            <input
              id="upload"
              type="file"
              accept="video/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <input
              className="h-10 rounded-xl border border-white/10 bg-[#0f0f0f] px-3 text-sm outline-none focus:shadow-[0_0_0_3px_rgba(14,165,233,.35)]"
              placeholder="Optional: add a prompt or caption idea"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <button
              onClick={handleSubmit}
              disabled={isUploading}
              className="h-10 rounded-xl bg-sky-500 px-4 text-sm font-medium text-white hover:brightness-105 disabled:opacity-60"
            >
              {isUploading ? "Processing..." : "Create Job"}
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mx-auto mt-10 max-w-3xl border-t border-white/10 pt-6 text-sm text-zinc-500">
        © {new Date().getFullYear()} directr ·{" "}
        <Link href="/terms" className="hover:text-zinc-300">
          Terms
        </Link>{" "}
        ·{" "}
        <Link href="/privacy" className="hover:text-zinc-300">
          Privacy
        </Link>
      </footer>
    </main>
  );
}
