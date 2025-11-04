import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { createServerClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const supa = await createServerClient();  // <-- add await

  const body = await req.json();
  const fileUrl  = body.fileUrl ?? null;
  const fileName = body.fileName ?? null;
  const prompt   = body.prompt ?? "";

  const { data: authData, error: authErr } = await supa.auth.getUser();
  if (authErr || !authData?.user?.id) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const id = randomUUID();
  const payload = {
    id,
    user_id: authData.user.id,
    input_prompt: prompt,
    file_name: fileName,
    input_file: fileUrl,
    input_path: fileUrl,
    status: "queued",
  };

  const { data, error } = await supa.from("jobs").insert(payload).select("id").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ id: data.id }, { status: 201 });
}
