import "../globals.css";
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
);

type Job = {
  id: string;
  user_id: string;
  status: string;
  input_path: string | null;
  output_path: string | null;
  error: string | null;
  font_name?: string | null;
  font_size?: number | null;
  style_name?: string | null;
  position?: string | null;
  created_at?: string;
};

export default function Page() {
  const [file, setFile] = useState<File | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [fontName, setFontName] = useState("Anton");
  const [fontSize, setFontSize] = useState(72);
  const [styleName, setStyleName] = useState("Classic White");
  const [position, setPosition] = useState("bottom");

  async function ensureUser() {
    const { data } = await supabase.auth.getUser();
    const u = data?.user || null;
    setUserId(u?.id ?? null);
    return u?.id ?? null;
  }

  async function loadJobs(uid?: string | null) {
    const id = uid ?? (await ensureUser());
    if (!id) return;
    const res = await supabase
      .from("jobs")
      .select("*")
      .eq("user_id", id)
      .order("created_at", { ascending: false })
      .limit(50);
    setJobs(res.data as Job[] || []);
  }

  async function handleUpload() {
    if (!file) { alert("Choose a file"); return; }
    setLoading(true);
    try {
      const id = await ensureUser();
      if (!id) { alert("Sign in first"); return; }

      const jobId = crypto.randomUUID();
      const ext = (file.name.split(".").pop() || "mp4").toLowerCase();
      const key = `${id}/${jobId}.${ext}`;

      const up = await supabase.storage.from("videos").upload(key, file, { contentType: "video/mp4" });
      if (up.error) { alert(`Upload failed: ${up.error.message}`); return; }

      const ins = await supabase.from("jobs").insert([{
        id: jobId,
        user_id: id,
        status: "queued",
        input_path: key,
        font_name: fontName,
        font_size: fontSize,
        style_name: styleName,
        position: position
      }]);
      if (ins.error) { alert(`DB insert failed: ${ins.error.message}`); return; }

      await loadJobs(id);
      setFile(null);
    } finally {
      setLoading(false);
    }
  }

  async function handleDownload(path: string) {
    const { data, error } = await supabase.storage.from("videos").createSignedUrl(path, 3600, {
      download: path.split("/").pop() || "video.mp4",
    });
    if (error || !data?.signedUrl) { alert("Download link failed"); return; }
    const a = document.createElement("a");
    a.href = data.signedUrl;
    a.download = path.split("/").pop() || "video.mp4";
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  useEffect(() => {
    ensureUser().then(loadJobs);
  }, []);

  return (
    <main className="mx-auto max-w-3xl p-6 space-y-6">
      <h1 className="text-2xl font-bold">Directr</h1>

      <div className="flex flex-col gap-3 p-4 rounded-lg border bg-white">
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="file"
            accept="video/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="block w-full max-w-xs text-sm"
          />

          <select value={fontName} onChange={(e) => setFontName(e.target.value)} className="border rounded px-2 py-1">
            <option>Anton</option>
            <option>Bebas Neue</option>
            <option>Inter</option>
            <option>Montserrat</option>
            <option>Poppins</option>
          </select>

          <input
            type="number"
            value={fontSize}
            min={40}
            max={96}
            step={2}
            onChange={(e) => setFontSize(parseInt(e.target.value || "72", 10))}
            className="w-24 border rounded px-2 py-1"
            placeholder="Font size"
          />

          <select value={styleName} onChange={(e) => setStyleName(e.target.value)} className="border rounded px-2 py-1">
            <option>Classic White</option>
            <option>Sunny Yellow</option>
            <option>Cyber Neon</option>
          </select>

          <select value={position} onChange={(e) => setPosition(e.target.value)} className="border rounded px-2 py-1">
            <option value="bottom">Bottom</option>
            <option value="middle">Middle</option>
            <option value="top">Top</option>
          </select>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleUpload}
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
            disabled={!file || loading}
          >
            {loading ? "Uploading..." : "Upload"}
          </button>

          <button
            onClick={() => loadJobs()}
            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
          >
            Refresh
          </button>
        </div>
      </div>

      <section className="rounded-lg border bg-white">
        <div className="px-4 py-3 font-semibold">Your jobs</div>
        <ul>
          {jobs.length === 0 && (
            <li className="px-4 pb-4 text-sm text-gray-500">No jobs yet</li>
          )}
          {jobs.map((job) => {
            const canDownload = !!job.output_path && job.status === "done" && job.output_path.toLowerCase().endsWith(".mp4");
            const canDownloadCaptions = !!job.output_path && job.status === "done" && !job.output_path.toLowerCase().endsWith(".mp4");
            return (
              <li key={job.id} className="px-4 py-3 border-t flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">Job {job.id}</div>
                  <div className="text-xs text-gray-500">Status: {job.status}</div>
                  {job.error ? (
                    <div className="text-xs text-red-600 max-w-[52ch] truncate">{job.error}</div>
                  ) : null}
                </div>

                <div className="flex items-center gap-2">
                  {canDownload && (
                    <button
                      onClick={() => handleDownload(job.output_path as string)}
                      className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 text-sm"
                    >
                      Download video
                    </button>
                  )}
                  {canDownloadCaptions && (
                    <button
                      onClick={async () => {
                        const { data, error } = await supabase.storage.from("videos").createSignedUrl(
                          job.output_path as string,
                          3600,
                          { download: (job.output_path || "captions.ass").split("/").pop() }
                        );
                        if (error || !data?.signedUrl) { alert("Captions link failed"); return; }
                        const a = document.createElement("a");
                        a.href = data.signedUrl;
                        a.download = (job.output_path || "captions.ass").split("/").pop() || "captions.ass";
                        document.body.appendChild(a);
                        a.click();
                        a.remove();
                      }}
                      className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-sm"
                    >
                      Download captions
                    </button>
                  )}
                  {!canDownload && !canDownloadCaptions && (
                    <span className="text-xs text-gray-400">Processing…</span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    </main>
  );
}
