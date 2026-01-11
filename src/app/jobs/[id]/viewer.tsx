import Viewer from "./viewer";

export default function JobPage({
  params,
}: {
  params: { id: string };
}) {
  return <Viewer id={params.id} />;
}
