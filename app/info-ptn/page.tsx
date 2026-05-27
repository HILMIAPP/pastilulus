import { CalendarDays, ExternalLink, GraduationCap, Target } from "lucide-react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { ptnDeadlines } from "@/components/student-dashboard-data";
import { daftarUinPtkin, uinCount, iainCount } from "@/lib/umptkin-data";
import { site } from "@/lib/site-config";

export const metadata = {
  title: "Info PTN & UIN-PTKIN",
  description: `Jadwal, skema seleksi, dan daftar 39 UIN/IAIN/STAIN peserta UM-PTKIN 2026. Data ringkasan untuk strategi belajar ${site.name}.`,
  alternates: { canonical: `${site.url}/info-ptn` },
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

        <div className="mt-8 grid gap-4 sm:grid-cols-4">
          <SummaryCard label="PTN mandiri" value={`${ptnDeadlines.length}`} />
          <SummaryCard label="UIN PTKIN" value={`${daftarUinPtkin.length}`} />
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
        {/* UIN-PTKIN Section */}
        <section id="umptkin" className="mt-16 scroll-mt-8">
          <div className="max-w-3xl">
            <p className="text-sm font-black uppercase tracking-wide text-emerald-700">UM-PTKIN 2026</p>
            <h2 className="mt-3 text-2xl font-black text-slate-950 sm:text-3xl">
              Daftar {daftarUinPtkin.length} UIN/IAIN/STAIN peserta UM-PTKIN.
            </h2>
            <p className="mt-3 leading-relaxed text-slate-600">
              Semua kampus berikut menggunakan sistem UM-PTKIN sebagai jalur seleksi mandiri. Paket tryout UM-PTKIN
              di platform ini dirancang sesuai pola soal Sub Tes 1–5 yang berlaku di seluruh kampus ini.
            </p>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <span className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-black text-emerald-800">
              {uinCount} UIN
            </span>
            <span className="rounded-full bg-blue-100 px-4 py-2 text-sm font-black text-blue-800">
              {iainCount} IAIN
            </span>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {daftarUinPtkin.map((uin) => (
              <a
                key={uin.id}
                href={uin.url}
                target="_blank"
                rel="noreferrer"
                className="group flex items-start justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`shrink-0 rounded-lg px-2 py-0.5 text-[10px] font-black ${
                      uin.jenis === "UIN" ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"
                    }`}>
                      {uin.jenis}
                    </span>
                    <p className="truncate text-sm font-black text-slate-900">{uin.singkatan}</p>
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-500">{uin.nama}</p>
                  <p className="mt-1.5 text-[11px] font-semibold text-slate-400">{uin.kota}, {uin.provinsi}</p>
                </div>
                <ExternalLink size={14} className="mt-0.5 shrink-0 text-slate-300 group-hover:text-emerald-600" />
              </a>
            ))}
          </div>

          <p className="mt-6 text-xs font-semibold text-slate-400">
            * Data berdasarkan daftar resmi peserta UM-PTKIN. Verifikasi selalu ke portal resmi masing-masing kampus.
          </p>
        </section>
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
