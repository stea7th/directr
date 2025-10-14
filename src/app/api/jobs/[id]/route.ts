// Server Component
import Link from "next/link";

type Params = { id: string };

export default async function JobPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { id } = await params; // Next 15: params is a Promise

  // TODO: fetch job details here (e.g., from Supabase or your API)
  // const job = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/jobs/${id}`).then(r => r.json());

  return (
    <main style={{ padding: 24 }}>
      <h1 style={{ marginBottom: 12 }}>Job #{id}</h1>
      <p>Details will go here.</p>
      <p style={{ marginTop: 20 }}>
        <Link href="/jobs">← Back to jobs</Link>
      </p>
    </main>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}) {
  const { id } = await params;
  return { title: `Job ${id} • Directr` };
}
