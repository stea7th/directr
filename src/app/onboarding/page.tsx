import { redirect } from "next/navigation";
import { authenticatedCreator, getCreatorDNA } from "@/lib/directr-server";
import OnboardingFlow from "./OnboardingFlow";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const account = await authenticatedCreator();
  if (!account) redirect("/login?next=%2Fonboarding");

  const profile = await getCreatorDNA(account.supabase, account.user);
  if (profile.onboardedAt) redirect("/today");

  return <OnboardingFlow initialProfile={profile} />;
}
