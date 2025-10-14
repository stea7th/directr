// Server Component
import Link from "next/link";

type Params = { id: string };

// If you also use search params, they’re Promise-based too:
// type SearchParams = { [key: string]: string | string[] | undefined };

export default async function JobPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { id } = await params; // 👈 Next 15: params is a Promise

  // TODO: fetch your job by id here
  // const job = await getJob(id);

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

// (Optional) If you define metadata, also await params here.
export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}) {
  const { id } = await params;
  return {
    title: `Job ${id} • Directr`,
  };
}
