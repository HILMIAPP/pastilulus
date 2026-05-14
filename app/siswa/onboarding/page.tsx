import { OnboardingFlow } from "@/components/onboarding-flow";
import { getCurrentSession } from "@/lib/session";

export const metadata = {
  title: "Onboarding Siswa",
};

export default async function OnboardingPage() {
  const session = await getCurrentSession();

  return <OnboardingFlow session={session} />;
}
