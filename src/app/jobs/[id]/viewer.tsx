import JobViewer from "./viewer";

export default function JobPage({
  params,
}: {
  params: { id: string };
}) {
  return <JobViewer id={params.id} />;
}
