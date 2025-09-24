"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type Job = {
  id: string;
  user_id: string;
  status: "queued" | "processing" | "done" | "error";
  input_path: string | null;
  output_path: string | null;
  error: string | null;
  created_at: string;
};

const FONTS = ["Inter", "Anton", "Poppins", "Montserrat", "Sora"] as const;
const THEMES = ["Classic White", "Bold Yellow", "Shadow", "Outline"] as const;
const POSITIONS = ["Bottom", "Middle", "Top"] as const;

export default function CreatePage() {
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  const [font, setFont] = useState<typeof FONTS[number]>("Inter");
  const [size, setSize] = useState(72);
  const [theme, setTheme] = useState<typeof THEMES[number]>("Classic White");
  const [position, setPosition] = useState<typeof POSITIONS[number]>("Bottom");

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      setUserId(data.user?.id ?? null);
      if (data.user?.id) loadJobs(data.user.id);
    })();
  }, []);

  async function loadJobs(uid: string) {
    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .eq("user_id", uid)
      .order("created_at", { ascending: false })
      .limit(20);
    if (!error && data) setJobs(data as Job[]);
  }

  async function getSignedUrl(path: string) {
    const { data, error } = await supabase.storage.from("videos").createSignedUrl(path, 600);
    if (error) return null;
    return data.signedUrl;
  }

  async function handleUpload() {
    if (!file) return alert("Choose a file");
    if (!userId) return alert("Sign in first (magic link)");

    try {
      setBusy(true);
      const jobId = crypto.randomUUID();
      const ext = (file.name.split(".").pop() || "mp4").toLowerCase();
      const inputPath = `${userId}/${jobId}/input.${ext}`;

      const up = await supabase.storage.from("videos").upload(inputPath, file, {
        upsert: true,
        cacheControl: "3600",
      });
      if (up.error) throw up.error;

      const { error: insErr } = await supabase.from("jobs").insert({
        id: jobId,
        user_id: userId,
        status: "queued",
        input_path: inputPath,
        output_path: null,
        error: null,
        options: { font, size, theme, position }
      });
      if (insErr) throw insErr;

      setFile(null);
      await loadJobs(userId);
      alert(`Queued: ${jobId}`);
    } catch (e: any) {
      console.error(e);
      alert(e.message || "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  async function signIn() {
    const email = prompt("Enter your email for a magic link:");
    if (!email) return;
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) alert(error.message);
    else alert("Check your email, click the link, then come back and Refresh.");
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Left: Uploader + controls */}
      <section className="card">
        <div className="mb-4">
          <h1 className="text-2xl font-semibold">Create</h1>
          <p className="text-sm text-gray-400">Upload a video → get a captioned, social-ready clip back.</p>
        </div>

        {!userId && (
          <button className="btn-outline mb-4" onClick={signIn}>Sign in (magic link)</button>
        )}

        <div className="space-y-4">
          <div>
            <div className="text-xs uppercase tracking-wide text-gray-400">Upload</div>
            <input
              type="file"
              accept="video/*"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="mt-1 block w-full"
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
              onChange={(e) => setSize(parseInt(e.target.value || "72", 10))}
              min={24}
              max={128}
            />

            <select className="input" value={theme} onChange={(e) => setTheme(e.target.value as any)}>
              {THEMES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>

            <select className="input" value={position} onChange={(e) => setPosition(e.target.value as any)}>
              {POSITIONS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          <div className="flex gap-3">
            <button className="btn" onClick={handleUpload} disabled={!file || !userId || busy}>
              {busy ? "Uploading…" : "Upload & Process"}
            </button>
            <button className="btn-outline" onClick={() => userId && loadJobs(userId)} disabled={!userId || busy}>
              Refresh
            </button>
          </div>
        </div>
      </section>

      {/* Right: Jobs */}
      <section className="card">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-lg font-semibold">Your recent jobs</div>
          <button className="btn-outline" onClick={() => userId && loadJobs(userId)} disabled={!userId || busy}>
            Refresh
          </button>
        </div>

        <ul className="space-y-3">
          {jobs.length === 0 && <li className="text-sm text-gray-400">No jobs yet.</li>}
          {jobs.map((j) => (
            <JobRow key={j.id} job={j} />
          ))}
        </ul>
      </section>
    </div>
  );
}

function JobRow({ job }: { job: Job }) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      if (job.status === "done" && job.output_path) {
        const { data, error } = await supabase.storage.from("videos").createSignedUrl(job.output_path, 600);
        if (!error) setUrl(data?.signedUrl ?? null);
      }
    })();
  }, [job.status, job.output_path]);

  return (
    <li className="rounded-lg border border-white/10 bg-black/30 p-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-xs text-gray-400">Job</div>
          <div className="font-mono text-sm">{job.id}</div>
          <div className="mt-1 text-xs text-gray-400">Status: {job.status}</div>
          {job.error && <div className="mt-1 text-xs text-red-400">Error: {job.error}</div>}
        </div>
        <div>
          {job.status === "done" && url ? (
            <a className="btn" href={url} download>
              Download video
            </a>
          ) : (
            <button className="btn-outline" disabled>
              {job.status === "error" ? "No video" : "Processing…"}
            </button>
          )}
        </div>
      </div>
    </li>
  );
}
