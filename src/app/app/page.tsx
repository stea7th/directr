"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"

type Job = {
  id: string
  user_id: string
  status: "queued" | "processing" | "done" | "error"
  output_path: string | null
  error?: string | null
  created_at?: string
}
const getSignedDownloadUrl = async (path: string, filename: string) => {
  const { data, error } = await supabase
    .storage
    .from("videos")
    .createSignedUrl(path, 3600, { download: filename });
  if (error) throw error;
  return data.signedUrl;
};
export default function CreatePage() {
  const [userId, setUserId] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [jobId, setJobId] = useState("")
  const [statusText, setStatusText] = useState("")
  const [downloadUrl, setDownloadUrl] = useState("")
  const [jobs, setJobs] = useState<Job[]>([])
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    ;(async () => {
      const { data } = await supabase.auth.getUser()
      const uid = data.user?.id || ""
      setUserId(uid)
      if (uid) loadJobs(uid)
      const last = typeof window !== "undefined" ? localStorage.getItem("lastJobId") : null
      if (last) { setJobId(last); poll(last) }
    })()
  }, [])

  async function magicLink() {
    const email = prompt("Email for magic link?")
    if (!email) return
    const { error } = await supabase.auth.signInWithOtp({
  email,
  options: {
    emailRedirectTo: `https://directr-beta.vercel.app/auth/callback`,
  },
});
    if (error) return alert(error.message)
    alert("Check your email for a magic link.")
  }

 async function handleUpload() {
  if (!file) { alert("Choose a file"); return; }

  const { data: auth } = await supabase.auth.getUser();
  const user = auth?.user;
  if (!user) { alert("Sign in"); return; }

  const jobId = crypto.randomUUID();
  const ext = file.name.split(".").pop()?.toLowerCase() || "mp4";
  const key = `${user.id}/${jobId}.${ext}`;

  const { error: upErr } = await supabase
    .storage
    .from("videos")
    .upload(key, file, { contentType: "video/mp4", upsert: true });
  if (upErr) { alert(`Upload failed: ${upErr.message}`); return; }

  const { error: insErr } = await supabase
    .from("jobs")
    .insert([{ id: jobId, user_id: user.id, status: "queued", input_path: key }]);
  if (insErr) { alert(`DB insert failed: ${insErr.message}`); return; }

  alert(`Job queued: ${jobId}`);
  await loadJobs(user.id);
}
  function poll(id: string) {
    setStatusText("checking…")
    const t = setInterval(async () => {
      const { data } = await supabase.from("jobs").select("*").eq("id", id).single()
      const j = data as Job
      setStatusText(j?.status || "")
      if (j?.status === "done" && j?.output_path) {
        const { data: s } = await supabase.storage.from("videos").createSignedUrl(j.output_path, 600)
        if (s?.signedUrl) setDownloadUrl(s.signedUrl)
        clearInterval(t)
      }
      if (j?.status === "error") clearInterval(t)
    }, 2000)
  }

  async function loadJobs(uid: string) {
    const { data } = await supabase
      .from("jobs")
      .select("*")
      .eq("user_id", uid)
      .order("created_at", { ascending: false })
      .limit(25)
    setJobs((data || []) as Job[])
  }

  return (
    <div className="stack-6">
      <div className="card" style={{padding:20}}>
        <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", gap:16}}>
          <div>
            <h1>Directr — Create</h1>
            <div className="muted">Upload raw video → get a captioned, social-ready clip back.</div>
          </div>
          {!userId ? (
            <button className="btn" onClick={magicLink}>Sign in</button>
          ) : (
            <span className="pill">Signed in</span>
          )}
        </div>
      </div>

      <div className="grid-2">
        {/* Upload / Current Job */}
        <section className="card">
          <h2>Upload a video</h2>
          <div className="muted" style={{fontSize:12, marginBottom:10}}>MP4 recommended</div>

          <input
            type="file"
            accept="video/mp4"
            onChange={(e)=>setFile(e.target.files?.[0]||null)}
            className="input"
            disabled={busy}
          />

          <div style={{display:"flex", gap:12, marginTop:12}}>
            <button className="btn" onClick={handleUpload} disabled={busy}>
              {busy ? "Uploading…" : "Upload & Process"}
            </button>
            <button className="btn btn-outline" onClick={()=> userId && loadJobs(userId)} disabled={busy}>
              Refresh
            </button>
          </div>

          {jobId && (
            <div style={{marginTop:14, border:"1px solid var(--border)", borderRadius:10, padding:12}}>
              <div className="muted" style={{fontSize:12, wordBreak:"break-all"}}>Job: {jobId}</div>
              <div style={{marginTop:4}}>Status: {statusText || "—"}</div>
              {downloadUrl && (
                <a className="btn btn-outline" style={{marginTop:10}} href={downloadUrl} target="_blank" rel="noreferrer">
                  Download processed video
                </a>
              )}
            </div>
          )}
        </section>

        {/* Recent Jobs */}
        <section className="card">
          <div style={{display:"flex", alignItems:"center", justifyContent:"space-between"}}>
            <h2>Your recent jobs</h2>
            <button className="btn btn-outline" onClick={()=> userId && loadJobs(userId)} disabled={busy}>Refresh</button>
          </div>

          <ul className="list" style={{marginTop:12}}>
            {jobs.map(j => <JobRow key={j.id} job={j} />)}
            {!jobs.length && <li className="muted">No jobs yet.</li>}
          </ul>
        </section>
      </div>
    </div>
  )
}

function JobRow({ job }: { job: Job }) {
  const [url, setUrl] = useState("");

  useEffect(() => {
    (async () => {
      try {
        if (
          job.status === "done" &&
          job.output_path &&
          job.output_path.toLowerCase().endsWith(".mp4")
        ) {
          const filename =
            job.output_path.split("/").pop() || "video.mp4";
          const { data, error } = await supabase
            .storage
            .from("videos")
            .createSignedUrl(job.output_path, 3600, { download: filename });
          if (error) throw error;
          setUrl(data?.signedUrl || "");
        } else {
          setUrl("");
        }
      } catch {
        setUrl("");
      }
    })();
  }, [job.status, job.output_path]);

  return (
    <li className="flex items-center justify-between gap-3 py-2 border-b">
      <div className="text-sm">
        <div className="font-medium">Job: {job.id}</div>
        <div className="text-xs text-gray-500">Status: {job.status}</div>
      </div>

      {url ? (
        <button
          onClick={() => {
            const a = document.createElement("a");
            a.href = url;
            a.download = job.output_path?.split("/").pop() || "video.mp4";
            document.body.appendChild(a);
            a.click();
            a.remove();
          }}
          className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
        >
          Download video
        </button>
      ) : (
        <span className="text-xs text-gray-400">
          {job.output_path && !job.output_path.toLowerCase().endsWith(".mp4")
            ? "Captions only"
            : "No video yet"}
        </span>
      )}
    </li>
  );
}
async function handleDownload(job: any) {
  try {
    const path = job.output_path ?? job.source_path;
    if (!path) {
      alert("No file path on job");
      return;
    }

    const { data, error } = await supabase.storage
      .from("videos")
      .createSignedUrl(path, 60);

    if (error || !data?.signedUrl) {
      console.error(error);
      alert("Could not create download link");
      return;
    }

    window.location.href = data.signedUrl;
  } catch (err) {
    console.error(err);
    alert("Download failed");
  }
}
