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

export default function CreatePage() {
  const [userId, setUserId] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [jobId, setJobId] = useState("")
  const [statusText, setStatusText] = useState("")
  const [downloadUrl, setDownloadUrl] = useState("")
  const [jobs, setJobs] = useState<Job[]>([])
  const [busy, setBusy] = useState(false)

  // simple toast
  const [toast, setToast] = useState<{type:"ok"|"err"; msg:string}|null>(null)
  function showToast(type:"ok"|"err", msg:string) {
    setToast({type, msg})
    setTimeout(()=>setToast(null), 2500)
  }

  useEffect(() => {
    (async () => {
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
    const { error } = await supabase.auth.signInWithOtp({ email })
    if (error) return showToast("err", error.message)
    showToast("ok", "Magic link sent. Check your email.")
  }

  async function handleUpload() {
    if (!userId) return showToast("err","Sign in first.")
    if (!file) return showToast("err","Pick a file.")
    setBusy(true)
    try {
      const path = `${userId}/${Date.now()}-${file.name}`
      const up = await supabase.storage.from("videos").upload(path, file)
      if (up.error) throw new Error(up.error.message)

      const ins = await supabase
        .from("jobs")
        .insert({ user_id: userId, status: "queued", source_path: path })
        .select("id")
        .single()
      if (ins.error || !ins.data) throw new Error(ins.error?.message || "Job insert failed")

      setJobId(ins.data.id)
      localStorage.setItem("lastJobId", ins.data.id)
      poll(ins.data.id)
      loadJobs(userId)
      showToast("ok","Upload queued ✅")
    } catch (e:any) {
      showToast("err", e.message || "Upload failed")
    } finally {
      setBusy(false)
    }
  }

  function poll(id: string) {
    setStatusText("checking…")
    const t = setInterval(async () => {
      const { data, error } = await supabase.from("jobs").select("*").eq("id", id).single()
      if (error) return
      const j = data as Job
      setStatusText(j?.status || "")
      if (j?.status === "done" && j?.output_path) {
        const { data: s } = await supabase.storage.from("videos").createSignedUrl(j.output_path, 600)
        if (s?.signedUrl) setDownloadUrl(s.signedUrl)
        clearInterval(t)
        showToast("ok","Processing finished 🎉")
      }
      if (j?.status === "error") {
        clearInterval(t)
        showToast("err","Processing error")
      }
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
    <div className="space-y-6 relative">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed right-6 top-20 z-50 rounded-md px-4 py-2 text-sm shadow-xl border ${
            toast.type === "ok" ? "bg-emerald-500/10 text-emerald-300 border-emerald-700/40" : "bg-red-500/10 text-red-300 border-red-700/40"
          }`}
        >
          {toast.msg}
        </div>
      )}

      <div className="rounded-2xl p-6" style={{background:"linear-gradient(120deg, rgba(124,92,255,0.2), rgba(124,92,255,0.05))", border:"1px solid var(--border)"}}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Create</h1>
            <p className="muted mt-1">Upload raw video → get a captioned, social-ready clip back.</p>
          </div>
          {!userId ? <button onClick={magicLink} className="btn">Sign in</button> : <span className="pill">Signed in</span>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Upload / Current Job */}
        <section className="card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-medium">Upload a video</h2>
            <span className="pill">MP4</span>
          </div>

          <label className="block">
            <input
              type="file"
              accept="video/mp4"
              onChange={(e)=>setFile(e.target.files?.[0]||null)}
              className="input"
              disabled={busy}
            />
            <div className="muted mt-1 text-xs">Choose a short clip (10–30s for testing).</div>
          </label>

          <div className="flex gap-3">
            <button onClick={handleUpload} className="btn disabled:opacity-60" disabled={busy}>
              {busy ? (
                <span className="inline-flex items-center gap-2">
                  <Spinner /> Uploading…
                </span>
              ) : (
                "Upload & Process"
              )}
            </button>
            <button onClick={()=> userId && loadJobs(userId)} className="btn btn-outline" disabled={busy}>
              Refresh
            </button>
          </div>

          {jobId && (
            <div className="mt-4 p-4 rounded-lg border" style={{borderColor:"var(--border)"}}>
              <div className="text-xs muted break-all">Job: {jobId}</div>
              <div className="mt-1">Status: {statusText || "—"}</div>
              {downloadUrl && <a className="underline text-sm break-all" href={downloadUrl} target="_blank" rel="noreferrer">Download processed video</a>}
            </div>
          )}
        </section>

        {/* Recent Jobs */}
        <section className="card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-medium">Your recent jobs</h2>
            <button onClick={()=> userId && loadJobs(userId)} className="btn btn-outline" disabled={busy}>
              Refresh
            </button>
          </div>
          <ul className="space-y-3">
            {jobs.map(j => <JobRow key={j.id} job={j} />)}
            {!jobs.length && <li className="muted text-sm">No jobs yet.</li>}
          </ul>
        </section>
      </div>
    </div>
  )
}

function JobRow({ job }: { job: Job }) {
  const [url, setUrl] = useState("")

  useEffect(() => {
    (async () => {
      if (job.status === "done" && job.output_path) {
        const { data } = await supabase.storage.from("videos").createSignedUrl(job.output_path, 600)
        setUrl(data?.signedUrl || "")
      }
    })()
  }, [job.status, job.output_path])

  return (
    <li className="p-3 rounded-lg border" style={{borderColor:"var(--border)"}}>
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs muted break-all">Job: {job.id}</div>
          <div className="mt-0.5">
            Status: <span className="pill">{job.status}</span>
            {job.status === "error" && job.error && <span className="ml-2 text-red-400 text-sm">({job.error})</span>}
          </div>
        </div>
        {url && <a className="btn btn-outline break-all" href={url} target="_blank" rel="noreferrer">Download</a>}
      </div>
    </li>
  )
}

function Spinner() {
  return (
    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/70 border-t-transparent" />
  )
}
