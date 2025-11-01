// Server component wrapper
import JobViewer from './viewer';

type Props = { params: { id: string } };

export default async function JobPage({ params }: Props) {
  return <JobViewer id={params.id} />;
}
