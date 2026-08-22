import { NextResponse } from "next/server";
import { normalizeDirection } from "@/lib/directr";
import { authenticatedCreator, persistDirection, readPersistedDirection } from "@/lib/directr-server";

export const dynamic = "force-dynamic";

export async function GET() {
  const account = await authenticatedCreator();
  if (!account) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  try {
    const { data, error } = await account.supabase
      .from("directions")
      .select("*")
      .eq("user_id", account.user.id)
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) return NextResponse.json({ directions: [], cloudEnabled: false });

    const directions = (data || [])
      .map((row) => readPersistedDirection(row))
      .filter((direction) => direction !== null);

    return NextResponse.json({ directions, cloudEnabled: true });
  } catch {
    return NextResponse.json({ directions: [], cloudEnabled: false });
  }
}

export async function POST(request: Request) {
  const account = await authenticatedCreator();
  if (!account) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  try {
    const body = await request.json() as { direction?: unknown };
    const raw = body.direction && typeof body.direction === "object"
      ? body.direction as Record<string, unknown>
      : {};
    const direction = normalizeDirection(raw, String(raw.sourceIdea || ""), String(raw.id || ""));
    const savedToCloud = await persistDirection(account.supabase, account.user.id, direction);
    return NextResponse.json({ success: true, savedToCloud, direction });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not save your direction.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
