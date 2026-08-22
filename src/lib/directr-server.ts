import { createServerClient } from "@/lib/supabase/server";
import {
  normalizeCreatorDNA,
  normalizeDirection,
  type CreatorDNA,
  type CreativeDirection,
} from "@/lib/directr";

export async function authenticatedCreator() {
  const supabase = await createServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  return { supabase, user };
}

export async function getCreatorDNA(
  supabase: Awaited<ReturnType<typeof createServerClient>>,
  user: { id: string; user_metadata?: Record<string, unknown> }
): Promise<CreatorDNA> {
  const metadata = user.user_metadata?.directr_creator_dna;
  let source: unknown = metadata || {};

  try {
    const { data, error } = await supabase
      .from("creator_profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!error && data) source = data;
  } catch {
    // Auth metadata is the durable compatibility path before the migration is applied.
  }

  return normalizeCreatorDNA({
    ...(source && typeof source === "object" ? source : {}),
    userId: user.id,
  });
}

export async function persistDirection(
  supabase: Awaited<ReturnType<typeof createServerClient>>,
  userId: string,
  direction: CreativeDirection
): Promise<boolean> {
  const row = {
    id: direction.id,
    user_id: userId,
    source_idea: direction.sourceIdea,
    angle: direction.angle,
    hook: direction.recommendedHook,
    reasoning: direction.whyThisWorks,
    format: direction.format,
    duration: direction.estimatedDuration,
    delivery_notes: direction.delivery,
    caption: direction.caption,
    status: direction.status,
    payload: direction,
    created_at: direction.createdAt,
  };

  try {
    const { error } = await supabase.from("directions").upsert(row, { onConflict: "id" });
    if (error) return false;

    const shots = direction.shots.map((shot) => ({
      direction_id: direction.id,
      order_index: shot.order,
      title: shot.title,
      description: shot.description,
      dialogue: shot.dialogue,
      framing: shot.framing,
      duration: shot.duration,
      completed: shot.completed,
    }));

    if (shots.length) {
      const { error: shotError } = await supabase
        .from("direction_shots")
        .upsert(shots, { onConflict: "direction_id,order_index" });
      if (shotError) return false;
    }

    if (direction.status === "posted" || direction.creatorRating) {
      const { data: existingPost } = await supabase
        .from("content_posts")
        .select("id")
        .eq("direction_id", direction.id)
        .eq("user_id", userId)
        .maybeSingle();
      const post = {
        direction_id: direction.id,
        user_id: userId,
        creator_rating: direction.creatorRating || null,
        posted_at: direction.status === "posted" ? new Date().toISOString() : null,
      };
      if (existingPost?.id) {
        await supabase.from("content_posts").update(post).eq("id", existingPost.id).eq("user_id", userId);
      } else {
        await supabase.from("content_posts").insert(post);
      }
    }

    return true;
  } catch {
    return false;
  }
}

export function readPersistedDirection(value: unknown): CreativeDirection | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  const payload = row.payload && typeof row.payload === "object"
    ? row.payload as Record<string, unknown>
    : row;

  try {
    return normalizeDirection(
      { ...payload, status: row.status || payload.status },
      String(row.source_idea || payload.sourceIdea || ""),
      String(row.id || payload.id || "")
    );
  } catch {
    return null;
  }
}
