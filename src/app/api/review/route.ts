import { NextResponse } from "next/server";
import { creatorContext } from "@/lib/directr";
import { generateStructuredOutput } from "@/lib/directr-ai";
import { authenticatedCreator, getCreatorDNA } from "@/lib/directr-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = {
  type: "object",
  additionalProperties: false,
  properties: {
    verdict: { type: "string", enum: ["POST IT", "TIGHTEN THE CUT", "REWORK THE OPENING", "REWORK THE IDEA"] },
    summary: { type: "string" },
    hook: { type: "string" },
    pacing: { type: "string" },
    clarity: { type: "string" },
    delivery: { type: "string" },
    cuts: { type: "array", items: { type: "string" } },
    nextMove: { type: "string" },
  },
  required: ["verdict", "summary", "hook", "pacing", "clarity", "delivery", "cuts", "nextMove"],
};

export async function POST(request: Request) {
  try {
    const account = await authenticatedCreator();
    if (!account) return NextResponse.json({ error: "Sign in to review a draft." }, { status: 401 });
    const body = await request.json() as { transcript?: unknown };
    const transcript = typeof body.transcript === "string" ? body.transcript.trim().slice(0, 9000) : "";
    if (transcript.length < 40) return NextResponse.json({ error: "Paste enough of the transcript for a useful review." }, { status: 400 });
    const profile = await getCreatorDNA(account.supabase, account.user);
    const review = await generateStructuredOutput<Record<string, unknown>>({
      name: "creative_draft_review",
      schema,
      system: "You are Directr reviewing a creator's transcript before publication. Make one clear publish-or-rework decision. Quote actual phrases when identifying weak openings or removable sections. Evaluate delivery only as inferred from wording; never claim to hear audio, see footage, measure timestamps, watch the video, or predict performance. Give at most three cuts. Be precise, direct, and consistent with Creator DNA.",
      input: `CREATOR DNA\n${creatorContext(profile)}\n\nACTUAL DRAFT TRANSCRIPT\n${transcript}`,
      maxOutputTokens: 1000,
    });
    return NextResponse.json({ review });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not review that transcript." }, { status: 500 });
  }
}
