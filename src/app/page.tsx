'use client'

import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function DirectrHome() {
  const [prompt, setPrompt] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setFile(e.target.files[0])
  }

  const handleGenerate = async () => {
    if (!prompt && !file) return
    setLoading(true)
    setResult(null)

    try {
      let fileUrl = ''
      if (file) {
        const { data, error } = await supabase.storage
          .from('uploads')
          .upload(`user_uploads/${file.name}`, file, { upsert: true })
        if (error) throw error
        fileUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/uploads/${data.path}`
      }

      const res = await fetch('/api/directr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, file: fileUrl }),
      })
      const json = await res.json()
      setResult(json.output || 'No response')
    } catch (err: any) {
      setResult('Error: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center py-12 px-4">
      {/* ✅ top header (keep logo + links, single clean row) */}
      <header className="w-full max-w-5xl flex justify-between items-center mb-16">
        <h1 className="text-xl font-semibold tracking-tight">directr<span className="text-[#00b7ff]">.</span></h1>
        <nav className="flex gap-6 text-sm text-gray-300">
          <a href="/create" className="hover:text-white">Create</a>
          <a href="/campaigns" className="hover:text-white">Campaigns</a>
          <a href="/analytics" className="hover:text-white">Analytics</a>
          <a href="/planner" className="hover:text-white">Planner</a>
          <a href="/settings" className="hover:text-white">Settings</a>
        </nav>
      </header>

      {/* ✅ main input area */}
      <section className="w-full max-w-lg bg-[#111] border border-[#1e1e1e] rounded-2xl p-8 shadow-md">
        <h2 className="text-lg font-medium mb-4">Type what you want or upload a file</h2>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Example: 'Turn this podcast into 5 viral TikToks'"
          className="w-full h-28 bg-[#161616] border border-[#2b2b2b] rounded-xl text-sm text-gray-200 p-3 focus:outline-none focus:border-[#00b7ff] resize-none mb-4"
        />
        <input
          type="file"
          accept="video/*,audio/*,text/*"
          onChange={handleFile}
          className="text-sm text-gray-400 mb-5"
        />
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full bg-[#00b7ff] hover:bg-[#009fe0] text-white font-semibold py-2.5 rounded-xl transition disabled:opacity-50"
        >
          {loading ? 'Processing...' : 'Generate'}
        </button>
      </section>

      {/* ✅ AI response */}
      {result && (
        <section className="w-full max-w-lg mt-8 bg-[#111] border border-[#1e1e1e] rounded-2xl p-6 text-sm leading-relaxed text-gray-200">
          <h3 className="text-[#00b7ff] font-semibold mb-2">Result</h3>
          <p className="whitespace-pre-wrap">{result}</p>
        </section>
      )}
    </main>
  )
}
