// src/app/jobs/[id]/page.tsx
import type { PageProps } from 'next';
import JobViewer from './viewer';

export default async function JobPage({ params }: PageProps<{ id: string }>) {
  const { id } = await params; // 👈 params is a Promise in Next 15
  return <JobViewer id={id} />;
}
