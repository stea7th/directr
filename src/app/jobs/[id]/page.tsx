// src/app/jobs/[id]/page.tsx
import JobViewer from './viewer';

type Params = { id: string };

export default async function JobPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { id } = await params; // Next 15: params is a Promise
  return <JobViewer id={id} />;
}
