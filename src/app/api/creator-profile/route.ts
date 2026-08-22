import { NextResponse } from "next/server";
import { normalizeCreatorDNA } from "@/lib/directr";
import { authenticatedCreator, getCreatorDNA } from "@/lib/directr-server";

export const dynamic = "force-dynamic";

export async function GET() {
  const account = await authenticatedCreator();
  if (!account) {
    return NextResponse.json({ error: "Sign in to open your Creator DNA." }, { status: 401 });
  }

  const profile = await getCreatorDNA(account.supabase, account.user);
  return NextResponse.json({ profile, userId: account.user.id });
}

export async function POST(request: Request) {
  const account = await authenticatedCreator();
  if (!account) {
    return NextResponse.json({ error: "Sign in to save your Creator DNA." }, { status: 401 });
  }

  try {
    const incoming: unknown = await request.json();
    const profile = normalizeCreatorDNA({
      ...(incoming && typeof incoming === "object" ? incoming : {}),
      userId: account.user.id,
    });

    if (!profile.niche || !profile.goals.length || !profile.preferredFormats.length) {
      return NextResponse.json(
        { error: "Add your niche, at least one goal, and how you usually film." },
        { status: 400 }
      );
    }

    if (!profile.onboardedAt) profile.onboardedAt = new Date().toISOString();

    const { error: metadataError } = await account.supabase.auth.updateUser({
      data: { directr_creator_dna: profile },
    });

    if (metadataError) {
      return NextResponse.json({ error: metadataError.message }, { status: 500 });
    }

    let databaseEnabled = false;

    try {
      const { error } = await account.supabase.from("creator_profiles").upsert({
        user_id: account.user.id,
        niche: profile.niche,
        goals: profile.goals,
        audience: profile.audience,
        voice_description: profile.voiceDescription,
        preferred_formats: profile.preferredFormats,
        disliked_formats: profile.dislikedFormats,
        available_locations: profile.availableLocations,
        equipment: profile.equipment,
        posting_frequency: profile.postingFrequency,
        reference_creators: profile.referenceCreators,
        reference_videos: profile.referenceVideos,
        topics: profile.topics,
        topics_to_avoid: profile.topicsToAvoid,
        platforms: profile.platforms,
        creator_dna_score: profile.completionScore,
        onboarded_at: profile.onboardedAt,
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" });

      databaseEnabled = !error;
    } catch {
      databaseEnabled = false;
    }

    return NextResponse.json({ profile, databaseEnabled });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not save your Creator DNA.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
