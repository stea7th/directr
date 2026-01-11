import JobViewer from "./viewer";

export default async function JobPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <JobViewer id={id} />;
}
