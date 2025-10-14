export default function Home() {
  return (
    <main className="container mx-auto max-w-5xl px-4 md:px-6 py-16">
      <section className="text-center">
        <h1 className="text-3xl md:text-4xl font-semibold tracking-[-0.02em] text-white">
          Directr — create, clip & plan faster
        </h1>
        <p className="mt-3 text-neutral-400">
          Upload a video or type what you want. Get smart clips, posts, and a plan in minutes.
        </p>

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href="/app"
            className="inline-flex items-center justify-center rounded-lg bg-sky-500 hover:bg-sky-400 px-5 py-2.5 text-sm font-semibold text-black transition"
          >
            Get started
          </a>
          <a
            href="/create"
            className="inline-flex items-center justify-center rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 px-5 py-2.5 text-sm font-semibold text-white transition"
          >
            Go to Create
          </a>
        </div>
      </section>

      <section className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4">
        <a href="/clipper" className="rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition p-5">
          <div className="text-white font-semibold">AI Clipper</div>
          <div className="text-sm text-neutral-400 mt-1">
            Finds hooks, generates subtitles, and formats for socials.
          </div>
        </a>
        <a href="/planner" className="rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition p-5">
          <div className="text-white font-semibold">Planner</div>
          <div className="text-sm text-neutral-400 mt-1">
            Campaign tasks, due dates, and progress in one place.
          </div>
        </a>
        <a href="/campaigns" className="rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition p-5">
          <div className="text-white font-semibold">Campaigns</div>
          <div className="text-sm text-neutral-400 mt-1">
            Group content by goals and track results.
          </div>
        </a>
      </section>
    </main>
  );
}
