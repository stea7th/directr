// src/app/page.tsx
"use client";

export default function Page() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Left column: keep your upload form + controls here */}
      <section className="rounded-xl border border-white/10 bg-neutral-900/50 p-6">
        {/* paste your existing upload form JSX here (inputs, buttons, etc.) */}
      </section>

      {/* Right column: keep your jobs list here */}
      <section className="rounded-xl border border-white/10 bg-neutral-900/50 p-6">
        {/* paste your existing jobs list JSX here */}
      </section>
    </div>
  );
}
