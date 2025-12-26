"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

function isLockEnabled() {
  return process.env.SITE_LOCK_ENABLED === "true";
}

function expectedKey() {
  return process.env.SITE_LOCK_KEY || "";
}

export async function unlockAction(formData: FormData) {
  if (!isLockEnabled()) redirect("/create");

  const key = String(formData.get("key") ?? "");
  if (!key || key !== expectedKey()) {
    redirect("/lock?error=1");
  }

  const jar = await cookies();
  jar.set("directr_unlocked", "true", {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  redirect("/create");
}

export async function relockAction() {
  const jar = await cookies();
  jar.set("directr_unlocked", "false", {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: 0,
  });

  redirect("/lock");
}
