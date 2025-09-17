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
    if (error) return alert(error.message)
    alert("Check your email for a magic link.")
  }

  async function handleUpload() {
    if (!userId) return alert("Sign in first.")
    if (!file) return alert("Pick a file")
    const path = `${userId}/${Date.now()}-${file.name}`
    const up = await supabase.storage.from("videos").upload(path, file)
    if (up.error) return alert("Upload error: " + up.error.message)
    const ins = await supabase.from("jobs").insert({ user_id: userId, status: "queued", source_path: path }).select("id").single()
    if (ins.error || !ins.data) return alert("Job error: " + (ins.error?.message || "unknown"))
    setJobId(ins.data.id); localStorage.setItem("lastJobId", ins.data.id)
    poll(ins.data.id); loadJobs(userId)
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
    const { data } = await supabase.from("jobs").select("*").eq("user_id", uid).order("created_at", { ascending: false }).limit(25)
    setJobs((data || []) as Job[])
  }

  return (
    <div className="space-y-6">
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
        <section className="card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-medium">Upload a video</h2>
            <span className="pill">MP4</span>
          </div>
          <label className="block">
            <input type="file" accept="video/mp4" onChange={(e)=>setFile(e.target.files?.[0]||null)} className="input" />
            <div className="muted mt-1 text-xs">Choose a short clip (10–30s for testing).</div>
          </label>
          <div className="flex gap-3">
            <button onClick={handleUpload} className="btn">Upload & Process</button>
            <button onClick={()=> userId && loadJobs(userId)} className="btn btn-outline">Refresh</button>
          </div>

          {jobId && (
            <div className="mt-4 p-4 rounded-lg border" style={{borderColor:"var(--border)"}}>
              <div className="text-xs muted break-all">Job: {jobId}</div>
              <div className="mt-1">Status: {statusText || "—"}</div>
              {downloadUrl && <a className="underline text-sm break-all" href={downloadUrl} target="_blank" rel="noreferrer">Download processed video</a>}
            </div>
          )}
        </section>

        <section className="card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-medium">Your recent jobs</h2>
            <button onClick={()=> userId && loadJobs(userId)} className="btn btn-outline">Refresh</button>
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
  useEffect(() => { (async () => {
    if (job.status === "done" && job.output_path) {
      const { data } = await supabase.storage.from("videos").createSignedUrl(job.output_path, 600)
      setUrl(data?.signedUrl || "")
    }
  })() }, [job.status, job.output_path])
  return (
    <li className="p-3 rounded-lg border" style={{borderColor:"var(--border)"}}>
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs muted break-all">Job: {job.id}</div>
          <div className="mt-0.5">Status: <span className="pill">{job.status}</span>{job.status === "error" && job.error && <span className="ml-2 text-red-400 text-sm">({job.error})</span>}</div>
        </div>
        {url && <a className="btn btn-outline break-all" href={url} target="_blank" rel="noreferrer">Download</a>}
      </div>
    </li>
  )
}
