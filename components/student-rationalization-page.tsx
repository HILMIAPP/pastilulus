"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, BarChart3, ShieldCheck, Target, TrendingUp } from "lucide-react";
import { calculateRationalization, type ExamScoreSummary } from "@/lib/um-rationalization";
import { storageKeys } from "@/lib/site-config";

type BagianStat = { benar: number; salah: number; kosong: number; total: number };

type SavedTryoutResult = ExamScoreSummary & {
  paketTitle: string;
  createdAt: string;
  bagianStats?: Record<string, BagianStat>;
};

export function StudentRationalizationPage() {
  const [savedResult] = useState<SavedTryoutResult | null>(() => readLatestResult());
  const rationalization = useMemo(() => (savedResult ? calculateRationalization(savedResult) : null), [savedResult]);

  if (!savedResult || !rationalization) {
    return (
      <main className="mx-auto w-full max-w-5xl px-4 py-8 md:px-8">
        <section className="rounded-3xl border border-blue-100 bg-blue-50 p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white">
            <BarChart3 size={26} />
          </div>
          <h1 className="mt-5 text-2xl font-black text-blue-950">Belum ada nilai untuk dirasionalisasi.</h1>
          <p className="mx-auto mt-2 max-w-xl text-sm font-semibold leading-relaxed text-blue-900">
            Kerjakan satu simulasi ujian dulu. Setelah submit, peluang target PTN akan muncul di sini.
          </p>
          <Link
            href="/siswa/tryout"
            className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black text-white"
          >
            Mulai simulasi <ArrowRight size={17} />
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 md:px-8">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="flex items-center gap-2 text-sm font-black uppercase tracking-wide text-[#0A66FF]">
          <TrendingUp size={18} />
          Rasionalisasi
        </p>
        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-black text-slate-950">Peluang target berdasarkan tryout terakhir.</h1>
            <p className="mt-3 max-w-2xl leading-relaxed text-slate-600">
              Berdasarkan {savedResult.paketTitle}. Ini estimasi internal untuk membantu strategi, bukan jaminan
              kelulusan resmi kampus.
            </p>
          </div>
          <div className="rounded-3xl bg-slate-950 px-6 py-4 text-white">
            <p className="text-xs font-black uppercase tracking-wide text-slate-300">Skor estimasi</p>
            <p className="mt-1 text-4xl font-black">{rationalization.normalizedScore}</p>
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-3">
        <Metric label="Akurasi" value={`${rationalization.accuracy}%`} />
        <Metric label="Soal terisi" value={`${rationalization.answeredRate}%`} />
        <Metric label="Benar/Salah/Kosong" value={`${savedResult.benar}/${savedResult.salah}/${savedResult.kosong}`} />
      </section>

      {savedResult.bagianStats && Object.keys(savedResult.bagianStats).length > 0 && (
        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-black uppercase tracking-wide text-slate-400">Analisis Per Bagian</p>
          <h2 className="mt-1 text-xl font-black text-slate-950">Distribusi nilai per mata uji.</h2>
          <div className="mt-5 space-y-4">
            {Object.entries(savedResult.bagianStats).map(([bagian, stat]) => {
              const akurasi = stat.total > 0 ? Math.round((stat.benar / stat.total) * 100) : 0;
              const barColor = akurasi >= 70 ? "bg-emerald-500" : akurasi >= 45 ? "bg-amber-400" : "bg-rose-500";
              return (
                <div key={bagian}>
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="font-black text-slate-800">{bagian}</span>
                    <div className="flex items-center gap-3 text-xs font-bold text-slate-500">
                      <span className="text-emerald-600">{stat.benar}✓</span>
                      <span className="text-rose-500">{stat.salah}✗</span>
                      <span className="text-slate-400">{stat.kosong}○</span>
                      <span className="w-10 text-right font-black text-slate-700">{akurasi}%</span>
                    </div>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${akurasi}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
          <p className="mt-4 text-xs font-semibold text-slate-400">
            Merah &lt;45% — perlu penguatan. Kuning 45–69% — bisa dioptimalkan. Hijau ≥70% — sudah solid.
          </p>
        </section>
      )}

      <section className="mt-6 grid gap-4 md:grid-cols-2">
        {rationalization.targets.map((target) => (
          <article key={target.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-black text-slate-950">{target.jalur}</p>
                <p className="mt-1 text-sm font-semibold text-slate-500">{target.kampus}</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-black ${getTone(target.tone)}`}>{target.status}</span>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-blue-600" style={{ width: `${target.probability}%` }} />
            </div>
            <div className="mt-3 flex justify-between text-sm font-bold text-slate-600">
              <span>Peluang {target.probability}%</span>
              <span>{target.gap >= 0 ? "+" : ""}{target.gap} benchmark</span>
            </div>
          </article>
        ))}
      </section>

      <section className="mt-6 rounded-3xl border border-blue-100 bg-blue-50 p-6">
        <p className="flex items-center gap-2 text-sm font-black text-blue-950">
          <ShieldCheck size={18} />
          Rekomendasi berikutnya
        </p>
        <div className="mt-4 grid gap-3">
          {rationalization.nextActions.map((action) => (
            <div key={action} className="flex gap-3 rounded-2xl bg-white p-4 text-sm font-bold text-slate-700">
              <Target size={16} className="mt-0.5 shrink-0 text-blue-700" />
              {action}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-bold text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-black text-slate-950">{value}</p>
    </div>
  );
}

function getTone(tone: "emerald" | "blue" | "amber" | "rose") {
  const styles = {
    emerald: "bg-emerald-100 text-emerald-800",
    blue: "bg-blue-100 text-blue-800",
    amber: "bg-amber-100 text-amber-800",
    rose: "bg-rose-100 text-rose-800",
  };
  return styles[tone];
}

function readLatestResult() {
  if (typeof window === "undefined") return null;
  try {
    const saved = window.localStorage.getItem(storageKeys.latestTryoutResult);
    return saved ? (JSON.parse(saved) as SavedTryoutResult) : null;
  } catch {
    return null;
  }
}
