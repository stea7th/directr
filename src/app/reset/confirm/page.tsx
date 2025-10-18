"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function Page() {
  const sp = useSearchParams();
  const token = sp.get("token") || sp.get("code") || "";
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    let isMounted = true;

    async function confirm() {
      if (!token) return;
      setStatus("loading");
      try {
        const res = await fetch(`/api/confirm-client?token=${encodeURIComponent(token)}`, {
          method: "POST",
        });
        if (!isMounted) return;

        if (res.ok) {
          setStatus("ok");
          setMessage("All set — your account is confirmed.");
        } else {
          const t = await res.text();
          setStatus("error");
          setMessage(t || "Confirmation failed.");
        }
      } catch (err: any) {
        if (!isMounted) return;
        setStatus("error");
        setMessage(err?.message || "Something went wrong.");
      }
    }

    confirm();
    return () => {
      isMounted = false;
    };
  }, [token]);

  return (
    <main className="mx-auto max-w-md p-6">
      <h1 className="text-2xl font-semibold">Confirming…</h1>

      {!token && (
        <p className="mt-2 text-sm text-gray-500">
          Missing token. Try opening the link from your email again.
        </p>
      )}

      {status === "loading" && <p className="mt-4">Working on it…</p>}

      {status === "ok" && (
        <p className="mt-4 text-green-600">
          {message} You can close this tab or head to your dashboard.
        </p>
      )}

      {status === "error" && (
        <p className="mt-4 text-red-600">
          {message}
        </p>
      )}
    </main>
  );
}
