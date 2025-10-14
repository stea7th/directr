// src/app/api/generate/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

type FileMeta = { name: string; type: string; size: number } | null;

export async function POST(req: Request) {
  try {
    // Auth via Supabase cookie
    const cookieStore = cookies();
    const userClient = createRouteHandlerClient({ cookies: () => cookieStore as any });
    const { data: { user } = { user: null } } = await userClient.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Accept JSON or multipart
    const contentType = req.headers.get("content-type") || "";
    let prompt = "";
    let fileMeta: FileMeta = null;

    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      prompt = String(form.get("prompt") ?? "");
      const file = form.get("file") as unknown as { name: string; type: string; size: number } | null;
      if (file && typeof file === "object") {
        fileMeta = { name: file.name, type: file.type, size: file.size };
        // To upload to Storage later, we can add it back.
      }
    } else {
      const body = (await req.json().catch(() => ({}))) as { prompt?: string };
      prompt = body?.prompt ?? "";
    }

    if (!prompt && !fileMeta) {
      return NextResponse.json({ error: "Provide a prompt or a file." }, { status: 400 });
    }

    // Service role for DB writes
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL as string,
      process.env.SUPABASE_SERVICE_ROLE_KEY as string
    );

    const { data, error } = await supabaseAdmin
      .from("jobs")
      .insert({
        user_id: user.id,
        status: "queued",
        kind: "generate",
        prompt,
        file_meta: fileMeta,
      })
      .select("id")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, jobId: data.id });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Unknown error" }, { status: 500 });
  }
}
