import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import ClientJob from "./ClientJob";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

function projectRefFromUrl(url: string) {
  const m = url.match(/^https?:\/\/([a-z0-9-]+)\.supabase\.co/i);
  return m?.[1] || null;
}

async function supabaseFromCookies() {
  const jar = await cookies();
  const ref = projectRefFromUrl(SUPABASE_URL);
  const accessToken =
    jar.get("sb-access-token")?.value ||
    (ref ? jar.get(`sb-${ref}-auth-token`)?.value : undefined) ||
    "";
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false },
    global: accessToken ? { headers: { Authorization: `Bearer ${accessToken}` } } : {},
  });
}

export default async function JobDetailPage({
  params,
}: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const supabase = await supabaseFromCookies();
  const { data: row, error } = await supabase
    .from("jobs")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !row) {
    return (
      <main className="mx-auto max-w-2xl p-6">
        <h1 className="text-2xl font-semibold">Job not found</h1>
        {error ? <p className="mt-2 text-sm text-red-500">{error.message}</p> : null}
        <p className="mt-6"><Link href="/jobs" className="underline">← Back to jobs</Link></p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="text-2xl font-semibold">
        {(row.title as string) || "Untitled Job"}{" "}
        <span className="text-gray-400 text-base">#{row.id}</span>
      </h1>

      {/* live status / retry */}
      <ClientJob id={id} initialStatus={row.status || "unknown"} />

      <p className="mt-6">
        <Link href="/jobs" className="underline">← Back to jobs</Link>
      </p>
    </main>
  );
}
