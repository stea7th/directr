import { NextResponse } from "next/server";
import {
  creatorContext,
  directionOutputSchema,
  formatDirectionAsText,
  normalizeDirection,
} from "@/lib/directr";
import { generateStructuredOutput } from "@/lib/directr-ai";
import { authenticatedCreator, getCreatorDNA, persistDirection } from "@/lib/directr-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const FREE_LIMIT = 3;

const SYSTEM = `You are Directr: an opinionated creative director assigned to one real creator.
Make the creative decisions. You are not a generic script generator, social media coach, or video editor.

Rules:
- Turn the creator's rough thought into one original, film-ready direction.
- If the idea is broad, familiar, preachy, motivational, or empty, replace it with a sharper personal angle. Explain the decision in whyThisWorks.
- Do not copy reference creators, invent experiences, fabricate performance, guarantee views, or add guru language.
- Choose one recommended hook that a real person would actually say aloud. Give at most two alternate hooks.
- Choose the best format instead of presenting a menu. Respect the creator's available equipment and locations.
- Prefer 3 or 4 shots. Only use more if the idea actually needs them. Never exceed 6 shots.
- Keep the video flow specific, chronological, realistic, and tightly paced.
- Give restrained delivery notes and usable on-screen text. End without a forced CTA unless the creator's goal genuinely requires one.
- Stay specific to the creator's voice, taste, niche, goals, and recent history.
- Return the requested JSON schema only.`;

export async function POST(request: Request) {
  try {
    const account = await authenticatedCreator();
    if (!account) {
      return NextResponse.json({ success: false, error: "unauthorized" }, { status: 401 });
    }

    const body = await request.json() as { idea?: unknown; prompt?: unknown; history?: unknown };
    const idea = typeof body.idea === "string"
      ? body.idea.trim().slice(0, 1200)
      : typeof body.prompt === "string" ? body.prompt.trim().slice(0, 1200) : "";

    if (!idea) {
      return NextResponse.json({ success: false, error: "Tell Directr what you want to talk about." }, { status: 400 });
    }

    let { data: billingProfile, error: billingError } = await account.supabase
      .from("profiles")
      .select("id, is_pro, generations_used")
      .eq("id", account.user.id)
      .maybeSingle();

    if (billingError) {
      return NextResponse.json({ success: false, error: billingError.message }, { status: 500 });
    }

    if (!billingProfile) {
      const result = await account.supabase
        .from("profiles")
        .upsert({ id: account.user.id, is_pro: false, generations_used: 0 }, { onConflict: "id" })
        .select("id, is_pro, generations_used")
        .single();

      if (result.error || !result.data) {
        return NextResponse.json({ success: false, error: "Could not initialize your account." }, { status: 500 });
      }

      billingProfile = result.data;
    }

    const isPro = Boolean(billingProfile.is_pro);
    const usedBefore = Number(billingProfile.generations_used || 0);

    if (!isPro && usedBefore >= FREE_LIMIT) {
      return NextResponse.json({
        success: false,
        error: "limit_reached",
        usage: { isPro, usedBefore, freeLimit: FREE_LIMIT },
      }, { status: 402 });
    }

    const creator = await getCreatorDNA(account.supabase, account.user);
    const history = Array.isArray(body.history)
      ? body.history.slice(0, 6).map((entry) => {
        const item = entry && typeof entry === "object" ? entry as Record<string, unknown> : {};
        return {
          concept: typeof item.concept === "string" ? item.concept.slice(0, 180) : "",
          format: typeof item.format === "string" ? item.format.slice(0, 100) : "",
          rating: typeof item.creatorRating === "string" ? item.creatorRating : "not rated",
        };
      })
      : [];

    const raw = await generateStructuredOutput<Record<string, unknown>>({
      name: "creative_direction",
      schema: directionOutputSchema as unknown as Record<string, unknown>,
      system: SYSTEM,
      input: `CREATOR DNA\n${creatorContext(creator)}\n\nRECENT CONTENT\n${JSON.stringify(history)}\n\nROUGH THOUGHT\n${idea}\n\nChoose the best direction and make it ready to film.`,
      maxOutputTokens: 2200,
    });

    const direction = normalizeDirection(raw, idea);
    const savedToCloud = await persistDirection(account.supabase, account.user.id, direction);
    let usedAfter = usedBefore;

    if (!isPro) {
      const { data } = await account.supabase
        .from("profiles")
        .update({ generations_used: usedBefore + 1 })
        .eq("id", account.user.id)
        .select("generations_used")
        .single();

      usedAfter = Number(data?.generations_used || usedBefore + 1);
    }

    return NextResponse.json({
      success: true,
      direction,
      text: formatDirectionAsText(direction),
      savedToCloud,
      usage: { isPro, usedBefore, usedAfter, freeLimit: FREE_LIMIT },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Directr could not build that direction.";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
