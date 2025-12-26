"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function unlockAction(formData: FormData) {
  const key = String(formData.get("key") || "");
  const from = String(formData.get("from") || "/create");

  const expected = process.env.SITE_LOCK_KEY || "";
  const ok = expected.length > 0 && key === expected;

  if (!ok) {
    redirect(`/lock?error=1&from=${encodeURIComponent(from)}`);
  }

  const store = await cookies();
  store.set("directr_unlocked", "true", {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  redirect(from || "/create");
}

export async function relockAction() {
  const store = await cookies();
  store.set("directr_unlocked", "", {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: 0,
  });

  redirect("/lock");
}
