// src/app/api/generate/route.ts
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { createServerClient } from "@/lib/supabase/server";
import { generateClipIdeas } from "@/lib/ai";

export async function POST(req: Request) {
  try {
    const supabase = await createServerClient();
    const { data: auth } = await supabase.auth.getUser();
    const user = auth?.user ?? null;

    if (!user) {
      return NextResponse.json(
        { error: "Not signed in" },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { prompt, platform = "tiktok" } = body as {
      prompt?: string;
      platform?: string;
    };

    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return NextResponse.json(
        { error: "Missing prompt" },
        { status: 400 }
      );
    }

    // 1) Call AI
    const clips = await generateClipIdeas(
      `Platform: ${platform}\nUser prompt: ${prompt}`
    );

    // 2) Insert job into Supabase
    const id = randomUUID();
    const { data: job, error } = await supabase
      .from("jobs")
      .insert({
        id,
        user_id: user.id,
        status: "done", // make sure this matches your jobs_status_check
        input_type: "text",
        input_prompt: prompt,
        result_json: clips,
      })
      .select("*")
      .single();

    if (error) {
      console.error("Supabase insert error", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ job, clips });
  } catch (err: any) {
    console.error("Generate route error", err);
    return NextResponse.json(
      { error: "Server error", details: err?.message ?? String(err) },
      { status: 500 }
    );
  }
}
