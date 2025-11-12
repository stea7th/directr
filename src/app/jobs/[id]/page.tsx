// src/app/jobs/[id]/page.tsx
import JobViewer from "./viewer";

// Server component that just renders the client viewer.
// JobViewer reads the [id] from useParams() internally.
export default function JobPage() {
  return <JobViewer />;
}
