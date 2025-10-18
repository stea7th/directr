import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  // Pull token + type from the URL query
  const { searchParams } = new URL(req.url);
  const token =
    searchParams.get("token") ||
    searchParams.get("token_hash") ||
    searchParams.get("code");
  const type = searchParams.get("type") || "recovery";

  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  const supabase = createClient();

  // Supabase requires verifyOtp for confirmation or recovery links
  const { data, error } = await supabase.auth.verifyOtp({
    type: type as any,
    token_hash: token,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({
    message: "Account confirmed successfully.",
    user: data.user,
  });
}
