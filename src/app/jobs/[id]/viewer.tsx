"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

type Job = {
  id: string;
  user_id?: string | null;
  type?: string | null;
  prompt?: string | null;
  result_text?: string | null;
  output_script?: string | null;
  output_video_url?: string | null;
  edited_url?: string | null;
  source_url?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export default function JobViewer({ id }: { id: string }) {
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    try {
      setErr(null);
      setLoading(true);

      const { data, error } = await supabaseBrowser
        .from("jobs")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;

      setJob((data as Job) ?? null);
    } catch (e: any) {
      setErr(e?.message ?? "Failed to load job.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();

    const channel = supabaseBrowser
      .channel(`job:${id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "jobs", filter: `id=eq.${id}` },
        (payload: RealtimePostgresChangesPayload<Job>) => {
          if (payload?.new) setJob(payload.new as Job);
        }
      )
      .subscribe();

    return () => {
      supabaseBrowser.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) {
    return (
      <div className="card" style={{ maxWidth: 920, margin: "0 auto" }}>
        <div className="title">Loading…</div>
        <div className="subtitle">Pulling your job.</div>
      </div>
    );
  }

  if (err) {
    return (
      <div className="card" style={{ maxWidth: 920, margin: "0 auto" }}>
        <div className="title">Couldn’t load</div>
        <div style={{ color: "#fecaca", fontSize: 13, marginTop: 8 }}>{err}</div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="card" style={{ maxWidth: 920, margin: "0 auto" }}>
        <div className="title">Not found</div>
        <div className="subtitle">This job doesn’t exist (or you don’t have access).</div>
      </div>
    );
  }

  const output =
    job.output_script ||
    job.result_text ||
    "No output saved for this job yet.";

  const url =
    job.output_video_url ||
    job.edited_url ||
    job.source_url ||
    null;

  return (
    <div style={{ maxWidth: 920, margin: "0 auto" }}>
      <div className="card">
        <div className="card__head">
          <div>
            <div className="title">Job</div>
            <div className="subtitle">{job.type || "hooks"}</div>
          </div>
        </div>

        {job.prompt && (
          <div style={{ marginTop: 12 }}>
            <div style={{ opacity: 0.7, fontSize: 12, marginBottom: 6 }}>Prompt</div>
            <pre style={{ whiteSpace: "pre-wrap" }}>{job.prompt}</pre>
          </div>
        )}

        {url && (
          <div style={{ marginTop: 12 }}>
            <div style={{ opacity: 0.7, fontSize: 12, marginBottom: 6 }}>Link</div>
            <a href={url} target="_blank" rel="noreferrer">
              Open
            </a>
          </div>
        )}

        <div style={{ marginTop: 12 }}>
          <div style={{ opacity: 0.7, fontSize: 12, marginBottom: 6 }}>Output</div>
          <pre style={{ whiteSpace: "pre-wrap" }}>{output}</pre>
        </div>
      </div>
    </div>
  );
}
