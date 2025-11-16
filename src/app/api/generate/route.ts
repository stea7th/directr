// src/app/api/generate/route.ts
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { createServerClient } from "@/lib/supabase/server";
import { generateClipIdeas } from "@/lib/ai";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      prompt?: string;
      platform?: string;
    };

    const prompt = (body.prompt || "").trim();
    const platform = (body.platform || "TikTok").trim();

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    const supabase = await createServerClient();

    // Who’s creating this job?
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

    // 1) Ask AI for ideas (text only for now)
    const aiText = await generateClipIdeas({
      topic: prompt,
      platform,
      goal: "Generate short-form clip ideas and outlines from this topic",
      length: "30–60",
      tone: "natural creator, non-cringe",
    });

    const id = randomUUID();

    // 2) Insert into jobs table
    const { data: job, error: dbError } = await supabase
      .from("jobs")
      .insert({
        id,
        user_id: user.id,
        platform,
        prompt,
        result: aiText,
        status: "complete", // assuming your status enum/check allows this
      })
      .select("*")
      .single();

    if (dbError) {
      console.error("DB insert error", dbError);
      return NextResponse.json(
        { error: dbError.message },
        { status: 500 }
      );
    }

    // 3) Return job + jobId so the frontend can use it
    return NextResponse.json(
      { jobId: id, job },
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
