"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, CheckCircle2, Target } from "lucide-react";
import { ptnDeadlines } from "@/components/student-dashboard-data";
import {
  buildStudyRecommendation,
  onboardingStorageKey,
  type OnboardingProfile,
} from "@/lib/onboarding";

export function StudentOnboardingSummary() {
  const [profile, setProfile] = useState<OnboardingProfile | null>(() => readOnboardingProfile());

  useEffect(() => {
    const handleStorage = () => setProfile(readOnboardingProfile());
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const recommendation = useMemo(() => (profile ? buildStudyRecommendation(profile) : null), [profile]);
  const selectedTargets = profile
    ? ptnDeadlines.filter((ptn) => profile.targetPtnIds.includes(ptn.id)).slice(0, 5)
    : [];

  if (!profile || !recommendation) {
    return (
      <section className="rounded-3xl border border-blue-100 bg-blue-50 p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="flex items-center gap-2 text-sm font-black text-blue-800">
              <Target size={18} />
              Rencana belajar belum dibuat
            </p>
            <h2 className="mt-2 text-xl font-black text-blue-950">Atur target PTN dulu biar dashboard lebih personal.</h2>
            <p className="mt-2 max-w-2xl text-sm font-semibold leading-relaxed text-blue-900">
              Pilih kampus, rumpun prodi, kondisi akademik, dan waktu belajar. Hasilnya akan jadi rekomendasi tryout
              dan materi awal.
            </p>
          </div>
          <Link
            href="/siswa/onboarding"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black text-white hover:bg-blue-700"
          >
            Mulai onboarding <ArrowRight size={17} />
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="flex items-center gap-2 text-sm font-black text-[#0A66FF]">
            <Target size={18} />
            Rencana belajar {profile.nickname}
          </p>
          <h2 className="mt-2 text-xl font-black text-slate-950">
            Fokus {recommendation.intensity}: {profile.primaryMajorGroup}
          </h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {selectedTargets.map((ptn) => (
              <span key={ptn.id} className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">
                {ptn.shortName}
              </span>
            ))}
          </div>
        </div>
        <Link
          href="/siswa/onboarding"
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 py-2 text-sm font-black text-slate-700 hover:bg-slate-50"
        >
          Edit rencana <ArrowRight size={16} />
        </Link>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {recommendation.focusSubjects.map((subject) => (
          <div key={subject} className="rounded-2xl bg-slate-50 p-4">
            <p className="flex items-center gap-2 text-sm font-black text-slate-950">
              <CheckCircle2 size={16} className="text-blue-700" />
              {subject}
            </p>
            <p className="mt-1 text-xs font-semibold text-slate-500">Materi prioritas minggu ini</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function readOnboardingProfile() {
  if (typeof window === "undefined") return null;

  try {
    const saved = window.localStorage.getItem(onboardingStorageKey);
    return saved ? (JSON.parse(saved) as OnboardingProfile) : null;
  } catch {
    return null;
  }
}
