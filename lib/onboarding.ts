export type AcademicLevel = "lemah" | "sedang" | "kuat";

import { storageKeys } from "@/lib/site-config";

export type OnboardingProfile = {
  nickname: string;
  status: string;
  city: string;
  schoolTrack: string;
  targetPtnIds: string[];
  primaryMajorGroup: string;
  academic: Record<string, AcademicLevel>;
  hasUtbkScore: boolean;
  utbkScore: string;
  studyDays: string;
  studyDuration: string;
  studyTime: string;
  reminders: string[];
  completedAt: string;
};

export const onboardingStorageKey = storageKeys.onboardingProfile;

export const defaultAcademic: Record<string, AcademicLevel> = {
  "Matematika Dasar": "sedang",
  "Bahasa Indonesia": "sedang",
  "Bahasa Inggris": "sedang",
  "Penalaran Umum": "sedang",
  "TKA/Rumpun Prodi": "sedang",
};

export function buildStudyRecommendation(profile: OnboardingProfile) {
  const weakSubjects = Object.entries(profile.academic)
    .filter(([, level]) => level === "lemah")
    .map(([subject]) => subject);

  const focusSubjects = weakSubjects.length > 0 ? weakSubjects : ["Penalaran Umum", "Matematika Dasar"];
  const intensity = getIntensity(profile.studyDays, profile.studyDuration);

  return {
    focusSubjects: focusSubjects.slice(0, 3),
    intensity,
    firstTryout: profile.primaryMajorGroup.includes("Teknik") ? "Paket UM Mandiri PTN - Set 1" : "Paket UM Mandiri PTN - Set 1",
    weeklyPlan: [
      `2 sesi latihan ${focusSubjects[0] ?? "Penalaran Umum"}`,
      "1 simulasi CBT penuh",
      "1 sesi review pembahasan dan catatan salah",
    ],
  };
}

function getIntensity(days: string, duration: string) {
  const dayNumber = Number(days);
  const durationNumber = Number(duration);

  if (dayNumber >= 6 || durationNumber >= 3) return "Intensif";
  if (dayNumber >= 4 || durationNumber >= 2) return "Stabil";
  return "Ringan";
}
