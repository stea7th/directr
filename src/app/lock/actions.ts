// src/app/lock/actions.ts
"use server";

import { createServerClient } from "@/lib/supabase/server";

type ActionResult =
  | { ok: true }
  | { ok: false; error: string };

function cleanEmail(v: unknown) {
  return typeof v === "string" ? v.trim().toLowerCase() : "";
}

export async function waitlistAction(formData: FormData): Promise<ActionResult> {
  try {
    const email = cleanEmail(formData.get("email"));

    if (!email || !email.includes("@")) {
      return { ok: false, error: "Enter a real email." };
    }

    const supabase = await createServerClient();

    const { error } = await supabase.from("waitlist").insert({
      email,
      source: "lock",
    });

    if (error) {
      // IMPORTANT: this is the error you need to see (RLS, missing table, wrong project, etc.)
      console.error("waitlist insert error:", error);
      return { ok: false, error: error.message };
    }

    return { ok: true };
  } catch (e: any) {
    console.error("waitlist action crashed:", e);
    return { ok: false, error: e?.message || "Unknown error" };
  }
}
