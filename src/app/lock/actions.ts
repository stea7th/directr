"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const COOKIE_NAME = "directr_unlocked";

function cookieOpts() {
  return {
    path: "/",
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  };
}

export async function unlockAction(formData: FormData): Promise<void> {
  const expected = process.env.SITE_LOCK_KEY || "";
  const key = String(formData.get("key") ?? "").trim();

  // If no lock key is configured, never lock people out
  if (!expected) {
    const jar = await cookies();
    jar.set(COOKIE_NAME, "1", cookieOpts());
    redirect("/");
  }

  if (key && key === expected) {
    const jar = await cookies();
    jar.set(COOKIE_NAME, "1", cookieOpts());
    redirect("/create");
  }

  redirect(`/lock?err=${encodeURIComponent("Wrong key. Try again.")}`);
}

export async function relockAction(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
  redirect("/lock");
}
