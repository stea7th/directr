import { redirect } from "next/navigation";
import { authenticatedCreator, getCreatorDNA } from "@/lib/directr-server";
import OnboardingFlow from "@/app/onboarding/OnboardingFlow";

export const dynamic = "force-dynamic";

export default async function CreatorDNAPage() {
  const account = await authenticatedCreator();
  if (!account) redirect("/login?next=%2Fdna");
  const profile = await getCreatorDNA(account.supabase, account.user);
  return <OnboardingFlow initialProfile={profile} editing />;
}
