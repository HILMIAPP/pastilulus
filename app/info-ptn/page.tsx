import { CalendarDays, ExternalLink, GraduationCap, Target } from "lucide-react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { ptnDeadlines } from "@/components/student-dashboard-data";

export const metadata = {
  title: "Info PTN & Deadline",
};

export default function InfoPtnPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-14 sm:px-6">
        <div className="max-w-3xl">
          <p className="text-sm font-black uppercase tracking-wide text-[#0A66FF]">Info PTN 2026</p>
          <h1 className="mt-3 text-3xl font-black text-slate-950 sm:text-4xl">
            Jadwal mandiri PTN 2026 yang siap dipakai menyusun strategi.
          </h1>
          <p className="mt-4 leading-relaxed text-slate-600">
            Lihat deadline, skema seleksi, biaya, dan fokus latihan kampus target. Data ini dibuat sebagai
            ringkasan belajar; keputusan akhir tetap mengikuti portal resmi masing-masing kampus.
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <SummaryCard label="Kampus target" value={`${ptnDeadlines.length}`} />
          <SummaryCard label="Fokus 2026" value="UM/PTN-BH" />
          <SummaryCard label="Mode utama" value="CBT + Nilai" />
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {ptnDeadlines.map((ptn) => (
            <article key={ptn.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="flex items-center gap-2 text-sm font-black text-[#0A66FF]">
                    <GraduationCap size={18} />
                    {ptn.shortName}
                  </p>
                  <h2 className="mt-2 text-xl font-black text-slate-950">{ptn.name}</h2>
                  <p className="mt-1 text-sm font-semibold text-slate-500">{ptn.selectionName}</p>
                </div>
                <span className={`shrink-0 rounded-xl px-3 py-1 text-xs font-black ${ptn.color}`}>{ptn.status}</span>
              </div>

              <div className="mt-5 grid gap-3 text-sm font-bold text-slate-700 sm:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="flex items-center gap-2 text-xs font-black uppercase tracking-wide text-slate-500">
                    <CalendarDays size={15} className="text-[#0A66FF]" />
                    Jadwal
                  </p>
                  <p className="mt-2">{ptn.openAt} - {ptn.closeAt}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="flex items-center gap-2 text-xs font-black uppercase tracking-wide text-slate-500">
                    <Target size={15} className="text-[#0A66FF]" />
                    Fokus
                  </p>
                  <p className="mt-2">{ptn.materials}</p>
                </div>
              </div>

              <p className="mt-5 text-sm leading-relaxed text-slate-600">{ptn.scheme}</p>

              <a
                href={ptn.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-5 inline-flex items-center gap-2 text-sm font-black text-[#0A66FF]"
              >
                Cek sumber resmi <ExternalLink size={15} />
              </a>
            </article>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <p className="text-sm font-bold text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-black text-slate-950">{value}</p>
    </div>
  );
}
