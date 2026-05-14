import { Target } from "lucide-react";

export function StudentStatGrid({
  completed,
  avgScore,
}: {
  completed: number;
  avgScore: number;
}) {
  return (
    <section className="grid gap-4 md:grid-cols-[130px_130px_1fr]">
      <StatCard label="Simulasi Selesai" value={completed} />
      <StatCard label="Rata-rata Skor (IRT)" value={avgScore} accent />
      <div className="flex items-center justify-between rounded-2xl border border-[#0A66FF] bg-[#0A66FF] p-5 text-white shadow-md shadow-blue-900/10">
        <div>
          <p className="text-sm font-semibold text-blue-100">Target PTN</p>
          <p className="mt-2 text-xl font-black">ITB & UI</p>
        </div>
        <Target size={34} className="opacity-60" />
      </div>
    </section>
  );
}

function StatCard({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <p className="text-xs font-semibold text-slate-500">{label}</p>
      <p className={`mt-3 text-2xl font-black ${accent ? "text-[#0A66FF]" : "text-slate-900"}`}>{value}</p>
    </div>
  );
}
