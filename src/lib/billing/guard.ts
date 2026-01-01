import { createClient } from "@/lib/supabase/server";

export async function enforceFreeLimitOrPro(limit = 3) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false as const, status: 401, body: { success: false, error: "unauthorized" } };
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("is_pro, generations_used")
    .eq("id", user.id)
    .single();

  if (error || !profile) {
    return { ok: false as const, status: 500, body: { success: false, error: "profile_missing" } };
  }

  if (!profile.is_pro && (profile.generations_used ?? 0) >= limit) {
    return { ok: false as const, status: 402, body: { success: false, error: "limit_reached" } };
  }

  return { ok: true as const, supabase, user, profile };
}

export async function incrementFreeUsage(supabase: any, userId: string, currentUsed: number) {
  await supabase
    .from("profiles")
    .update({ generations_used: (currentUsed ?? 0) + 1 })
    .eq("id", userId);
}
