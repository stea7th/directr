// src/app/lock/actions.ts
"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createServerClient } from "@/lib/supabase/server";

type ActionResult =
  | { ok: true }
  | { ok: false; error: string };

function cleanStr(v: unknown) {
  return typeof v === "string" ? v.trim() : "";
}

function cleanEmail(v: unknown) {
  return typeof v === "string" ? v.trim().toLowerCase() : "";
}

/**
 * Unlocks the site by setting a cookie and redirecting to /create.
 * Expects FormData with key="..."
 */
export async function unlockAction(formData: FormData) {
  const key = cleanStr(formData.get("key"));

  // change this if you use a different env var name
  const expected = process.env.SITE_LOCK_KEY || "";

  if (!expected) {
    // if you don't set a key, don't lock people out
    cookies().set("directr_unlocked", "1", {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: true,
    });
    redirect("/create");
  }

  if (!key || key !== expected) {
    // IMPORTANT: in Next server actions you can throw to show client error
    // but we'll just return a message-compatible response if you ever want it.
    return { ok: false, error: "Wrong key. Try again." } as ActionResult;
  }

  cookies().set("directr_unlocked", "1", {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: true,
  });

  redirect("/create");
}

/**
 * Relocks the site by removing the unlock cookie.
 */
export async function relockAction() {
  cookies().set("directr_unlocked", "", {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    maxAge: 0,
  });

  redirect("/lock");
}

/**
 * Waitlist insert into Supabase public.waitlist table.
 * Expects FormData with email="..."
 */
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
