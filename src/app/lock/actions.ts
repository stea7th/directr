// src/app/lock/actions.ts
"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

function getCookieStore() {
  // Next 15 typings sometimes treat cookies() as async. This normalizes it.
  return cookies() as any;
}

export async function unlockAction(formData: FormData) {
  const key = String(formData.get("key") || "");
  const from = String(formData.get("from") || "/create");

  const enabled = process.env.SITE_LOCK_ENABLED === "true";
  const expected = process.env.SITE_LOCK_KEY || "";

  if (!enabled) redirect(from);

  if (!expected || key !== expected) {
    redirect(`/lock?from=${encodeURIComponent(from)}&error=1`);
  }

  const store = getCookieStore();
  store.set("directr_unlocked", "true", {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  redirect(from);
}

export async function relockAction() {
  const store = getCookieStore();
  store.set("directr_unlocked", "false", {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: 0,
  });
  redirect("/lock");
}

export async function waitlistAction() {
  redirect(
    "mailto:founder@directr.so?subject=Directr%20Waitlist&body=Name%3A%0AEmail%3A%0AUse%20case%3A"
  );
}

export async function requestAccessAction() {
  redirect(
    "mailto:founder@directr.so?subject=Request%20Directr%20Access&body=Name%3A%0AEmail%3A%0AWhy%20you%3A%0A"
  );
}
