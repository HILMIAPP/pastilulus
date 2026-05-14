import Link from "next/link";
import { CalendarDays } from "lucide-react";
import { ptnDeadlines } from "@/components/student-dashboard-data";

export function StudentDeadlineCard() {
  return (
    <section id="ptn" className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-lg font-black text-slate-900">
          <CalendarDays className="text-emerald-600" size={20} />
          Deadline Terdekat
        </h2>
        <Link href="/siswa/info-ptn" className="text-sm font-bold text-[#0A66FF] hover:underline">
          Lihat Semua
        </Link>
      </div>

      <div className="space-y-3">
        {ptnDeadlines.slice(0, 3).map((ptn) => (
          <div
            key={ptn.id}
            className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 p-3 transition hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-sm"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-black text-slate-900">{ptn.shortName}</p>
              <p className="mt-0.5 text-xs text-slate-500">Tutup: {ptn.closeAt}</p>
            </div>
            <span className={`shrink-0 rounded-lg px-2.5 py-1 text-xs font-bold ${ptn.color}`}>
              {ptn.status}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
