import { NextResponse } from "next/server";
import {
  creatorContext,
  fallbackRecommendations,
  type CreativeDirection,
  type Recommendation,
} from "@/lib/directr";
import { generateStructuredOutput, hasCreativeModel } from "@/lib/directr-ai";
import { authenticatedCreator, getCreatorDNA } from "@/lib/directr-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const recommendationSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    ideas: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          concept: { type: "string" },
          hook: { type: "string" },
          format: { type: "string" },
          duration: { type: "number" },
          filmingMinutes: { type: "number" },
          reason: { type: "string" },
        },
        required: ["concept", "hook", "format", "duration", "filmingMinutes", "reason"],
      },
    },
  },
  required: ["ideas"],
};

export async function POST(request: Request) {
  const account = await authenticatedCreator();
  if (!account) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const profile = await getCreatorDNA(account.supabase, account.user);
  const body = await request.json().catch(() => ({})) as { history?: CreativeDirection[] };
  const history = Array.isArray(body.history) ? body.history.slice(0, 8) : [];

  if (!hasCreativeModel() || !profile.niche) {
    return NextResponse.json({ recommendations: fallbackRecommendations(profile, history), source: "profile" });
  }

  try {
    const result = await generateStructuredOutput<{ ideas: Omit<Recommendation, "id">[] }>({
      name: "today_recommendations",
      schema: recommendationSchema,
      system: `You are an opinionated creative director. Recommend exactly three distinct things this creator can realistically film today, ordered by conviction. Idea #1 is the one you would personally tell them to film if they could only make one video today. Idea #2 should be a safer alternative. Idea #3 should be a more experimental alternative. Prefer specific personal stories, observations, opinions, or documented moments over generic educational tips. Use the creator's actual voice, topics, constraints, locations, equipment, and preferred formats. Give one natural spoken hook, one filming format, an honest duration, filming minutes, and a concise reason tied only to known Creator DNA or recent direction history. Never invent performance data, audience reactions, creator history, or life events. Do not repeat recent concepts. Avoid vague reasons such as 'this will resonate' unless the supplied context supports them.`,
      input: `${creatorContext(profile)}\n\nRECENT DIRECTIONS\n${JSON.stringify(history.map((item) => ({ concept: item.concept, format: item.format, rating: item.creatorRating || "not rated", status: item.status })))}`,
      maxOutputTokens: 1000,
    });

    const recommendations = (Array.isArray(result.ideas) ? result.ideas : [])
      .slice(0, 3)
      .filter((item) => item.concept && item.hook)
      .map((item) => ({
        id: crypto.randomUUID(),
        concept: String(item.concept).slice(0, 180),
        hook: String(item.hook).slice(0, 320),
        format: String(item.format || "Talking to camera").slice(0, 100),
        duration: Math.max(10, Math.min(120, Number(item.duration) || 30)),
        filmingMinutes: Math.max(2, Math.min(45, Number(item.filmingMinutes) || 8)),
        reason: String(item.reason || "Chosen around your Creator DNA.").slice(0, 360),
      }));

    return NextResponse.json({
      recommendations: recommendations.length ? recommendations : fallbackRecommendations(profile, history),
      source: recommendations.length ? "creative-director" : "profile",
    });
  } catch {
    return NextResponse.json({ recommendations: fallbackRecommendations(profile, history), source: "profile" });
  }
}
