"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Bell,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  GraduationCap,
  Target,
  User,
} from "lucide-react";
import { ptnDeadlines } from "@/components/student-dashboard-data";
import {
  buildStudyRecommendation,
  defaultAcademic,
  onboardingStorageKey,
  type AcademicLevel,
  type OnboardingProfile,
} from "@/lib/onboarding";
import type { AppSession } from "@/lib/session-codec";
import { site, storageKeys } from "@/lib/site-config";

const STEPS = ["Profil", "Target", "Akademik", "Jadwal", "Rencana"] as const;
const STUDENT_STATUSES = ["Kelas 12", "Gap year", "Kelas 11", "Lulusan tahun ini"];
const SCHOOL_TRACKS = ["IPA", "IPS", "Bahasa", "SMK", "Campuran"];
const MAJOR_GROUPS = [
  "Kedokteran/Kesehatan", "Teknik/Komputer", "Saintek umum",
  "Sosial humaniora", "Ekonomi/Bisnis", "Pendidikan", "Seni/Olahraga", "Belum yakin",
];
const REMINDER_OPTIONS = ["Deadline PTN", "Tryout mingguan", "Belajar harian"];
const STUDY_DAYS = [1, 2, 3, 4, 5, 6, 7];
const STUDY_HOURS = [1, 2, 3, 4, 5, 6];

type Props = { session: AppSession | null };

export function OnboardingFlow({ session }: Props) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<OnboardingProfile>({
    nickname: session?.name?.split(" ")[0] ?? "",
    status: "Kelas 12",
    city: "",
    schoolTrack: "IPA",
    targetPtnIds: [],
    primaryMajorGroup: "Belum yakin",
    academic: defaultAcademic,
    hasUtbkScore: false,
    utbkScore: "",
    studyDays: "5",
    studyDuration: "2",
    studyTime: "Malam",
    reminders: ["Deadline PTN", "Tryout mingguan"],
    completedAt: "",
  });

  const recommendation = useMemo(() => buildStudyRecommendation(profile), [profile]);
  const selectedTargets = ptnDeadlines.filter((ptn) => profile.targetPtnIds.includes(ptn.id));
  const canContinue = validateStep(step, profile);

  const updateProfile = <K extends keyof OnboardingProfile>(key: K, value: OnboardingProfile[K]) =>
    setProfile((curr) => ({ ...curr, [key]: value }));

  const toggleTarget = (id: string) =>
    setProfile((curr) => {
      const exists = curr.targetPtnIds.includes(id);
      const targetPtnIds = exists
        ? curr.targetPtnIds.filter((t) => t !== id)
        : [...curr.targetPtnIds, id].slice(0, 5);
      return { ...curr, targetPtnIds };
    });

  const toggleReminder = (value: string) =>
    setProfile((curr) => ({
      ...curr,
      reminders: curr.reminders.includes(value)
        ? curr.reminders.filter((r) => r !== value)
        : [...curr.reminders, value],
    }));

  const finishOnboarding = () => {
    const completedProfile = { ...profile, completedAt: new Date().toISOString() };
    window.localStorage.setItem(onboardingStorageKey, JSON.stringify(completedProfile));
    window.localStorage.setItem(storageKeys.ptnTargets, JSON.stringify(completedProfile.targetPtnIds));
    router.push("/siswa");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Top bar ── */}
      <div className="sticky top-0 z-10 border-b border-slate-200 bg-white px-5 py-4 sm:px-8">
        <div className="mx-auto flex max-w-2xl items-center gap-4">
          {/* Back */}
          <button
            type="button"
            onClick={() => (step === 0 ? router.push("/siswa") : setStep((s) => s - 1))}
            className="shrink-0 rounded-xl p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <ArrowLeft size={18} />
          </button>

          {/* Step dots */}
          <div className="flex flex-1 items-center gap-1.5">
            {STEPS.map((label, i) => (
              <div
                key={label}
                title={label}
                className={`h-1.5 flex-1 rounded-full transition-all ${
                  i <= step ? "bg-slate-950" : "bg-slate-200"
                }`}
              />
            ))}
          </div>

          {/* Step counter */}
          <span className="shrink-0 text-xs font-bold text-slate-400">
            {step + 1} / {STEPS.length}
          </span>
        </div>
      </div>

      {/* ── Step content ── */}
      <div className="mx-auto max-w-2xl px-5 py-10 sm:px-8">

        {/* Step 0 — Profil */}
        {step === 0 && (
          <StepShell icon={User} title="Kenalan dulu 👋" desc="Data ini bikin dashboard kamu terasa personal.">
            <div className="space-y-4">
              <Field label="Nama panggilan">
                <input
                  value={profile.nickname}
                  onChange={(e) => updateProfile("nickname", e.target.value)}
                  placeholder="Contoh: Nuka"
                  className={inputCls}
                />
              </Field>
              <Field label="Domisili / kota">
                <input
                  value={profile.city}
                  onChange={(e) => updateProfile("city", e.target.value)}
                  placeholder="Contoh: Bandung"
                  className={inputCls}
                />
              </Field>
              <PillGroup
                label="Status sekarang"
                options={STUDENT_STATUSES}
                value={profile.status}
                onChange={(v) => updateProfile("status", v)}
              />
              <PillGroup
                label="Jurusan sekolah"
                options={SCHOOL_TRACKS}
                value={profile.schoolTrack}
                onChange={(v) => updateProfile("schoolTrack", v)}
              />
            </div>
          </StepShell>
        )}

        {/* Step 1 — Target PTN */}
        {step === 1 && (
          <StepShell
            icon={Target}
            title="Pilih target PTN 🎯"
            desc={`Pilih maksimal 5 kampus. Dipilih: ${profile.targetPtnIds.length}/5`}
          >
            <div className="grid gap-3 sm:grid-cols-2">
              {ptnDeadlines.map((ptn) => {
                const active = profile.targetPtnIds.includes(ptn.id);
                return (
                  <button
                    key={ptn.id}
                    type="button"
                    onClick={() => toggleTarget(ptn.id)}
                    className={`rounded-2xl border p-4 text-left transition ${
                      active
                        ? "border-slate-950 bg-slate-950 text-white"
                        : "border-slate-200 bg-white text-slate-900 hover:border-slate-400"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-black">{ptn.shortName}</p>
                        <p className={`mt-0.5 text-xs ${active ? "text-slate-300" : "text-slate-500"}`}>
                          {ptn.name}
                        </p>
                      </div>
                      {active && <CheckCircle2 size={18} className="shrink-0 text-white" />}
                    </div>
                    <p className={`mt-3 text-[11px] font-semibold ${active ? "text-slate-400" : "text-slate-400"}`}>
                      Tutup: {ptn.closeAt}
                    </p>
                  </button>
                );
              })}
            </div>
          </StepShell>
        )}

        {/* Step 2 — Akademik */}
        {step === 2 && (
          <StepShell
            icon={BookOpen}
            title="Kondisi akademik kamu 📚"
            desc="Jujur di sini lebih penting dari terlihat kuat."
          >
            <PillGroup
              label="Rumpun prodi utama"
              options={MAJOR_GROUPS}
              value={profile.primaryMajorGroup}
              onChange={(v) => updateProfile("primaryMajorGroup", v)}
            />

            <div className="mt-6 space-y-3">
              <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                Nilai diri sendiri per mapel
              </p>
              {Object.entries(profile.academic).map(([subject, level]) => (
                <div key={subject} className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-sm font-bold text-slate-900">{subject}</p>
                  <div className="mt-3 flex gap-2">
                    {(["lemah", "sedang", "kuat"] as AcademicLevel[]).map((opt) => {
                      const emoji = opt === "lemah" ? "😰" : opt === "sedang" ? "😐" : "💪";
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => updateProfile("academic", { ...profile.academic, [subject]: opt })}
                          className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-black capitalize transition ${
                            level === opt
                              ? "bg-slate-950 text-white"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          }`}
                        >
                          <span>{emoji}</span> {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </StepShell>
        )}

        {/* Step 3 — Jadwal */}
        {step === 3 && (
          <StepShell
            icon={CalendarDays}
            title="Ritme belajar kamu ⏰"
            desc={`${site.name} akan menyesuaikan rekomendasi dengan waktu yang realistis.`}
          >
            <div className="space-y-6">
              {/* Study days */}
              <div>
                <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                  Hari belajar per minggu
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {STUDY_DAYS.map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => updateProfile("studyDays", String(n))}
                      className={`flex h-11 w-11 items-center justify-center rounded-2xl text-sm font-black transition ${
                        profile.studyDays === String(n)
                          ? "bg-slate-950 text-white"
                          : "border border-slate-200 bg-white text-slate-700 hover:border-slate-400"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-xs text-slate-400">
                  {Number(profile.studyDays)} hari dipilih
                </p>
              </div>

              {/* Study hours */}
              <div>
                <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                  Jam belajar per hari
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {STUDY_HOURS.map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => updateProfile("studyDuration", String(n))}
                      className={`flex h-11 w-11 items-center justify-center rounded-2xl text-sm font-black transition ${
                        profile.studyDuration === String(n)
                          ? "bg-slate-950 text-white"
                          : "border border-slate-200 bg-white text-slate-700 hover:border-slate-400"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-xs text-slate-400">
                  {Number(profile.studyDuration)} jam per hari
                </p>
              </div>

              {/* Time of day */}
              <PillGroup
                label="Waktu favorit"
                options={["Pagi", "Siang", "Malam"]}
                value={profile.studyTime}
                onChange={(v) => updateProfile("studyTime", v)}
              />

              {/* Reminders */}
              <div>
                <p className="text-xs font-black uppercase tracking-wide text-slate-500">Aktifkan reminder</p>
                <div className="mt-3 space-y-2">
                  {REMINDER_OPTIONS.map((opt) => {
                    const active = profile.reminders.includes(opt);
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => toggleReminder(opt)}
                        className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-sm font-bold transition ${
                          active
                            ? "border-slate-950 bg-slate-950 text-white"
                            : "border-slate-200 bg-white text-slate-700 hover:border-slate-400"
                        }`}
                      >
                        {opt}
                        <Bell size={15} className={active ? "text-slate-300" : "text-slate-400"} />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </StepShell>
        )}

        {/* Step 4 — Rencana */}
        {step === 4 && (
          <StepShell
            icon={GraduationCap}
            title={`Rencana awal kamu${profile.nickname ? `, ${profile.nickname}` : ""} 🚀`}
            desc="Klik Mulai belajar untuk simpan dan buka dashboard."
          >
            {/* Target chips */}
            {selectedTargets.length > 0 && (
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <p className="text-xs font-black uppercase tracking-wide text-slate-500">Target kampus</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {selectedTargets.map((ptn) => (
                    <span
                      key={ptn.id}
                      className="rounded-full bg-slate-950 px-3 py-1 text-xs font-bold text-white"
                    >
                      {ptn.shortName}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendation summary */}
            <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5">
              <p className="text-xs font-black uppercase tracking-wide text-slate-500">Fokus materi</p>
              <div className="mt-3 space-y-2">
                {recommendation.focusSubjects.map((subject) => (
                  <div key={subject} className="flex items-center gap-2 rounded-xl bg-slate-50 px-4 py-2.5 text-sm font-bold text-slate-900">
                    <CheckCircle2 size={15} className="shrink-0 text-[#0A66FF]" />
                    {subject}
                  </div>
                ))}
              </div>
            </div>

            {/* Weekly plan */}
            <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-black uppercase tracking-wide text-slate-500">Minggu pertama</p>
                <span className="rounded-full border border-slate-200 px-2.5 py-0.5 text-[10px] font-bold text-slate-500">
                  Intensitas: {recommendation.intensity}
                </span>
              </div>
              <div className="mt-3 space-y-2">
                {recommendation.weeklyPlan.map((item) => (
                  <p key={item} className="flex gap-2 text-sm text-slate-600">
                    <span className="mt-0.5 shrink-0 text-slate-300">—</span>
                    {item}
                  </p>
                ))}
              </div>
            </div>
          </StepShell>
        )}

        {/* ── Navigation ── */}
        <div className="mt-8 flex items-center justify-between">
          {/* Skip/Back — handled by top bar back button, but keep skip on step 0 */}
          {step === 0 && (
            <button
              type="button"
              onClick={() => router.push("/siswa")}
              className="text-sm font-semibold text-slate-400 hover:text-slate-700"
            >
              Lewati dulu
            </button>
          )}
          {step > 0 && <div />}

          {step < STEPS.length - 1 ? (
            <button
              type="button"
              disabled={!canContinue}
              onClick={() => setStep((s) => s + 1)}
              className="ml-auto inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-6 py-3 text-sm font-black text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
            >
              Lanjut <ArrowRight size={16} />
            </button>
          ) : (
            <button
              type="button"
              onClick={finishOnboarding}
              className="ml-auto inline-flex items-center gap-2 rounded-2xl bg-[#0A66FF] px-6 py-3 text-sm font-black text-white transition hover:bg-[#0052D6]"
            >
              Mulai belajar <ArrowRight size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Helpers ──────────────────────────────────────────────────────────── */

function validateStep(step: number, profile: OnboardingProfile) {
  if (step === 0) return profile.nickname.trim().length > 0 && profile.city.trim().length > 0;
  if (step === 1) return profile.targetPtnIds.length > 0;
  if (step === 2) return profile.primaryMajorGroup.length > 0;
  if (step === 3) return Number(profile.studyDays) > 0 && Number(profile.studyDuration) > 0;
  return true;
}

const inputCls =
  "h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 outline-none transition focus:border-slate-950 focus:ring-4 focus:ring-slate-950/10";

function StepShell({
  icon: Icon,
  title,
  desc,
  children,
}: {
  icon: typeof User;
  title: string;
  desc: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-8">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
          <Icon size={20} />
        </div>
        <h2 className="mt-4 text-2xl font-black text-slate-950">{title}</h2>
        <p className="mt-1 text-sm leading-relaxed text-slate-500">{desc}</p>
      </div>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-black uppercase tracking-wide text-slate-500">{label}</span>
      <div className="mt-2">{children}</div>
    </label>
  );
}

function PillGroup({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <p className="text-xs font-black uppercase tracking-wide text-slate-500">{label}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={`rounded-2xl px-4 py-2 text-sm font-bold transition ${
              value === opt
                ? "bg-slate-950 text-white"
                : "border border-slate-200 bg-white text-slate-600 hover:border-slate-400"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
