"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, CalendarDays, ClipboardCheck, Target } from "lucide-react";
import { ptnDeadlines } from "@/components/student-dashboard-data";
import { storageKeys } from "@/lib/site-config";

type ChecklistState = Record<string, Record<string, boolean>>;

const checklistItems = [
  { key: "account", label: "Akun pendaftaran" },
  { key: "documents", label: "Dokumen siap" },
  { key: "fee", label: "Biaya dicek" },
  { key: "practice", label: "Simulasi CBT" },
  { key: "source", label: "Cek sumber resmi" },
];

export function StudentTargetPage() {
  const [targetIds] = useState<string[]>(() => readStorage(storageKeys.ptnTargets, []));
  const [checklist, setChecklist] = useState<ChecklistState>(() => readStorage(storageKeys.ptnChecklist, {}));
  const targets = useMemo(() => ptnDeadlines.filter((ptn) => targetIds.includes(ptn.id)), [targetIds]);

  const toggleChecklist = (ptnId: string, key: string) => {
    setChecklist((current) => {
      const next = {
        ...current,
        [ptnId]: {
          ...current[ptnId],
          [key]: !current[ptnId]?.[key],
        },
      };
      window.localStorage.setItem(storageKeys.ptnChecklist, JSON.stringify(next));
      return next;
    });
  };

  if (targets.length === 0) {
    return (
      <main className="mx-auto w-full max-w-5xl px-4 py-8 md:px-8">
        <EmptyState />
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 md:px-8">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="flex items-center gap-2 text-sm font-black uppercase tracking-wide text-[#0A66FF]">
          <Target size={18} />
          Target Saya
        </p>
        <h1 className="mt-3 text-3xl font-black text-slate-950">Pantau kampus prioritas dan kesiapan daftar.</h1>
        <p className="mt-3 max-w-2xl leading-relaxed text-slate-600">
          Fokus ke target yang sudah kamu pin. Checklist ini membantu memastikan persiapan belajar dan administrasi
          berjalan bareng.
        </p>
      </section>

      <section className="mt-6 grid gap-5 lg:grid-cols-2">
        {targets.map((ptn) => {
          const done = checklistItems.filter((item) => checklist[ptn.id]?.[item.key]).length;
          const progress = Math.round((done / checklistItems.length) * 100);

          return (
            <article key={ptn.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-black text-[#0A66FF]">{ptn.shortName}</p>
                  <h2 className="mt-2 text-xl font-black text-slate-950">{ptn.name}</h2>
                  <p className="mt-1 text-sm font-semibold text-slate-500">{ptn.selectionName}</p>
                </div>
                <span className={`rounded-xl px-3 py-1 text-xs font-black ${ptn.color}`}>{ptn.status}</span>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <InfoPill icon={CalendarDays} label="Deadline" value={ptn.closeAt} />
                <InfoPill icon={Target} label="Prioritas" value={ptn.priority} />
              </div>

              <div className="mt-5 rounded-2xl bg-slate-50 p-4">
                <div className="flex items-center justify-between">
                  <p className="flex items-center gap-2 text-sm font-black text-slate-950">
                    <ClipboardCheck size={17} className="text-[#0A66FF]" />
                    Checklist
                  </p>
                  <span className="text-xs font-black text-slate-500">{progress}%</span>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
                  <div className="h-full rounded-full bg-blue-600" style={{ width: `${progress}%` }} />
                </div>
                <div className="mt-4 grid gap-2">
                  {checklistItems.map((item) => (
                    <label key={item.key} className="flex cursor-pointer items-center gap-3 rounded-xl bg-white p-3">
                      <input
                        type="checkbox"
                        checked={Boolean(checklist[ptn.id]?.[item.key])}
                        onChange={() => toggleChecklist(ptn.id, item.key)}
                        className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
                      />
                      <span className="text-sm font-bold text-slate-700">{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </article>
          );
        })}
      </section>
    </main>
  );
}

function EmptyState() {
  return (
    <section className="rounded-3xl border border-blue-100 bg-blue-50 p-8 text-center shadow-sm">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white">
        <Target size={26} />
      </div>
      <h1 className="mt-5 text-2xl font-black text-blue-950">Belum ada kampus target.</h1>
      <p className="mx-auto mt-2 max-w-xl text-sm font-semibold leading-relaxed text-blue-900">
        Pilih kampus target dari onboarding atau Info PTN supaya dashboard kamu punya arah yang jelas.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link href="/siswa/onboarding" className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black text-white">
          Mulai onboarding <ArrowRight size={17} />
        </Link>
        <Link href="/siswa/info-ptn" className="inline-flex items-center gap-2 rounded-2xl border border-blue-200 bg-white px-5 py-3 text-sm font-black text-blue-700">
          Buka Info PTN <ArrowRight size={17} />
        </Link>
      </div>
    </section>
  );
}

function InfoPill({ icon: Icon, label, value }: { icon: typeof CalendarDays; label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="flex items-center gap-2 text-xs font-black uppercase tracking-wide text-slate-500">
        <Icon size={15} className="text-[#0A66FF]" />
        {label}
      </p>
      <p className="mt-2 text-sm font-black text-slate-800">{value}</p>
    </div>
  );
}

function readStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const value = window.localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}
