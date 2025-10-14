'use client';

import { useState } from 'react';

export default function AppHub() {
  const [prompt, setPrompt] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onGenerate() {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      // TODO: hook this to /api/generate later
      alert('Stub: wire to your AI or Supabase endpoint');
    } catch (e: any) {
      setError(e?.message || 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-[#0a0a0a] text-white px-4">
      <section className="w-full max-w-2xl rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 shadow-lg">
        <h2 className="text-xl font-semibold mb-6 tracking-tight">
          Type what you want or upload a file
        </h2>

        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Example: Turn this podcast into 5 viral TikToks"
          className="w-full h-28 rounded-xl bg-[#111111] border border-[#1e1e1e] text-gray-200 text-sm p-3 mb-4 focus:outline-none focus:border-[#00b7ff] placeholder:text-gray-500"
        />

        <div className="flex items-center justify-between gap-4 mb-6">
          <label className="cursor-pointer bg-[#111111] border border-[#1e1e1e] text-gray-300 rounded-xl px-4 py-2 text-sm hover:border-[#00b7ff] transition">
            Choose file
            <input
              type="file"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </label>
          <span className="text-sm text-gray-400 truncate">
            {file ? file.name : 'No file chosen'}
          </span>
        </div>

        {error && <div className="text-sm text-red-400 mb-3">{error}</div>}

        <button
          onClick={onGenerate}
          disabled={busy}
          className="w-full bg-[#00b7ff] hover:bg-[#009fe0] text-black font-semibold py-2.5 rounded-xl transition disabled:opacity-50"
        >
          {busy ? 'Generating…' : 'Generate'}
        </button>
      </section>

      <section className="w-full max-w-2xl grid grid-cols-1 sm:grid-cols-3 gap-4 mt-10 text-sm">
        <a
          href="/create"
          className="rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition p-4 text-gray-200"
        >
          <div className="font-semibold text-white">Create</div>
          <div className="text-gray-400 text-xs mt-1">
            Upload → get captioned clips
          </div>
        </a>

        <a
          href="/clipper"
          className="rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition p-4 text-gray-200"
        >
          <div className="font-semibold text-white">Clipper</div>
          <div className="text-gray-400 text-xs mt-1">
            Auto-find hooks & moments
          </div>
        </a>

        <a
          href="/planner"
          className="rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition p-4 text-gray-200"
        >
          <div className="font-semibold text-white">Planner</div>
          <div className="text-gray-400 text-xs mt-1">
            Plan posts & deadlines
          </div>
        </a>
      </section>
    </main>
  );
}
