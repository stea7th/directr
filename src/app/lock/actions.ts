"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const COOKIE = "directr_unlocked";

function cookieOpts() {
  return {
    path: "/",
    httpOnly: true as const,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  };
}

export async function unlockAction(formData: FormData) {
  const key = String(formData.get("key") || "").trim();
  const expected = String(process.env.SITE_LOCK_KEY || "").trim();

  // If no key configured, don't lock people out
  if (!expected) {
    const c = await cookies();
    c.set(COOKIE, "1", cookieOpts());
    redirect("/create");
  }

  if (!key || key !== expected) {
    return { ok: false, error: "Wrong key. Try again." } as const;
  }

  const c = await cookies();
  c.set(COOKIE, "1", cookieOpts());
  redirect("/create");
}

export async function relockAction() {
  const c = await cookies();
  c.set(COOKIE, "", { path: "/", maxAge: 0 });
  redirect("/lock");
}
