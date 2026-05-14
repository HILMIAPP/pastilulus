"use client";

import { useState } from "react";
import Link from "next/link";
import { BookOpenText, CheckCircle, FileText, PlayCircle } from "lucide-react";
import { learningModules } from "@/components/student-dashboard-data";
import type { AppSession } from "@/lib/session-codec";
import { storageKeys } from "@/lib/site-config";

export function StudentLearningCard({ session }: { session: AppSession | null }) {
  const [completedModules, setCompletedModules] = useState<Record<string, boolean>>({});

  const markComplete = (moduleId: string) => {
    setCompletedModules((prev) => {
      const next = { ...prev, [moduleId]: true };
      if (session) {
        window.localStorage.setItem(storageKeys.moduleProgress(session.userId), JSON.stringify(next));
      }
      return next;
    });
  };

  return (
    <section id="belajar" className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-lg font-black text-slate-900">
          <PlayCircle className="text-indigo-500" size={20} />
          Lanjutkan Belajar
        </h2>
        <Link href="/siswa/belajar" className="text-sm font-bold text-[#0A66FF] hover:underline">
          Semua Materi
        </Link>
      </div>

      <div className="space-y-3">
        {learningModules.slice(0, 4).map((module) => {
          const done = completedModules[module.id];

          return (
            <Link
              key={module.id}
              href={`/siswa/belajar/${module.slug}`}
              className="group flex w-full items-center gap-3 rounded-xl border border-slate-100 p-3 text-left transition hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-sm"
              onClick={() => markComplete(module.id)}
            >
              <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-white ${module.color}`}>
                {module.type === "tracker" ? <FileText size={17} /> : <BookOpenText size={17} />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-black text-slate-900">{module.title}</span>
                <span className="mt-0.5 block text-xs text-slate-500">
                  {module.subject} - {module.duration} mnt
                </span>
              </span>
              {done && <CheckCircle size={18} className="text-emerald-500" />}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
