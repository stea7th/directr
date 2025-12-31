// src/app/lock/actions.ts
"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const COOKIE = "directr_unlocked";

export async function unlockAction(formData: FormData) {
  const expected = process.env.SITE_LOCK_KEY || "";
  const provided = String(formData.get("key") || "").trim();

  // If no key configured, don't lock people out
  const cookieStore = await cookies();

  if (!expected) {
    cookieStore.set(COOKIE, "1", {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: true,
    });
    redirect("/create");
  }

  if (provided !== expected) {
    throw new Error("wrong_key");
  }

  cookieStore.set(COOKIE, "1", {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: true,
  });

  redirect("/create");
}

export async function relockAction() {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE, "", {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    maxAge: 0,
  });
  redirect("/lock");
}
