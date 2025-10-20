import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";

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

export default async function JobsPage() {
  const supabase = await supabaseFromCookies();
  const { data: ures } = await supabase.auth.getUser();
  if (!ures?.user) {
    return (
      <main className="mx-auto max-w-2xl p-6">
        <h1 className="text-2xl font-semibold">Jobs</h1>
        <p className="mt-2">
          <Link href="/login" className="underline">Sign in</Link> to view your jobs.
        </p>
      </main>
    );
  }

  const { data, error } = await supabase
    .from("jobs")
    .select("id,title,status,created_at")
    .eq("owner_id", ures.user.id)
    .order("created_at", { ascending: false });

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="text-2xl font-semibold">Jobs</h1>
      <p className="mt-4"><a href="/jobs/new" className="underline">+ New job</a></p>
      {error ? (
        <p className="mt-3 text-red-500">{error.message}</p>
      ) : (
        <ul className="mt-4 space-y-2">
          {(data || []).map((j) => (
            <li key={j.id}>
              <Link href={`/jobs/${j.id}`} className="underline">{j.title}</Link>{" "}
              <span className="text-gray-400">({j.status})</span>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
