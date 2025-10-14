// src/app/api/generate/route.js
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

export async function POST(req) {
  try {
    // Check auth (reads the Supabase session cookie)
    const cookieStore = cookies();
    const userClient = createRouteHandlerClient({ cookies: () => cookieStore });
    const { data: { user } = { user: null } } = await userClient.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Accept either JSON or multipart form (for file upload)
    const contentType = req.headers.get("content-type") || "";
    let prompt = "";
    let fileMeta = null;

    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      prompt = (form.get("prompt") || "").toString();
      const file = form.get("file");
      if (file && typeof file === "object") {
        fileMeta = { name: file.name, type: file.type, size: file.size };
        // If you want to store the file in Supabase Storage, uncomment:
        // const supabase = createClient(
        //   process.env.NEXT_PUBLIC_SUPABASE_URL,
        //   process.env.SUPABASE_SERVICE_ROLE_KEY
        // );
        // const path = `uploads/${user.id}/${Date.now()}-${file.name}`;
        // const { error: uploadErr } = await supabase.storage
        //   .from("uploads")
        //   .upload(path, Buffer.from(await file.arrayBuffer()), {
        //     contentType: file.type,
        //     upsert: false,
        //   });
        // if (uploadErr) {
        //   return NextResponse.json({ error: uploadErr.message }, { status: 500 });
        // }
        // fileMeta.path = path;
      }
    } else {
      const body = (await req.json().catch(() => ({}))) || {};
      prompt = body.prompt || "";
    }

    if (!prompt && !fileMeta) {
      return NextResponse.json(
        { error: "Provide a prompt or a file." },
        { status: 400 }
      );
    }

    // Use service role for DB writes (RLS-safe)
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Adjust to your actual table/columns
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
  } catch (err) {
    return NextResponse.json(
      { error: err?.message || "Unknown error" },
      { status: 500 }
    );
  }
}
