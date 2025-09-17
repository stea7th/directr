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

export default function Page() {
  const [userId, setUserId] = useState<string>("")
  const [file, setFile] = useState<File | null>(null)
  const [jobId, setJobId] = useState<string>("")
  const [statusText, setStatusText] = useState<string>("")
  const [downloadUrl, setDownloadUrl] = useState<string>("")
  const [jobs, setJobs] = useState<Job[]>([])

  // restore last job on reload
  useEffect(() => {
    ;(async () => {
      const { data } = await supabase.auth.getUser()
      const uid = data.user?.id || ""
      setUserId(uid)
      if (uid) loadJobs(uid)
      const last = typeof window !== "undefined" ? localStorage.getItem("lastJobId") : null
      if (last) {
        setJobId(last)
        poll(last)
      }
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

    const ins = await supabase
      .from("jobs")
      .insert({ user_id: userId, status: "queued", source_path: path })
      .select("id")
      .single()

    if (ins.error || !ins.data) return alert("Job error: " + (ins.error?.message || "unknown"))
    setJobId(ins.data.id)
    if (typeof window !== "undefined") localStorage.setItem("lastJobId", ins.data.id)
    poll(ins.data.id)
    loadJobs(userId)
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
      }
      if (j?.status === "error") clearInterval(t)
    }, 2000)
  }

  async function loadJobs(uid: string) {
    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .eq("user_id", uid)
      .order("created_at", { ascending: false })
      .limit(25)
    if (!error && data) setJobs(data as Job[])
  }

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Directr — Create</h1>
        {!userId ? (
          <button onClick={magicLink} className="border px-3 py-2 rounded">Sign in</button>
        ) : (
          <div className="text-sm text-gray-500">Signed in</div>
        )}
      </header>

      {/* Upload */}
      <section className="space-y-3 border rounded p-4">
        <div className="font-medium">Upload a video</div>
        <input type="file" accept="video/mp4" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        <button onClick={handleUpload} className="border px-3 py-2 rounded">Upload & Process</button>
      </section>

      {/* Current job status */}
      {jobId && (
        <section className="space-y-2 border rounded p-4">
          <div className="text-sm text-gray-500 break-all">Job: {jobId}</div>
          <div>Status: {statusText || "—"}</div>
          {downloadUrl && (
            <a
              href={downloadUrl}
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 underline break-all"
            >
              Download processed video
            </a>
          )}
        </section>
      )}

      {/* Recent jobs */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Your recent jobs</h2>
          <button
            onClick={() => userId && loadJobs(userId)}
            className="text-sm border px-2 py-1 rounded"
          >
            Refresh
          </button>
        </div>

        <ul className="space-y-2">
          {jobs.map((j) => (
            <JobRow key={j.id} job={j} />
          ))}
          {!jobs.length && <li className="text-gray-500">No jobs yet.</li>}
        </ul>
      </section>
    </main>
  )
}

function JobRow({ job }: { job: Job }) {
  const [url, setUrl] = useState<string>("")

  useEffect(() => {
    ;(async () => {
      if (job.status === "done" && job.output_path) {
        const { data } = await supabase.storage.from("videos").createSignedUrl(job.output_path, 600)
        setUrl(data?.signedUrl || "")
      }
    })()
  }, [job.status, job.output_path])

  return (
    <li className="border rounded p-3">
      <div className="text-sm text-gray-500 break-all">Job: {job.id}</div>
      <div className="flex items-center gap-3">
        <span>Status: {job.status}</span>
        {job.status === "error" && job.error && <span className="text-red-600">({job.error})</span>}
        {url && (
          <a className="text-blue-600 underline break-all" href={url} target="_blank" rel="noreferrer">
            Download
          </a>
        )}
      </div>
    </li>
  )
}
