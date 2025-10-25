import { NextResponse } from "next/server";
import { supabaseFromCookies } from "@/lib/supabase/server";

// GET /api/jobs/:id — returns a job row
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await supabaseFromCookies();
  const { data, error } = await supabase.from("jobs").select("*").eq("id", id).maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

// POST /api/jobs/:id — process the job
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await supabaseFromCookies();

  const { data: userRes } = await supabase.auth.getUser();
  if (!userRes?.user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  // Mark as processing
  await supabase.from("jobs").update({ status: "processing" }).eq("id", id);

  // --- Simulate generation result ---
  const resultText = `
✅ Generation Complete!

Job ID: ${id}
Timestamp: ${new Date().toLocaleString()}
Prompt: (example placeholder)

→ This text was written to the database automatically.
`;

  // Write result_text + status=done
  const { data, error } = await supabase
    .from("jobs")
    .update({
      result_text: resultText,
      status: "done",
    })
    .eq("id", id)
    .select()
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}
