// src/app/api/generate/route.ts
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { createRouteClient } from "@/lib/supabase/server";
import { requestVideoEdit } from "@/lib/videoProvider";

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

    // 1) Upload video to Supabase Storage (bucket: 'uploads')
    let fileUrl: string | null = null;

    if (file && file.size > 0) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
        const path = `${user.id}/${randomUUID()}-${safeName}`;

        const { data: uploaded, error: uploadError } = (supabase as any)
          .storage.from("uploads")
          .upload(path, buffer, {
            contentType: file.type || "application/octet-stream",
          });

        if (uploadError) {
          console.error("Supabase upload error:", uploadError);
        } else if ((await uploaded)?.path) {
          const { data: publicData } = (supabase as any)
            .storage.from("uploads")
            .getPublicUrl((await uploaded).path);

          fileUrl = publicData?.publicUrl ?? null;
        }
      } catch (uploadErr) {
        console.error("Upload pipeline error:", uploadErr);
      }
    }

    // If no file uploaded, we still continue (script-only use-case)
    const lengthSeconds = Number.isNaN(Number(lengthSecondsStr))
      ? 30
      : Number(lengthSecondsStr);

    // 2) Call AI video provider (stub for now)
    const providerResult = await requestVideoEdit({
      inputUrl: fileUrl || "",
      platform,
      prompt,
      goal,
      lengthSeconds,
      tone,
    });

    // 3) Insert job into Supabase "jobs" table
    const id = randomUUID();

    const { data: job, error: dbError } = await (supabase as any)
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
        edited_url: providerResult.editedUrl,
        provider_job_id: providerResult.providerJobId,
        result_text: providerResult.notes,
        status: providerResult.editedUrl ? "complete" : "queued",
      })
      .select("*")
      .single();

    if (dbError) {
      console.error("Supabase insert error:", dbError);
    }

    return NextResponse.json(
      {
        ok: true,
        job: job ?? {
          id,
          user_id: user.id,
          platform,
          prompt,
          goal,
          tone,
          length_seconds: lengthSeconds,
          source_url: fileUrl,
          edited_url: providerResult.editedUrl,
          provider_job_id: providerResult.providerJobId,
          result_text: providerResult.notes,
          status: providerResult.editedUrl ? "complete" : "queued",
        },
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
