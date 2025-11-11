// src/app/page.tsx
import Link from "next/link";
import { createServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type JobRow = {
  id: string;
  status?: string | null;
  created_at?: string | null;
  input_prompt?: string | null;
  prompt?: string | null;
  file_name?: string | null;
  input_file?: string | null;
  owner_id?: string | null;
};

type UserJobsResult = {
  user: { id: string; email?: string | null } | null;
  jobs: JobRow[];
};

function Badge({ status }: { status?: string | null }) {
  const text = (status || "queued").toLowerCase();
  const color =
    text === "done"
      ? "border-green-700/50 bg-green-900/20 text-green-200"
      : text === "processing"
      ? "border-cyan-700/50 bg-cyan-900/20 text-cyan-200"
      : text === "error"
      ? "border-red-700/50 bg-red-900/20 text-red-200"
      : "border-zinc-700/60 bg-zinc-900/30 text-zinc-200/80";

  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs border ${color}`}>
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          text === "done"
            ? "bg-green-300"
            : text === "processing"
            ? "bg-cyan-300"
            : text === "error"
            ? "bg-red-300"
            : "bg-zinc-400"
        }`}
      />
      {text}
    </span>
  );
}

function Card({ title, desc, href }: { title: string; desc: string; href: string }) {
  return (
    <Link
      href={href}
      className="block rounded-2xl border border-white/10 bg-[#111] p-5 hover:shadow-[0_0_0_2px_rgba(14,165,233,.35)] transition-shadow"
    >
      <div className="text-[15px] font-semibold">{title}</div>
      <div className="mt-1 text-sm text-zinc-400">{desc}</div>
    </Link>
  );
}

async function getUserAndJobs(): Promise<UserJobsResult> {
  const supabase = await createServerClient();

  const { data: auth } = await supabase.auth.getUser();
  const user = auth?.user ? { id: auth.user.id, email: auth.user.email } : null;

  if (!user) {
    return { user: null, jobs: [] };
  }

  const { data: rows } = await supabase
    .from("jobs")
    .select("*")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5);

  return { user, jobs: (rows as JobRow[]) || [] };
}

export default async function Home() {
  const { user, jobs } = await getUserAndJobs();

  return (
    <main className="min-h-[calc(100vh-60px)] px-5 sm:px-6 md:px-8 py-8 bg-[#0a0a0a] text-white">
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">
            directr<span className="text-sky-400">.</span>
          </h1>
          <nav className="hidden sm:flex items-center gap-4 text-sm text-zinc-400">
            <Link href="/create" className="hover:text-white">Create</Link>
            <Link href="/clipper" className="hover:text-white">Clipper</Link>
            <Link href="/planner" className="hover:text-white">Planner</Link>
            <Link href="/jobs" className="hover:text-white">Jobs</Link>
          </nav>
        </div>

        <p className="mt-2 text-zinc-400">
          {user ? (
            <>Welcome back, <span className="text-zinc-200">{user.email}</span>.</>
          ) : (
            <>Log in to create a job or explore the tools.</>
          )}
        </p>

        {!user && (
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/login"
              className="inline-flex h-9 items-center rounded-xl bg-sky-500 px-4 text-sm font-medium text-white hover:brightness-105"
            >
              Sign in
            </Link>
            <Link
              href="/create"
              className="inline-flex h-9 items-center rounded-xl border border-white/10 bg-[#0f0f0f] px-4 text-sm text-zinc-200 hover:shadow-[0_0_0_2px_rgba(255,255,255,.08)]"
            >
              Continue as guest (limited)
            </Link>
          </div>
        )}
      </header>

      {/* Quick actions */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card title="Create" desc="Upload → get captioned clips" href="/create" />
        <Card title="Clipper" desc="Auto-find hooks & moments" href="/clipper" />
        <Card title="Planner" desc="Plan posts & deadlines" href="/planner" />
      </section>

      {/* Recent jobs */}
      <section className="mt-10">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent jobs</h2>
          <Link href="/jobs" className="text-sm text-sky-400 hover:opacity-90">View all →</Link>
        </div>

        {user ? (
          jobs.length ? (
            <ul className="space-y-2">
              {jobs.map((j) => {
                const title =
                  j.file_name ||
                  j.input_file ||
                  j.input_prompt ||
                  j.prompt ||
                  `Job ${j.id.slice(0, 8)}`;
                return (
                  <li key={j.id} className="rounded-xl border border-white/10 bg-[#101010] p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div>
                        <Link href={`/jobs/${j.id}`} className="font-medium hover:underline">
                          {title}
                        </Link>
                        <div className="text-xs text-zinc-400 mt-0.5">
                          {new Date(j.created_at || Date.now()).toLocaleString()}
                        </div>
                      </div>
                      <Badge status={j.status} />
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="rounded-xl border border-white/10 bg-[#101010] p-6 text-zinc-400">
              No jobs yet.{" "}
              <Link href="/create" className="text-sky-400">Create your first job →</Link>
            </div>
          )
        ) : (
          <div className="rounded-xl border border-white/10 bg-[#101010] p-6 text-zinc-400">
            Sign in to see your recent jobs.{" "}
            <Link href="/login" className="text-sky-400">Go to login →</Link>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="mt-12 border-t border-white/10 pt-6 text-sm text-zinc-500">
        © {new Date().getFullYear()} directr ·{" "}
        <Link href="/terms" className="hover:text-zinc-300">Terms</Link>{" "}
        ·{" "}
        <Link href="/privacy" className="hover:text-zinc-300">Privacy</Link>
      </footer>
    </main>
  );
}
