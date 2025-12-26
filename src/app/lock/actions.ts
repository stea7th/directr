// src/app/lock/actions.ts
"use server";

import { cookies } from "next/headers";

export async function unlockSite(formData: FormData) {
  const key = String(formData.get("key") ?? "");
  const expected = process.env.SITE_LOCK_KEY ?? "";

  if (!expected) return { ok: false, error: "SITE_LOCK_KEY is not set" };
  if (key.trim() !== expected.trim()) return { ok: false, error: "Wrong key. Try again." };

  const cookieStore = (await cookies()) as any;

  cookieStore.set("directr_unlocked", "true", {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  return { ok: true };
}

export async function relockSite() {
  const cookieStore = (await cookies()) as any;

  // delete cookie
  cookieStore.set("directr_unlocked", "", {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: 0,
  });

  return { ok: true };
}
