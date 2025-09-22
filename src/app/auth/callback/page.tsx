"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    async function run() {
      try {
        await supabase.auth.exchangeCodeForSession(window.location.href);
      } catch (e) {
        console.error("Auth error:", e);
      } finally {
        router.replace("/app");
      }
    }
    run();
  }, [router]);

  return <div className="p-6 text-neutral-500">Signing you in…</div>;
}
