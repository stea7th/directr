// src/app/api/jobs/route.ts
import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  const supa = await createServerClient(); // ← await

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const { data, error } = await supa
    .from("jobs")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  return NextResponse.json({ job: data }, { status: 200 });
}
