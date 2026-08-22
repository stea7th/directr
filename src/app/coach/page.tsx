import { redirect } from "next/navigation";
import { authenticatedCreator, getCreatorDNA } from "@/lib/directr-server";
import CoachExperience from "./CoachExperience";

export const dynamic = "force-dynamic";

export default async function CoachPage() {
  const account = await authenticatedCreator();
  if (!account) redirect("/login?next=%2Fcoach");
  const profile = await getCreatorDNA(account.supabase, account.user);
  if (!profile.onboardedAt) redirect("/onboarding");
  return <CoachExperience profile={profile} />;
}
