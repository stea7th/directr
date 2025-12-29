// src/app/lock/actions.ts
"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createServerClient } from "@/lib/supabase/server";

type ActionResult = { ok: true } | { ok: false; error: string };

function cleanStr(v: unknown) {
  return typeof v === "string" ? v.trim() : "";
}

function cleanEmail(v: unknown) {
  return typeof v === "string" ? v.trim().toLowerCase() : "";
}

export async function unlockAction(formData: FormData) {
  const key = cleanStr(formData.get("key"));
  const expected = process.env.SITE_LOCK_KEY || "";

  const cookieStore = await cookies();

  // If no key is set, just unlock
  if (!expected) {
    cookieStore.set("directr_unlocked", "1", {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: true,
    });
    redirect("/create");
  }

  if (!key || key !== expected) {
    return { ok: false, error: "Wrong key. Try again." } as ActionResult;
  }

  cookieStore.set("directr_unlocked", "1", {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: true,
  });

  redirect("/create");
}

export async function relockAction() {
  const cookieStore = await cookies();

  cookieStore.set("directr_unlocked", "", {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    maxAge: 0,
  });

  redirect("/lock");
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
      console.error("waitlist insert error:", error);
      return { ok: false, error: error.message };
    }

    return { ok: true };
  } catch (e: any) {
    console.error("waitlist action crashed:", e);
    return { ok: false, error: e?.message || "Unknown error" };
  }
}
