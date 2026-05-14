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

const steps = ["Profil", "Target", "Akademik", "Jadwal", "Rencana"];
const studentStatuses = ["Kelas 12", "Gap year", "Kelas 11", "Lulusan tahun ini"];
const schoolTracks = ["IPA", "IPS", "Bahasa", "SMK", "Campuran"];
const majorGroups = [
  "Kedokteran/Kesehatan",
  "Teknik/Komputer",
  "Saintek umum",
  "Sosial humaniora",
  "Ekonomi/Bisnis",
  "Pendidikan",
  "Seni/Olahraga",
  "Belum yakin",
];
const reminderOptions = ["Deadline PTN", "Tryout mingguan", "Belajar harian"];

type Props = {
  session: AppSession | null;
};

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
  const progress = Math.round(((step + 1) / steps.length) * 100);

  const updateProfile = <K extends keyof OnboardingProfile>(key: K, value: OnboardingProfile[K]) => {
    setProfile((current) => ({ ...current, [key]: value }));
  };

  const toggleTarget = (id: string) => {
    setProfile((current) => {
      const exists = current.targetPtnIds.includes(id);
      const targetPtnIds = exists
        ? current.targetPtnIds.filter((targetId) => targetId !== id)
        : [...current.targetPtnIds, id].slice(0, 5);

      return { ...current, targetPtnIds };
    });
  };

  const toggleReminder = (value: string) => {
    setProfile((current) => ({
      ...current,
      reminders: current.reminders.includes(value)
        ? current.reminders.filter((item) => item !== value)
        : [...current.reminders, value],
    }));
  };

  const finishOnboarding = () => {
    const completedProfile = { ...profile, completedAt: new Date().toISOString() };
    window.localStorage.setItem(onboardingStorageKey, JSON.stringify(completedProfile));
    window.localStorage.setItem(storageKeys.ptnTargets, JSON.stringify(completedProfile.targetPtnIds));
    router.push("/siswa");
  };

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 md:px-8">
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="bg-slate-950 px-6 py-7 text-white sm:px-8">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-blue-300">Onboarding siswa baru</p>
          <h1 className="mt-3 max-w-3xl text-3xl font-black leading-tight">
            Bikin rencana belajar mandiri yang langsung nyambung ke target PTN.
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-300">
            Isi 2-4 menit. Setelah selesai, dashboard akan menampilkan target, deadline, materi prioritas, dan
            rekomendasi tryout pertama.
          </p>
        </div>

        <div className="border-b border-slate-200 px-6 py-5 sm:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              {steps.map((label, index) => (
                <span
                  key={label}
                  className={`rounded-2xl px-3 py-1.5 text-xs font-black ${
                    index === step ? "bg-blue-600 text-white" : index < step ? "bg-blue-50 text-blue-700" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {index + 1}. {label}
                </span>
              ))}
            </div>
            <span className="text-sm font-black text-slate-500">{progress}%</span>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-blue-600 transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="p-6 sm:p-8">
          {step === 0 && (
            <StepShell icon={User} title="Kenalan dulu" desc="Data ini dipakai untuk membuat dashboard terasa personal.">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Nama panggilan">
                  <input
                    value={profile.nickname}
                    onChange={(event) => updateProfile("nickname", event.target.value)}
                    placeholder="Contoh: Nuka"
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-900 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  />
                </Field>
                <Field label="Domisili/kota">
                  <input
                    value={profile.city}
                    onChange={(event) => updateProfile("city", event.target.value)}
                    placeholder="Contoh: Bandung"
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-900 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  />
                </Field>
                <ChoiceGroup
                  label="Status sekarang"
                  options={studentStatuses}
                  value={profile.status}
                  onChange={(value) => updateProfile("status", value)}
                />
                <ChoiceGroup
                  label="Jurusan sekolah"
                  options={schoolTracks}
                  value={profile.schoolTrack}
                  onChange={(value) => updateProfile("schoolTrack", value)}
                />
              </div>
            </StepShell>
          )}

          {step === 1 && (
            <StepShell icon={Target} title="Pilih target PTN" desc="Pilih maksimal 5 kampus. Nanti bisa diubah lagi dari Info PTN.">
              <div className="grid gap-3 md:grid-cols-2">
                {ptnDeadlines.map((ptn) => {
                  const active = profile.targetPtnIds.includes(ptn.id);
                  return (
                    <button
                      key={ptn.id}
                      type="button"
                      onClick={() => toggleTarget(ptn.id)}
                      className={`rounded-2xl border p-4 text-left transition ${
                        active ? "border-blue-500 bg-blue-50 ring-4 ring-blue-100" : "border-slate-200 bg-white hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-black text-slate-950">{ptn.shortName}</p>
                          <p className="mt-1 text-sm font-semibold text-slate-600">{ptn.name}</p>
                        </div>
                        {active && <CheckCircle2 size={20} className="text-blue-700" />}
                      </div>
                      <p className="mt-3 text-xs font-bold text-slate-500">Tutup: {ptn.closeAt}</p>
                    </button>
                  );
                })}
              </div>
            </StepShell>
          )}

          {step === 2 && (
            <StepShell icon={BookOpen} title="Cek kondisi akademik" desc="Jujur di tahap ini lebih penting daripada terlihat kuat.">
              <ChoiceGroup
                label="Rumpun prodi utama"
                options={majorGroups}
                value={profile.primaryMajorGroup}
                onChange={(value) => updateProfile("primaryMajorGroup", value)}
              />

              <div className="mt-6 grid gap-3">
                {Object.entries(profile.academic).map(([subject, level]) => (
                  <div key={subject} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="font-black text-slate-950">{subject}</p>
                    <div className="mt-3 grid grid-cols-3 gap-2">
                      {(["lemah", "sedang", "kuat"] as AcademicLevel[]).map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() =>
                            updateProfile("academic", {
                              ...profile.academic,
                              [subject]: option,
                            })
                          }
                          className={`rounded-xl px-3 py-2 text-xs font-black capitalize ${
                            level === option ? "bg-blue-600 text-white" : "bg-white text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </StepShell>
          )}

          {step === 3 && (
            <StepShell icon={CalendarDays} title="Atur ritme belajar" desc={`${site.name} akan menyesuaikan rekomendasi dengan waktu yang realistis.`}>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Hari belajar per minggu">
                  <input
                    type="number"
                    min="1"
                    max="7"
                    value={profile.studyDays}
                    onChange={(event) => updateProfile("studyDays", event.target.value)}
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-900 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  />
                </Field>
                <Field label="Jam belajar per hari">
                  <input
                    type="number"
                    min="1"
                    max="8"
                    value={profile.studyDuration}
                    onChange={(event) => updateProfile("studyDuration", event.target.value)}
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-900 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  />
                </Field>
                <ChoiceGroup
                  label="Waktu favorit"
                  options={["Pagi", "Siang", "Malam"]}
                  value={profile.studyTime}
                  onChange={(value) => updateProfile("studyTime", value)}
                />
                <div>
                  <p className="text-xs font-black uppercase tracking-wide text-slate-500">Reminder</p>
                  <div className="mt-3 grid gap-2">
                    {reminderOptions.map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => toggleReminder(option)}
                        className={`flex items-center justify-between rounded-xl border px-4 py-3 text-sm font-black ${
                          profile.reminders.includes(option)
                            ? "border-blue-400 bg-blue-50 text-blue-800"
                            : "border-slate-200 bg-white text-slate-600"
                        }`}
                      >
                        {option}
                        <Bell size={16} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </StepShell>
          )}

          {step === 4 && (
            <StepShell icon={GraduationCap} title="Rencana awal kamu" desc="Ini akan tersimpan ke dashboard setelah kamu klik selesai.">
              <div className="grid gap-4 lg:grid-cols-[1fr_0.85fr]">
                <div className="rounded-3xl border border-blue-100 bg-blue-50 p-5">
                  <p className="text-sm font-black text-blue-900">Target utama</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {selectedTargets.map((ptn) => (
                      <span key={ptn.id} className="rounded-full bg-white px-3 py-1 text-xs font-black text-blue-800">
                        {ptn.shortName}
                      </span>
                    ))}
                  </div>
                  <p className="mt-5 text-sm font-black text-blue-900">Fokus materi</p>
                  <div className="mt-3 grid gap-2">
                    {recommendation.focusSubjects.map((subject) => (
                      <div key={subject} className="rounded-2xl bg-white p-3 text-sm font-bold text-blue-950">
                        {subject}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-white p-5">
                  <p className="text-sm font-black text-slate-950">Rekomendasi minggu pertama</p>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    Intensitas: <strong>{recommendation.intensity}</strong>. Mulai dari <strong>{recommendation.firstTryout}</strong>.
                  </p>
                  <div className="mt-4 grid gap-2">
                    {recommendation.weeklyPlan.map((item) => (
                      <div key={item} className="flex gap-2 text-sm font-semibold text-slate-700">
                        <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-blue-700" />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </StepShell>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-6 py-5 sm:px-8">
          <button
            type="button"
            onClick={() => (step === 0 ? router.push("/siswa") : setStep((value) => value - 1))}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-800 hover:bg-slate-50"
          >
            <ArrowLeft size={17} />
            {step === 0 ? "Lewati dulu" : "Kembali"}
          </button>

          {step < steps.length - 1 ? (
            <button
              type="button"
              disabled={!canContinue}
              onClick={() => setStep((value) => value + 1)}
              className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              Lanjut
              <ArrowRight size={17} />
            </button>
          ) : (
            <button
              type="button"
              onClick={finishOnboarding}
              className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black text-white hover:bg-blue-700"
            >
              Simpan & buka dashboard
              <ArrowRight size={17} />
            </button>
          )}
        </div>
      </section>
    </main>
  );
}

function validateStep(step: number, profile: OnboardingProfile) {
  if (step === 0) return profile.nickname.trim().length > 0 && profile.city.trim().length > 0;
  if (step === 1) return profile.targetPtnIds.length > 0;
  if (step === 2) return profile.primaryMajorGroup.length > 0;
  if (step === 3) return Number(profile.studyDays) > 0 && Number(profile.studyDuration) > 0;
  return true;
}

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
      <div className="mb-6 flex gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
          <Icon size={23} />
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-950">{title}</h2>
          <p className="mt-1 text-sm leading-relaxed text-slate-600">{desc}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label>
      <span className="text-xs font-black uppercase tracking-wide text-slate-500">{label}</span>
      <div className="mt-2">{children}</div>
    </label>
  );
}

function ChoiceGroup({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <p className="text-xs font-black uppercase tracking-wide text-slate-500">{label}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={`rounded-2xl px-4 py-2 text-sm font-black ${
              value === option ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
