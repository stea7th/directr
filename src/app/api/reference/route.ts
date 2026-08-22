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
    structure: { type: "string" },
    hookPattern: { type: "string" },
    pacing: { type: "string" },
    originalAngle: { type: "string" },
    suggestedIdea: { type: "string" },
    differentiation: { type: "string" },
  },
  required: ["structure", "hookPattern", "pacing", "originalAngle", "suggestedIdea", "differentiation"],
};

export async function POST(request: Request) {
  try {
    const account = await authenticatedCreator();
    if (!account) return NextResponse.json({ error: "Sign in to analyze a reference." }, { status: 401 });
    const body = await request.json() as { url?: unknown; notes?: unknown };
    const rawUrl = typeof body.url === "string" ? body.url.trim().slice(0, 2000) : "";
    const notes = typeof body.notes === "string" ? body.notes.trim().slice(0, 2400) : "";
    if (!rawUrl || notes.length < 20) {
      return NextResponse.json({ error: "Add the video link and describe the parts of it you like." }, { status: 400 });
    }
    let parsed: URL;
    try { parsed = new URL(rawUrl); } catch { return NextResponse.json({ error: "Enter a valid video URL." }, { status: 400 }); }
    if (!/^https?:$/.test(parsed.protocol)) return NextResponse.json({ error: "Use an http or https video link." }, { status: 400 });
    const profile = await getCreatorDNA(account.supabase, account.user);
    const analysis = await generateStructuredOutput<Record<string, string>>({
      name: "creative_reference_analysis",
      schema,
      system: "You are Directr, an opinionated creative director. Analyze ONLY the creator-provided description of a reference video; never claim you watched, fetched, or transcribed it. Abstract its hook mechanics, emotional progression, and pacing without copying language. Rebuild an original idea grounded in Creator DNA. Explicitly distinguish the creator's new angle from the reference.",
      input: `CREATOR DNA\n${creatorContext(profile)}\n\nREFERENCE LINK (context only; video was not fetched)\n${parsed.toString()}\n\nWHAT THE CREATOR NOTICED\n${notes}`,
      maxOutputTokens: 850,
    });
    let saved = false;
    try {
      const { error } = await account.supabase.from("creator_references").insert({ user_id: account.user.id, url: parsed.toString(), notes, extracted_style_data: analysis });
      saved = !error;
    } catch { saved = false; }
    return NextResponse.json({ analysis, saved, videoInspected: false });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not analyze that reference." }, { status: 500 });
  }
}
