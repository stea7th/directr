"use client";

import { useEffect, useState } from "react";

type Job = {
  id: string;
  status: "queued" | "processing" | "done" | "error";
  output_path?: string | null;
  error?: string | null;
};

const FONTS = ["Inter", "Anton", "Poppins", "Montserrat", "Sora"];
const THEMES = ["Classic White", "Bold Yellow", "Shadow", "Outline"];
const POSITIONS = ["Bottom", "Middle", "Top"];

export default function AppPage() {
  const [file, setFile] = useState<File | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [busy, setBusy] = useState(false);

  const [font, setFont] = useState(FONTS[0]);
  const [size, setSize] = useState(72);
  const [theme, setTheme] = useState(THEMES[0]);
  const [position, setPosition] = useState(POSITIONS[0]);

  async function handleUpload() {
    if (!file) return;

    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("font", font);
      fd.append("size", String(size));
      fd.append("theme", theme);
      fd.append("position", position);

      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (!res.ok) throw new Error(await res.text());
      await loadJobs();
      setFile(null);
    } catch (e) {
      alert("Upload failed");
    } finally {
      setBusy(false);
    }
  }

  async function loadJobs() {
    const res = await fetch("/api/jobs");
    if (!res.ok) return;
    const data = await res.json();
    setJobs(data || []);
  }

  useEffect(() => {
    loadJobs();
    const t = setInterval(loadJobs, 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="space-y-10">
      <section className="rounded-xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-2xl font-semibold">Upload a video</h2>
        <p className="mt-1 text-sm text-gray-400">MP4 recommended</p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="flex items-center gap-2">
            <span className="w-20 text-sm text-gray-400">Font</span>
            <select value={font} onChange={(e) => setFont(e.target.value)} className="w-full rounded-md bg-black/40 px-3 py-2 outline-none ring-1 ring-white/10">
              {FONTS.map(f => <option key={f}>{f}</option>)}
            </select>
          </label>

          <label className="flex items-center gap-2">
            <span className="w-20 text-sm text-gray-400">Size</span>
            <input type="number" min={24} max={128} value={size} onChange={(e) => setSize(parseInt(e.target.value || "72"))} className="w-full rounded-md bg-black/40 px-3 py-2 outline-none ring-1 ring-white/10" />
          </label>

          <label className="flex items-center gap-2">
            <span className="w-20 text-sm text-gray-400">Theme</span>
            <select value={theme} onChange={(e) => setTheme(e.target.value)} className="w-full rounded-md bg-black/40 px-3 py-2 outline-none ring-1 ring-white/10">
              {THEMES.map(t => <option key={t}>{t}</option>)}
            </select>
          </label>

          <label className="flex items-center gap-2">
            <span className="w-20 text-sm text-gray-400">Position</span>
            <select value={position} onChange={(e) => setPosition(e.target.value)} className="w-full rounded-md bg-black/40 px-3 py-2 outline-none ring-1 ring-white/10">
              {POSITIONS.map(p => <option key={p}>{p}</option>)}
            </select>
          </label>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <input type="file" accept="video/mp4" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          <button
            className="rounded-md bg-white px-4 py-2 text-black hover:bg-gray-200 disabled:opacity-50"
            onClick={handleUpload}
            disabled={busy || !file}
          >
            {busy ? "Uploading…" : "Upload & Process"}
          </button>
        </div>
      </section>

      <section>
        <h3 className="mb-3 text-xl font-semibold">Your recent jobs</h3>
        <ul className="space-y-3">
          {jobs.length === 0 && <li className="text-gray-400">No jobs yet.</li>}
          {jobs.map((j) => (
            <li key={j.id} className="rounded-lg border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-gray-400">Job: {j.id}</p>
                  <p>Status: {j.status}</p>
                  {j.error && <p className="text-sm text-red-400">Error: {j.error}</p>}
                </div>
                {j.status === "done" && j.output_path && (
                  <a
                    href={`/api/download?path=${encodeURIComponent(j.output_path)}`}
                    className="rounded-md bg-white px-3 py-2 text-sm text-black hover:bg-gray-200"
                  >
                    Download video
                  </a>
                )}
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
