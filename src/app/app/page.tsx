"use client";
import { useState, useEffect } from "react";

export default function AppPage() {
  const [file, setFile] = useState<File | null>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  async function handleUpload() {
    if (!file) return alert("Choose a file first");
    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    await fetch("/api/upload", { method: "POST", body: formData });
    setLoading(false);
    loadJobs();
  }

  async function loadJobs() {
    const res = await fetch("/api/jobs");
    const data = await res.json();
    setJobs(data);
  }

  useEffect(() => {
    loadJobs();
  }, []);

  return (
    <div className="space-y-10">
      <section className="rounded-lg border border-white/10 bg-black/40 p-6">
        <h2 className="text-xl font-semibold">Upload a video</h2>
        <input
          type="file"
          accept="video/mp4"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="mt-4 block"
        />
        <button
          onClick={handleUpload}
          disabled={loading || !file}
          className="mt-4 rounded bg-white px-4 py-2 text-black hover:bg-gray-200 disabled:opacity-50"
        >
          {loading ? "Uploading..." : "Upload & Process"}
        </button>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold">Your recent jobs</h2>
        <ul className="space-y-3">
          {jobs.length === 0 && <li className="text-gray-400">No jobs yet.</li>}
          {jobs.map((job) => (
            <li
              key={job.id}
              className="rounded border border-white/10 bg-black/40 p-4"
            >
              <p className="text-sm text-gray-400">Job: {job.id}</p>
              <p>Status: {job.status}</p>
              {job.url && (
                <a
                  href={job.url}
                  className="mt-2 inline-block rounded bg-white px-3 py-1 text-sm text-black hover:bg-gray-200"
                >
                  Download video
                </a>
              )}
              {job.error && (
                <p className="text-red-400 text-sm">Error: {job.error}</p>
              )}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
