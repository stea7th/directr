// src/app/debug-auth/route.ts
import { NextResponse } from "next/server";
import { createRouteClient } from "@/lib/supabase/server";
export async function GET() {
 const supabase = createRouteClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  return NextResponse.json(
    {
      user,
      error,
    },
    { status: 200 }
  );
}
