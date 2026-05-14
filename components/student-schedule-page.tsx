"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, CalendarClock, CheckCircle2, Clock3 } from "lucide-react";
import {
  buildStudyRecommendation,
  onboardingStorageKey,
  type OnboardingProfile,
} from "@/lib/onboarding";

const days = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];

export function StudentSchedulePage() {
  const [profile] = useState<OnboardingProfile | null>(() => readProfile());
  const recommendation = useMemo(() => (profile ? buildStudyRecommendation(profile) : null), [profile]);

  if (!profile || !recommendation) {
    return (
      <main className="mx-auto w-full max-w-5xl px-4 py-8 md:px-8">
        <section className="rounded-3xl border border-blue-100 bg-blue-50 p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white">
            <CalendarClock size={26} />
          </div>
          <h1 className="mt-5 text-2xl font-black text-blue-950">Jadwal belum bisa dibuat.</h1>
          <p className="mx-auto mt-2 max-w-xl text-sm font-semibold leading-relaxed text-blue-900">
            Isi onboarding dulu agar jadwal belajar bisa disesuaikan dengan target, materi lemah, dan waktu luangmu.
          </p>
          <Link
            href="/siswa/onboarding"
            className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black text-white"
          >
            Mulai onboarding <ArrowRight size={17} />
          </Link>
        </section>
      </main>
    );
  }

  const activeDays = Number(profile.studyDays);
  const schedule = days.map((day, index) => ({
    day,
    active: index < activeDays,
    task: buildTask(index, recommendation.focusSubjects),
  }));

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 md:px-8">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="flex items-center gap-2 text-sm font-black uppercase tracking-wide text-[#0A66FF]">
          <CalendarClock size={18} />
          Jadwal Belajar
        </p>
        <h1 className="mt-3 text-3xl font-black text-slate-950">Ritme mingguan yang realistis.</h1>
        <p className="mt-3 max-w-2xl leading-relaxed text-slate-600">
          Berdasarkan onboarding: {profile.studyDays} hari/minggu, {profile.studyDuration} jam/hari, paling nyaman
          belajar saat {profile.studyTime.toLowerCase()}.
        </p>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {schedule.map((item) => (
          <article
            key={item.day}
            className={`rounded-3xl border p-5 shadow-sm ${
              item.active ? "border-slate-200 bg-white" : "border-slate-100 bg-slate-50 text-slate-400"
            }`}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black">{item.day}</h2>
              {item.active ? (
                <CheckCircle2 size={20} className="text-blue-700" />
              ) : (
                <span className="rounded-full bg-white px-3 py-1 text-xs font-black">Rest</span>
              )}
            </div>
            <p className="mt-4 text-sm font-semibold leading-relaxed">{item.active ? item.task : "Hari ringan untuk istirahat atau review santai."}</p>
            {item.active && (
              <div className="mt-4 flex items-center gap-2 rounded-2xl bg-blue-50 px-4 py-3 text-sm font-black text-blue-800">
                <Clock3 size={16} />
                {profile.studyDuration} jam - {profile.studyTime}
              </div>
            )}
          </article>
        ))}
      </section>
    </main>
  );
}

function buildTask(index: number, subjects: string[]) {
  const subject = subjects[index % Math.max(subjects.length, 1)] ?? "Penalaran Umum";
  const tasks = [
    `Latihan konsep dan 25 soal ${subject}.`,
    `Review pembahasan ${subject} dan catat pola salah.`,
    "Simulasi mini 45 menit dengan timer.",
    "Tryout CBT penuh atau lanjutkan paket UM.",
    "Evaluasi skor dan update target kampus.",
  ];

  return tasks[index % tasks.length];
}

function readProfile() {
  if (typeof window === "undefined") return null;
  try {
    const saved = window.localStorage.getItem(onboardingStorageKey);
    return saved ? (JSON.parse(saved) as OnboardingProfile) : null;
  } catch {
    return null;
  }
}
