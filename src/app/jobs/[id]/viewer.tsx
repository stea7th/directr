"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";

type Job = {
  id: string;
  created_at?: string | null;

  type?: string | null;
  prompt?: string | null;

  // your app seems to use result_text now
  result_text?: string | null;

  // keep compatibility with older fields if they exist
  output_script?: string | null;
  output_video_url?: string | null;
  edited_url?: string | null;
  source_url?: string | null;

  platform?: string | null;
  goal?: string | null;
  tone?: string | null;
  length_seconds?: number | null;

  file_name?: string | null;
  file_type?: string | null;
  file_size?: number | null;

  user_id?: string | null;
};

type Props = {
  id: string;
  initialJob?: Job | null;
};

export default function Viewer({ id, initialJob }: Props) {
  const [job, setJob] = useState<Job | null>(initialJob ?? null);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      const { data, error } = await supabaseBrowser
        .from("jobs")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (!isMounted) return;

      if (!error && data) setJob(data as Job);
    }

    load();

    const channel = supabaseBrowser
      .channel(`job-${id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "jobs", filter: `id=eq.${id}` },
        (payload: { new: unknown }) => {
          // ✅ typed payload so TS strict stops complaining
          if (!isMounted) return;
          if (payload?.new) setJob(payload.new as Job);
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabaseBrowser.removeChannel(channel);
    };
  }, [id]);

  if (!job) {
    return (
      <div style={{ padding: 18, opacity: 0.8 }}>
        Loading…
      </div>
    );
  }

  const output =
    job.result_text ||
    job.output_script ||
    "No output on this job yet.";

  const url =
    job.output_video_url ||
    job.edited_url ||
    job.source_url ||
    null;

  return (
    <div style={{ width: "100%" }}>
      {url && (
        <p style={{ marginBottom: 10 }}>
          <strong>Clip:</strong>{" "}
          <a href={url} target="_blank" rel="noreferrer">
            Open
          </a>
        </p>
      )}

      <pre style={{ whiteSpace: "pre-wrap" }}>{output}</pre>
    </div>
  );
}
