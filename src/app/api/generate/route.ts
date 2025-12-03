// src/app/api/generate/route.ts
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { Buffer } from "buffer";
import { createRouteClient } from "@/lib/supabase/server";
import { requestVideoEdit } from "@/lib/videoProvider";
import { generateClipIdeas, EditingPlan } from "@/lib/ai";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const form = await req.formData();

    const prompt = (form.get("prompt") as string | null)?.trim() ?? "";
    const platform = (form.get("platform") as string | null)?.trim() || "TikTok";
    const goal = (form.get("goal") as string | null)?.trim() || "";
    const lengthSecondsStr =
      (form.get("lengthSeconds") as string | null)?.trim() || "30";
    const tone = (form.get("tone") as string | null)?.trim() || "Casual";
    const file = form.get("file") as File | null;

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required." },
        { status: 400 }
      );
    }

    const lengthSeconds = Number.isNaN(Number(lengthSecondsStr))
      ? 30
      : Number(lengthSecondsStr);

    // ---------- 1) Auth ----------
    const supabase = createRouteClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Not signed in" },
        { status: 401 }
      );
    }

    // ---------- 2) Upload video to Supabase Storage ----------
    let fileUrl: string | null = null;

    if (file && file.size > 0) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
        const path = `${user.id}/${randomUUID()}-${safeName}`;

        const { data: uploaded, error: uploadError } = await supabase.storage
          .from("uploads")
          .upload(path, buffer, {
            contentType: file.type || "application/octet-stream",
          });

        if (uploadError) {
          console.error("Supabase upload error:", uploadError);
        } else if (uploaded?.path) {
          const { data: publicData } = supabase.storage
            .from("uploads")
            .getPublicUrl(uploaded.path);

          fileUrl = publicData?.publicUrl ?? null;
        }
      } catch (uploadErr) {
        console.error("Upload pipeline error:", uploadErr);
      }
    }

    // ---------- 3) Call AI “editor brain” ----------
    const aiPlan: EditingPlan = await generateClipIdeas({
      idea: prompt,
      platform,
      goal: goal || "Grow my page and drive sales",
      lengthSeconds,
      tone,
    });

    // ---------- 4) (Stub) Call video provider ----------
    const providerResult = await requestVideoEdit({
      inputUrl: fileUrl || "",
      platform,
      prompt,
      goal,
      lengthSeconds,
      tone,
    });

    // ---------- 5) Insert job into Supabase ----------
    const id = randomUUID();

    const { data: job, error: dbError } = await supabase
      .from("jobs")
      .insert({
        id,
        user_id: user.id,
        platform,
        prompt,
        goal,
        tone,
        length_seconds: lengthSeconds,
        source_url: fileUrl,
        edited_url: providerResult?.editedUrl ?? null,
        provider_job_id: providerResult?.providerJobId ?? null,
        result_text: JSON.stringify(aiPlan, null, 2),
        status: providerResult?.editedUrl ? "complete" : "queued",
      })
      .select("*")
      .single();

    if (dbError) {
      console.error("Supabase insert error:", dbError);
    }

    const jobPayload =
      job ??
      ({
        id,
        user_id: user.id,
        platform,
        prompt,
        goal,
        tone,
        length_seconds: lengthSeconds,
        source_url: fileUrl,
        edited_url: providerResult?.editedUrl ?? null,
        provider_job_id: providerResult?.providerJobId ?? null,
        result_text: JSON.stringify(aiPlan, null, 2),
        status: providerResult?.editedUrl ? "complete" : "queued",
      } as any);

    return NextResponse.json(
      {
        ok: true,
        job: jobPayload,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("Generate route fatal error:", err);
    return NextResponse.json(
      { error: err?.message || "Unknown error" },
      { status: 500 }
    );
  }
}
