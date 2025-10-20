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
  const jar = await cookies(); // Next 15
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
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await supabaseFromCookies();
  const { data: ures } = await supabase.auth.getUser();
  if (!ures?.user) {
    return (
      <main className="mx-auto max-w-2xl p-6">
        <h1 className="text-2xl font-semibold">Not signed in</h1>
        <p className="mt-2">
          <Link href="/login" className="underline">
            Go to login
          </Link>
        </p>
      </main>
    );
  }

  const { data, error } = await supabase
    .from("jobs")
    .select("id,title,status,prompt,created_at")
    .eq("id", id)
    .eq("owner_id", ures.user.id)
    .single();

  if (error) {
    return (
      <main className="mx-auto max-w-2xl p-6">
        <h1 className="text-2xl font-semibold">Job not found</h1>
        <p className="mt-2 text-sm text-red-500">{error.message}</p>
        <p className="mt-6">
          <Link href="/jobs" className="underline">
            ← Back to jobs
          </Link>
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="text-2xl font-semibold">{data.title} <span className="text-gray-400 text-base">#{data.id}</span></h1>
      <p className="mt-2 text-sm text-gray-400">Status: <span className="font-medium text-white">{data.status}</span></p>
      {data.prompt ? <pre className="mt-4 whitespace-pre-wrap">{data.prompt}</pre> : null}
      <p className="mt-6">
        <Link href="/jobs" className="underline">
          ← Back to jobs
        </Link>
      </p>
    </main>
  );
}
