'use client'

import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function HomePage() {
  const [input, setInput] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleSubmit = async () => {
    if (!input && !file) return
    setLoading(true)
    setResult(null)

    try {
      // Step 1: Upload file to Supabase Storage (if any)
      let fileUrl = ''
      if (file) {
        const { data, error } = await supabase.storage
          .from('uploads')
          .upload(`user_uploads/${file.name}`, file, { upsert: true })

        if (error) throw error
        fileUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/uploads/${data.path}`
      }

      // Step 2: Call AI endpoint (this will be your planner/clipper logic)
      const res = await fetch('/api/directr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: input, file: fileUrl }),
      })

      const json = await res.json()
      setResult(json.output || 'No output returned')
    } catch (err: any) {
      console.error(err)
      setResult('Error: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#0b0b0b',
        color: '#fff',
        padding: '4rem 2rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      {/* Navbar */}
      <nav
        style={{
          width: '100%',
          maxWidth: '900px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '3rem',
        }}
      >
        <h1 style={{ fontWeight: 600, fontSize: '1.5rem', letterSpacing: '-0.02em' }}>
          DIRECTR
        </h1>
        <div style={{ display: 'flex', gap: '1.2rem' }}>
          <a href="/planner">Planner</a>
          <a href="/clipper">Clipper</a>
          <a href="/campaigns">Campaigns</a>
        </div>
      </nav>

      {/* Main Input Section */}
      <div
        style={{
          width: '100%',
          maxWidth: '700px',
          background: '#121212',
          borderRadius: 14,
          padding: '2rem',
          boxShadow: '0 0 20px rgba(0,0,0,0.3)',
        }}
      >
        <h2 style={{ marginBottom: '1rem', fontSize: '1.1rem', fontWeight: 500 }}>
          Type what you want or upload a file
        </h2>

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Example: 'Turn this podcast into 5 viral TikToks'"
          style={{
            width: '100%',
            minHeight: '100px',
            background: '#181818',
            border: '1px solid #333',
            borderRadius: 10,
            color: '#fff',
            padding: '0.8rem',
            resize: 'none',
            marginBottom: '1rem',
          }}
        />

        <input
          type="file"
          accept="video/*,audio/*,text/*"
          onChange={handleFileUpload}
          style={{ marginBottom: '1rem' }}
        />

        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            background: '#00b7ff',
            border: 'none',
            borderRadius: 10,
            padding: '0.8rem 1.5rem',
            color: '#fff',
            fontWeight: 600,
            cursor: 'pointer',
            width: '100%',
          }}
        >
          {loading ? 'Processing...' : 'Generate'}
        </button>
      </div>

      {/* Result Section */}
      {result && (
        <div
          style={{
            marginTop: '2rem',
            width: '100%',
            maxWidth: '700px',
            background: '#121212',
            padding: '1.5rem',
            borderRadius: 12,
          }}
        >
          <h3 style={{ marginBottom: '1rem', color: '#00b7ff' }}>Output</h3>
          <p style={{ whiteSpace: 'pre-wrap' }}>{result}</p>
        </div>
      )}
    </main>
  )
}
