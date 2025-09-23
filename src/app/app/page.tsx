"use client";


import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";

type Job = {
  id: string;
  status: string;
  output_path: string | null;
  error: string | null;
  notes: string | null;
  created_at?: string;
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

const fonts = ["Inter", "Anton", "Oswald", "Bebas Neue", "Poppins"];
const themes = ["Classic White", "Classic Black", "Lemon Pop", "Electric Blue", "Fire"];
const positions = ["Bottom", "Center", "Top"];

export default function CreatePage() {
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  const [font, setFont] = useState(fonts[0]);
  const [size, setSize] = useState<number>(72);
  const [theme, setTheme] = useState(themes[0]);
  const [position, setPosition] = useState(positions[0]);

  const supabase = useMemo(() => createClient(supabaseUrl, supabaseAnonKey), []);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      setUserId(data.user?.id ?? null);
    })();
  }, [supabase]);

  async function signIn() {
    // This opens Supabase email magic link UI in a new tab (you can wire a nicer flow later)
    const email = prompt("Enter your email for a magic link:");
    if (!email) return;
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) alert(error.message);
    else alert("Check your email for a magic link, then come back and refresh.");
  }

  async function loadJobs(uid: string | null) {
    if (!uid) return setJobs([]);
    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .eq("user_id", uid)
      .order("created_at", { ascending: false })
      .limit(20);
    if (error) {
      console.error(error);
      return;
    }
    setJobs((data as Job[]) ?? []);
  }

  useEffect(() => {
    loadJobs(userId);
  }, [userId]);

  async function handleUpload() {
    if (!file) { alert("Choose a file"); return; }
    if (!userId) { alert("Sign in first"); return; }

    try {
      setBusy(true);

      const ext = (file.name.split(".").pop() || "mp4").toLowerCase();
      const inputPath = `${userId}/${crypto.randomUUID()}.${ext}`;

      const up = await supabase.storage.from("videos").upload(inputPath, file, {
        cacheControl: "3600",
        upsert: false,
      });
      if (up.error) throw up.error;

      const { error: insErr } = await supabase.from("jobs").insert({
        user_id: userId,
        status: "queued",
        input_path: inputPath,
        output_path: null,
        error: null,
        // encode your UI settings in notes for the worker to read
        notes: JSON.stringify({ font, size, theme, position }),
      });
      if (insErr) throw insErr;

      alert("Uploaded & queued!");
      await loadJobs(userId);
    } catch (e: any) {
      console.error(e);
      alert(e.message || "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  async function getSignedUrl(p: string) {
    const r = await supabase.storage.from("videos").createSignedUrl(p, 600);
    if (r.error) throw r.error;
    return r.data.signedUrl;
  }

  function JobBadge(j: Job) {
    if (j.status === "done") return <span className="badge">Done</span>;
    if (j.status === "error") return <span className="badge">Error</span>;
    if (j.status === "processing") return <span className="badge">Processing</span>;
    return <span className="badge">Queued</span>;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Directr — Create</h1>
        <div className="flex gap-2">
          {userId ? (
            <span className="text-sm text-neutral-400">Signed in</span>
          ) : (
            <button className="btn-primary" onClick={signIn}>Sign in</button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="card">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-neutral-300">Upload a video</label>
              <input
                type="file"
                accept="video/mp4,video/*"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="input"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <select className="select" value={font} onChange={(e) => setFont(e.target.value)}>
                {fonts.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>

              <input
                className="select"
                type="number"
                min={24}
                max={120}
                step={2}
                value={size}
                onChange={(e) => setSize(parseInt(e.target.value || "72", 10))}
              />

              <select className="select" value={theme} onChange={(e) => setTheme(e.target.value)}>
                {themes.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>

              <select className="select" value={position} onChange={(e) => setPosition(e.target.value)}>
                {positions.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>

            <div className="flex gap-3">
              <button
                className="btn-primary"
                onClick={handleUpload}
                disabled={!file || !userId || busy}
              >
                {busy ? "Uploading…" : "Upload & Process"}
              </button>

              <button
                className="btn-secondary"
                onClick={() => loadJobs(userId)}
                disabled={busy}
              >
                Refresh
              </button>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Your recent jobs</h2>
            <button className="btn-secondary" onClick={() => loadJobs(userId)} disabled={busy}>
              Refresh
            </button>
          </div>

          <ul className="space-y-3">
            {jobs.length === 0 && (
              <li className="text-sm text-neutral-400">No jobs yet.</li>
            )}

            {jobs.map((j) => (
              <li key={j.id} className="flex items-center justify-between rounded-md border border-neutral-800 bg-neutral-900/60 px-3 py-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm text-neutral-300">Job: {j.id}</span>
                    {JobBadge(j)}
                  </div>
                  {j.error && <div className="text-xs text-red-400 mt-1">Error: {j.error}</div>}
                </div>

                <div className="shrink-0">
                  {j.status === "done" && j.output_path ? (
                    <button
                      className="btn-primary"
                      onClick={async () => {
                        try {
                          const url = await getSignedUrl(j.output_path!);
                          const a = document.createElement("a");
                          a.href = url;
                          a.download = "directr.mp4";
                          document.body.appendChild(a);
                          a.click();
                          a.remove();
                        } catch (e: any) {
                          alert(e.message || "Could not get download link");
                        }
                      }}
                    >
                      Download video
                    </button>
                  ) : (
                    <button className="btn-secondary" disabled>
                      No video yet
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="text-xs text-neutral-500">© {new Date().getFullYear()} Directr</div>
    </div>
  );
}
