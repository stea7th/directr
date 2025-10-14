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
      // TODO: replace with your real endpoint
      // Example:
      // const fd = new FormData();
      // fd.append('prompt', prompt);
      // if (file) fd.append('file', file);
      // const res = await fetch('/api/generate', { method: 'POST', body: fd });
      // if (!res.ok) throw new Error(await res.text());

      alert('Stub: wire this button to your /api endpoint.');
    } catch (e: any) {
      setError(e?.message || 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="container mx-auto max-w-3xl px-4 md:px-6 py-10">
      <section className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-5 md:p-6">
        <h2 className="text-xl font-semibold tracking-[-0.02em] text-white mb-4">
          Type what you want or upload a file
        </h2>

        <div className="space-y-4">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={`Example: Turn this podcast into 5 viral TikToks`}
            className="w-full min-h-[120px] resize-y rounded-xl bg-neutral-900/60 text-neutral-100 placeholder:text-neutral-500 border border-white/10 focus:outline-none focus:ring-2 focus:ring-sky-500/70 px-4 py-3"
          />

          <div className="flex items-center gap-3">
            <label className="inline-flex items-center px-3 py-2 rounded-lg border border-white/10 bg-neutral-900/60 hover:bg-neutral-900/80 cursor-pointer">
              <input
                type="file"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
              <span className="text-sm text-neutral-200">Choose file</span>
            </label>
            <span className="text-sm text-neutral-400 truncate">
              {file ? file.name : 'No file chosen'}
            </span>
          </div>

          {error && (
            <div className="text-sm text-red-400">{error}</div>
          )}

          <button
            onClick={onGenerate}
            disabled={busy}
            className="w-full md:w-auto inline-flex items-center justify-center rounded-lg bg-sky-500 hover:bg-sky-400 disabled:opacity-60 disabled:cursor-not-allowed px-5 py-2.5 text-sm font-semibold text-black transition"
          >
            {busy ? 'Generating…' : 'Generate'}
          </button>
        </div>
      </section>

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <a href="/create" className="rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition p-4 text-neutral-200">
          <div className="font-semibold text-white">Create</div>
          <div className="text-sm text-neutral-400">Upload → get captioned clips</div>
        </a>
        <a href="/clipper" className="rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition p-4 text-neutral-200">
          <div className="font-semibold text-white">Clipper</div>
          <div className="text-sm text-neutral-400">Auto-find hooks & moments</div>
        </a>
        <a href="/planner" className="rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition p-4 text-neutral-200">
          <div className="font-semibold text-white">Planner</div>
          <div className="text-sm text-neutral-400">Plan tasks, posts & deadlines</div>
        </a>
      </div>
    </main>
  );
}
