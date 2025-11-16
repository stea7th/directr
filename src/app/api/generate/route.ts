// src/app/api/generate/route.ts
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { createServerClient } from "@/lib/supabase/server";
import { generateClipIdeas, GenerateInput } from "@/lib/ai";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);

    if (!body || typeof body.prompt !== "string") {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const prompt = body.prompt.trim();
    const platform = (body.platform ?? "TikTok").trim();
    const goal = (body.goal ?? "Drive sales / grow page, etc.").trim();
    const length = String(body.length ?? "30");
    const tone = String(body.tone ?? "Casual");

    const supabase = await createServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Not signed in" }, { status: 401 });
    }

    const aiText = await generateClipIdeas({
      topic: prompt,
      platform,
      goal,
      length,
      tone,
    } as GenerateInput);

    const id = randomUUID();

    const { data: job, error: dbError } = await supabase
      .from("jobs")
      .insert({
        id,
        user_id: user.id,
        platform,
        prompt,
        result: aiText,
        status: "complete",
      })
      .select("*")
      .single();

    if (dbError) {
      console.error("Supabase insert error", dbError);
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    return NextResponse.json({ jobId: job.id, job }, { status: 201 });
  } catch (err: any) {
    console.error("Generate route crash:", err);
    return NextResponse.json(
      { error: err?.message ?? "Unknown server error" },
      { status: 500 }
    );
  }
}
