import React from "react";
import Link from "next/link";
import { createServerClient } from "@/lib/supabase/server";

// Next 15 passes params as a Promise — await it.
export default async function JobPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;

  const supabase = await createServerClient();

  // (optional) keep the auth gate, since your page shows that "Not signed in" state
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return (
      <main className="container" style={{ padding: 24 }}>
        <h2 className="title">Not signed in</h2>
        <p className="subtitle">You must be signed in to view this job.</p>
        <Link className="btn btn--primary" href="/login">Sign in</Link>
      </main>
    );
  }

  const { data: job, error } = await supabase
    .from("jobs")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    return (
      <main className="container" style={{ padding: 24 }}>
        <h2 className="title">Job not found</h2>
        <div className="job__err">{error.message}</div>
        <Link href="/" className="btn btn--ghost">Back home</Link>
      </main>
    );
  }

  return (
    <main className="container" style={{ padding: 24 }}>
      <h1 className="title">{job.title || "Job"}</h1>
      <div className="card" style={{ display: "grid", gap: 8 }}>
        <div><span className="badge">ID</span> <code>{job.id}</code></div>
        <div><span className="badge">Status</span> <strong>{job.status}</strong></div>
        {job.file_name && <div><span className="badge">File</span> {job.file_name}</div>}
        {job.input_url && <div className="job__meta">{job.input_url}</div>}
      </div>
      <div className="actions">
        <Link href="/" className="btn">Back</Link>
      </div>
    </main>
  );
}
