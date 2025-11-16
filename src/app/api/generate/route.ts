// src/app/api/generate/route.ts
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { createServerClient } from "@/lib/supabase/server";
import { generateClipIdeas } from "@/lib/ai";

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as {
      prompt?: string;
      platform?: string;
      goal?: string;
      length?: string;
      tone?: string;
      fileName?: string;
    };

    const prompt = (body.prompt ?? "").trim();
    const platform = (body.platform ?? "TikTok").trim() || "TikTok";

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    const supabase = await createServerClient();

    // Who is creating this job?
    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser();

    if (authErr || !user?.id) {
      return NextResponse.json(
        { error: "Not signed in" },
        { status: 401 }
      );
    }

    // 1) Ask the AI for ideas/script
    const aiText = await generateClipIdeas({
      topic: prompt,
      platform,
      goal:
        body.goal ??
        "Generate short-form video ideas and a rough script",
      length: body.length ?? "30–60",
      tone: body.tone ?? "natural creator, non-cringe",
    });

    const id = randomUUID();

    // 2) Insert job into Supabase
    const { data: job, error: dbError } = await supabase
      .from("jobs")
      .insert({
        id,
        user_id: user.id,
        platform,
        prompt,
        result: aiText,
        status: "complete", // or whatever your status enum uses
      })
      .select("*")
      .single();

    if (dbError || !job) {
      console.error("DB insert error", dbError);
      return NextResponse.json(
        { error: dbError?.message ?? "Failed to create job" },
        { status: 500 }
      );
    }

    // 3) Return job + jobId so the UI can redirect
    return NextResponse.json(
      {
        jobId: job.id,
        job,
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("Generate API error", err);
    return NextResponse.json(
      { error: err?.message || "Unknown error" },
      { status: 500 }
    );
  }
}
