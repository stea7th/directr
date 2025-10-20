"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function NewJobPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const [msg, setMsg] = useState("Creating job…");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const payload = {
          title: sp.get("title") || undefined,
          prompt: sp.get("prompt") || undefined,
        };
        const res = await fetch("/api/jobs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!alive) return;
        if (!res.ok) {
          const t = await res.text();
          setMsg(t || "Failed to create job.");
          return;
        }
        const { id } = await res.json();
        if (id) router.replace(`/jobs/${id}`);
        else setMsg("Job created but missing ID.");
      } catch (e: any) {
        if (!alive) return;
        setMsg(e?.message || "Network error while creating job.");
      }
    })();
    return () => {
      alive = false;
    };
  }, [router, sp]);

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="text-2xl font-semibold">Job #new</h1>
      <p className="mt-2">{msg}</p>
      <p className="mt-6">
        <a href="/jobs" className="underline">← Back to jobs</a>
      </p>
    </main>
  );
}
