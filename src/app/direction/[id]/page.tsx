import { redirect } from "next/navigation";
import { authenticatedCreator, getCreatorDNA } from "@/lib/directr-server";
import DirectionExperience from "./DirectionExperience";

export const dynamic = "force-dynamic";

export default async function DirectionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const account = await authenticatedCreator();
  if (!account) redirect(`/login?next=${encodeURIComponent(`/direction/${id}`)}`);
  const profile = await getCreatorDNA(account.supabase, account.user);
  if (!profile.onboardedAt) redirect("/onboarding");
  return <DirectionExperience id={id} profile={profile} />;
}
