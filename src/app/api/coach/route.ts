import { NextResponse } from "next/server";
import { creatorContext, type CreativeDirection } from "@/lib/directr";
import { generateStructuredOutput, hasCreativeModel } from "@/lib/directr-ai";
import { authenticatedCreator, getCreatorDNA } from "@/lib/directr-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const coachingSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    assessment: { type: "string" },
    observations: { type: "array", items: { type: "string" } },
    adjustments: { type: "array", items: { type: "string" } },
    nextMove: { type: "string" },
  },
  required: ["assessment", "observations", "adjustments", "nextMove"],
};

export async function POST(request: Request) {
  const account = await authenticatedCreator();
  if (!account) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  if (!hasCreativeModel()) {
    return NextResponse.json({ error: "Connect an OpenAI API key to enable Coach." }, { status: 503 });
  }

  try {
    const body = await request.json() as { question?: unknown; history?: CreativeDirection[] };
    const question = typeof body.question === "string" ? body.question.trim().slice(0, 700) : "";
    if (!question) return NextResponse.json({ error: "Tell Coach what you want feedback on." }, { status: 400 });

    const creator = await getCreatorDNA(account.supabase, account.user);
    const history = (Array.isArray(body.history) ? body.history : []).slice(0, 12).map((item) => ({
      concept: String(item.concept || "").slice(0, 180),
      format: String(item.format || "").slice(0, 100),
      duration: Number(item.estimatedDuration || 0),
      shots: Array.isArray(item.shots) ? item.shots.length : 0,
      status: item.status,
      creatorRating: item.creatorRating || "not rated",
    }));

    const coaching = await generateStructuredOutput<{
      assessment: string;
      observations: string[];
      adjustments: string[];
      nextMove: string;
    }>({
      name: "creator_coaching",
      schema: coachingSchema,
      system: `You are Directr, an honest, opinionated creative coach. Answer the creator's exact question. Reference their Creator DNA and actual content history where useful. Push back on broad positioning, performative delivery, repetitive topics, and overfilming. Give specific practical adjustments. Never invent views, retention, engagement, trends, or facts not present in the provided context. If history is limited, say so. Keep the assessment to 2–4 sentences, observations and adjustments to at most three items each, and give one clear next move. No motivational filler.`,
      input: `CREATOR DNA\n${creatorContext(creator)}\n\nACTUAL CONTENT HISTORY\n${JSON.stringify(history)}\n\nQUESTION\n${question}`,
      maxOutputTokens: 850,
    });

    return NextResponse.json({ success: true, coaching });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Coach could not answer that yet.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
