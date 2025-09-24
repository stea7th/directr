"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

type Job = {
  id: string;
  status: "queued" | "processing" | "done" | "error";
  output_path?: string | null;
  error?: string | null;
  created_at?: string;
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnon);

export default function CreatePage() {
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      setUserId(data.user?.id ?? null);
      if (data.user?.id) await loadJobs(data.user.id);
    })();
  }, []);

  async function loadJobs(uid: string) {
    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .eq("user_id", uid)
      .order("created_at", { ascending: false })
      .limit(25);

    if (!error && data) setJobs(data as Job[]);
  }

  async function handleUpload() {
    if (!file) return alert("Choose a file");
    if (!userId) return alert("Sign in first");

    try {
      setBusy(true);

      // 1) upload to storage
      const path = `${userId}/${crypto.randomUUID()}-${file.name}`;
      const { error: upErr } = await supabase.storage
        .from("videos")
        .upload(path, file, { upsert: false });
      if (upErr) throw upErr;

      // 2) create job row
      const jobId = crypto.randomUUID();
      const { error: insErr } = await supabase.from("jobs").insert({
        id: jobId,
        user_id: userId,
        input_path: path,
        status: "queued",
      });
      if (insErr) throw insErr;

      alert(`Job queued: ${jobId}`);
      await loadJobs(userId);
    } catch (e: any) {
      console.error(e);
      alert(e.message ?? "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen">
      <header className="border-b border-neutral-800">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="text-xl font-semibold tracking-tight">Directr</div>
          <nav className="text-sm text-neutral-400">
            <a className="hover:text-white" href="/app">Create</a>
            <span className="mx-3">·</span>
            <a className="hover:text-white" href="/app/campaigns">Campaigns</a>
            <span className="mx-3">·</span>
            <a className="hover:text-white" href="/app/analytics">Analytics</a>
            <span className="mx-3">·</span>
            <a className="hover:text-white" href="/app/settings">Settings</a>
          </nav>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-6 py-10 md:grid-cols-2">
        {/* Left: uploader */}
        <section className="card p-5">
          <div className="mb-2 text-lg font-semibold">Upload a video</div>
          <p className="mb-4 text-sm text-neutral-400">MP4 recommended</p>

          <div className="flex items-center gap-3">
            <input
              type="file"
              accept="video/*"
              className="input"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            <button className="btn" disabled={busy} onClick={handleUpload}>
              {busy ? "Uploading…" : "Upload & Process"}
            </button>
          </div>
        </section>

        {/* Right: jobs */}
        <section className="card p-5">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-lg font-semibold">Your recent jobs</div>
            <button
              className="btn-outline"
              onClick={() => userId && loadJobs(userId)}
              disabled={!userId || busy}
            >
              Refresh
            </button>
          </div>

          {!jobs.length && (
            <div className="text-sm text-neutral-400">No jobs yet.</div>
          )}

          <ul className="list">
            {jobs.map((job) => (
              <li key={job.id} className="rounded-lg border border-neutral-800 p-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    <div className="font-mono text-neutral-300">Job: {job.id}</div>
                    <div className="text-neutral-400">Status: {job.status}</div>
                    {job.error && (
                      <div className="text-red-400">Error: {job.error}</div>
                    )}
                  </div>

                  {job.status === "done" && job.output_path ? (
                    <DownloadButton outputPath={job.output_path} />
                  ) : (
                    <button className="btn-outline" disabled>
                      {job.status === "error" ? "No video yet" : "Processing…"}
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <footer className="mx-auto max-w-6xl px-6 py-10 text-xs text-neutral-500">
        © {new Date().getFullYear()} Directr —{" "}
        <a className="underline" href="/privacy">Privacy</a>{" "}
        ·{" "}
        <a className="underline" href="/terms">Terms</a>
      </footer>
    </main>
  );
}

function DownloadButton({ outputPath }: { outputPath: string }) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .storage
        .from("videos")
        .createSignedUrl(outputPath, 60 * 10);
      if (!error) setUrl(data?.signedUrl ?? null);
    })();
  }, [outputPath]);

  return (
    <a
      className="btn"
      href={url ?? "#"}
      target="_blank"
      rel="noreferrer"
      onClick={(e) => { if (!url) e.preventDefault(); }}
    >
      Download video
    </a>
  );
}
