import { StudentDeadlineCard } from "@/components/student-deadline-card";
import { StudentLearningCard } from "@/components/student-learning-card";
import { StudentPromoSlider } from "@/components/student-promo-slider";
import { StudentRunningBanner } from "@/components/student-running-banner";
import { StudentStatGrid } from "@/components/student-stat-grid";
import { StudentTryoutCta } from "@/components/student-tryout-cta";
import { StudentOnboardingSummary } from "@/components/student-onboarding-summary";
import { StudentTransactionCard } from "@/components/student-transaction-card";
import type { AppSession } from "@/lib/session-codec";
import type { StudentPaymentTransaction } from "@/lib/student-transactions";

export function StudentDashboard({
  session,
  transactions,
}: {
  session: AppSession | null;
  transactions: StudentPaymentTransaction[];
}) {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 md:px-8">
      <style>{`
        @keyframes dashboard-marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }

        .dashboard-marquee {
          animation: dashboard-marquee 24s linear infinite;
        }
      `}</style>

      <div className="space-y-6">
        <StudentRunningBanner />

        <div>
          <p className="text-sm font-bold text-[#0A66FF]">Dashboard siswa</p>
          <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-900 md:text-3xl">
            Halo, {session?.name ?? "calon mahasiswa"}!
          </h1>
        </div>

        <StudentOnboardingSummary />
        <StudentTransactionCard transactions={transactions} />
        <StudentPromoSlider />
        <StudentStatGrid completed={0} avgScore={0} />

        <div className="grid gap-6 lg:grid-cols-2">
          <StudentLearningCard session={session} />
          <StudentDeadlineCard />
        </div>

        <StudentTryoutCta />
      </div>
    </main>
  );
}
