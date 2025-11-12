"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Job = {
  id: string;
  status: string | null;
  input_path: string | null;
  output_path: string | null;
  created_at: string;
  error: string | null;
  meta: any | null;
};

export default function JobViewer() {
  const { id } = useParams<{ id: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();

    async function fetchJob() {
      setLoading(true);
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .eq("id", id)
        .single();

      if (error) setErr(error.message);
      else setJob(data as Job);
      setLoading(false);
    }

    fetchJob();

    // live updates
    const channel = supabase
      .channel(`job:${id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "jobs", filter: `id=eq.${id}` },
        (payload) => {
          setJob(payload.new as Job);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  if (loading) return <div className="container"><div className="card">Loading…</div></div>;
  if (err) return <div className="container"><div className="card job__err">{err}</div></div>;
  if (!job) return <div className="container"><div className="card">Not found.</div></div>;

  return (
    <div className="container">
      <div className="card">
        <div className="card__head">
          <div className="job__title">Job {job.id}</div>
          <span className={`badge ${job.status === "done" ? "badge--ok" : job.status === "error" ? "badge--err" : "badge--warn"}`}>
            {job.status ?? "unknown"}
          </span>
        </div>
        <div className="job__meta">
          Created {new Date(job.created_at).toLocaleString()}
        </div>
        {job.error && <div className="job__err">Error: {job.error}</div>}
        <div className="grid" style={{gridTemplateColumns: "1fr 1fr"}}>
          <div>
            <span>Input</span>
            <div className="job__meta">{job.input_path ?? "—"}</div>
          </div>
          <div>
            <span>Output</span>
            <div className="job__meta">{job.output_path ?? "—"}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
