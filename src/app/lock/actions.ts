// src/app/lock/actions.ts
"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";

function must(v: string | undefined, name: string) {
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

async function getMeta() {
  const h = await headers();
  return {
    ua: h.get("user-agent") || null,
    ip:
      h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      h.get("x-real-ip") ||
      null,
    referer: h.get("referer") || null,
  };
}

export async function unlockAction(_: any, formData: FormData) {
  const key = String(formData.get("key") || "");
  const from = String(formData.get("from") || "/create");

  const lockKey = must(process.env.SITE_LOCK_KEY, "SITE_LOCK_KEY");

  if (!key || key !== lockKey) {
    return { ok: false, error: "Wrong key. Try again." };
  }

  const cookieStore = await cookies();
  cookieStore.set("directr_unlocked", "true", {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  // ✅ Hard redirect so it instantly “goes away”
  redirect(from);
}

export async function relockAction() {
  const cookieStore = await cookies();
  cookieStore.set("directr_unlocked", "false", {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: 0,
  });
  redirect("/create");
}

export async function waitlistAction(_: any, formData: FormData) {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  if (!email || !email.includes("@")) return { ok: false, error: "Enter a valid email." };

  const supabase = await createServerClient();
  const meta = await getMeta();

  const { error } = await supabase.from("waitlist").insert({
    email,
    source: "lockscreen",
    user_agent: meta.ua,
    ip: meta.ip,
    referer: meta.referer,
  });

  if (error) {
    // If duplicate, treat as success
    if (String(error.message).toLowerCase().includes("duplicate")) return { ok: true };
    return { ok: false, error: "Couldn’t join waitlist. Try again." };
  }

  // Optional webhook ping
  const hook = process.env.DISCORD_WEBHOOK_URL;
  if (hook) {
    try {
      await fetch(hook, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          content: `📝 Waitlist: **${email}**`,
        }),
      });
    } catch {}
  }

  return { ok: true };
}

export async function requestAccessAction(_: any, formData: FormData) {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const note = String(formData.get("note") || "").trim();

  if (!email || !email.includes("@")) return { ok: false, error: "Enter a valid email." };

  const supabase = await createServerClient();
  const meta = await getMeta();

  const { error } = await supabase.from("access_requests").insert({
    email,
    note: note || null,
    source: "lockscreen",
    user_agent: meta.ua,
    ip: meta.ip,
    referer: meta.referer,
  });

  if (error) return { ok: false, error: "Couldn’t submit. Try again." };

  const hook = process.env.DISCORD_WEBHOOK_URL;
  if (hook) {
    try {
      await fetch(hook, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          content: `🔐 Access request: **${email}**\n${note ? `> ${note}` : ""}`,
        }),
      });
    } catch {}
  }

  return { ok: true };
}
