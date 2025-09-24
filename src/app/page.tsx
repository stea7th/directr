"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";

type Job = {
  id: string;
  status: "queued" | "processing" | "done" | "error";
  error?: string | null;
  input_path: string | null;
  output_path: string | null;
  created_at: string;
};

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const FONTS = ["Inter", "Anton", "Montserrat", "Poppins", "BebasNeue"] as const;
const THEMES = ["Classic White", "Classic Yellow", "Shadow Pop"] as const;
const POSITIONS = ["Bottom", "Center", "Top"] as const;

export default function Page() {
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [signed, setSigned] = useState<Record<string, string>>({});
  const [font, setFont] = useState<typeof FONTS[number]>("Inter");
  const [size, setSize] = useState(72);
  const [theme, setTheme] = useState<typeof THEMES[number]>("Classic White");
  const [pos, setPos] = useState<typeof POSITIONS[number]>("Bottom");

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      setUserId(data.user?.id ?? null);
      loadJobs(data.user?.id ?? null);
    })();
  }, []);

  async function loadJobs(uid: string | null = userId) {
    if (!uid) return setJobs([]);
    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .eq("user_id", uid)
      .order("created_at", { ascending: false })
      .limit(20);
    if (!error && data) setJobs(data as Job[]);
  }

  async function signUrlFor(job: Job) {
    if (!job.output_path) return null;
    const { data, error } = await supabase.storage
      .from("videos")
      .createSignedUrl(job.output_path, 600);
    if (error) return null;
    return data.signedUrl;
  }

  useEffect(() => {
    (async () => {
      const map: Record<string, string> = {};
      await Promise.all(
        jobs
          .filter((j) => j.status === "done" && j.output_path)
          .map(async (j) => {
            const u = await signUrlFor(j);
            if (u) map[j.id] = u;
          })
      );
      setSigned(map);
    })();
  }, [jobs]);

  const canUpload = useMemo(() => !!file && !!userId && !busy, [file, userId, busy]);

  async function handleUpload() {
    if (!file) return alert("Choose a file");
    if (!userId) return alert("Sign in");
    setBusy(true);
    try {
      const jobId = crypto.randomUUID();
      const ext = (file.name.split(".").pop() || "mp4").toLowerCase();
      const inputPath = `${userId}/${jobId}/input.${ext}`;

      // upload original
      const { error: upErr } = await supabase.storage
        .from("videos")
        .upload(inputPath, file, { upsert: true, cacheControl: "3600" });
      if (upErr) throw upErr;

      // insert job row
      const { error: insErr } = await supabase.from("jobs").insert({
        id: jobId,
        user_id: userId,
        status: "queued",
        input_path: inputPath,
        options: {
          font,
          size,
          theme,
          position: pos
        }
      });
      if (insErr) throw insErr;

      setFile(null);
      await loadJobs();
      alert(`Job queued: ${jobId}`);
    } catch (e: any) {
      console.error(e);
      alert(e.message ?? "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <section className="card">
        <div className="mb-4">
          <h1 className="text-2xl font-semibold">Directr — Create</h1>
          <p className="text-sm text-gray-400">Upload a video → get a captioned, social-ready clip back.</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-1">
            <div className="label">Upload a video</div>
            <input
              type="file"
              accept="video/*"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="input w-full bg-black file:mr-3 file:rounded-md file:border-none file:bg-white/10 file:px-3 file:py-2 file:text-sm file:text-white hover:file:bg-white/15"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <select className="input" value={font} onChange={(e) => setFont(e.target.value as any)}>
              {FONTS.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
            <input
              type="number"
              className="input"
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
              min={24}
              max={128}
            />
            <select className="input" value={theme} onChange={(e) => setTheme(e.target.value as any)}>
              {THEMES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <select className="input" value={pos} onChange={(e) => setPos(e.target.value as any)}>
              {POSITIONS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          <div className="flex gap-3">
            <button className="btn" onClick={handleUpload} disabled={!canUpload}>
              Upload & Process
            </button>
            <button className="btn btn-outline" onClick={() => loadJobs()}>
              Refresh
            </button>
          </div>
        </div>
      </section>

      <section className="card">
        <div className="mb-3 text-lg font-semibold">Your recent jobs</div>
        <ul className="list">
          {jobs.length === 0 && <li className="text-sm text-gray-400">No jobs yet.</li>}
          {jobs.map((j) => (
            <li key={j.id} className="rounded-lg border border-white/10 p-3">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-xs text-gray-400">Job</div>
                  <div className="font-mono text-sm">{j.id}</div>
                  <div className="text-xs text-gray-400 mt-1">Status: {j.status}</div>
                  {j.status === "error" && (
                    <div className="mt-1 text-xs text-red-400">Error: {j.error || "unknown"}</div>
                  )}
                </div>
                <div>
                  {j.status === "done" && signed[j.id] ? (
                    <a className="btn" href={signed[j.id]} download>
                      Download video
                    </a>
                  ) : (
                    <button className="btn btn-outline" disabled>
                      {j.status === "error" ? "No video" : "Processing…"}
                    </button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
