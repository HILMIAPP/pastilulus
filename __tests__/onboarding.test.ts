import { describe, it, expect } from "vitest";
import {
  buildStudyRecommendation,
  defaultAcademic,
  type OnboardingProfile,
} from "@/lib/onboarding";

// ── Helper ──────────────────────────────────────────────────────────────
function makeProfile(overrides: Partial<OnboardingProfile> = {}): OnboardingProfile {
  return {
    nickname: "Budi",
    status: "Siswa SMA",
    city: "Jakarta",
    schoolTrack: "IPA",
    targetPtnIds: ["ui", "itb"],
    primaryMajorGroup: "Sains",
    academic: { ...defaultAcademic },
    hasUtbkScore: false,
    utbkScore: "",
    studyDays: "4",
    studyDuration: "2",
    studyTime: "malam",
    reminders: ["pagi"],
    completedAt: "2026-05-25",
    ...overrides,
  };
}

describe("Onboarding Utils", () => {
  describe("buildStudyRecommendation", () => {
    it("should focus on weak subjects when academic has lemah entries", () => {
      const profile = makeProfile({
        academic: {
          "Matematika Dasar": "lemah",
          "Bahasa Indonesia": "lemah",
          "Bahasa Inggris": "sedang",
          "Penalaran Umum": "kuat",
          "TKA/Rumpun Prodi": "sedang",
        },
      });

      const result = buildStudyRecommendation(profile);

      expect(result.focusSubjects).toContain("Matematika Dasar");
      expect(result.focusSubjects).toContain("Bahasa Indonesia");
      // Max 3 subjects returned
      expect(result.focusSubjects.length).toBeLessThanOrEqual(3);
    });

    it("should default to Penalaran Umum & Matematika Dasar when no weak subjects", () => {
      const profile = makeProfile({
        academic: {
          "Matematika Dasar": "kuat",
          "Bahasa Indonesia": "kuat",
          "Bahasa Inggris": "kuat",
          "Penalaran Umum": "kuat",
          "TKA/Rumpun Prodi": "kuat",
        },
      });

      const result = buildStudyRecommendation(profile);

      expect(result.focusSubjects).toContain("Penalaran Umum");
      expect(result.focusSubjects).toContain("Matematika Dasar");
    });

    it("should return a weekly plan with at least 3 entries", () => {
      const result = buildStudyRecommendation(makeProfile());
      expect(result.weeklyPlan.length).toBeGreaterThanOrEqual(3);
    });

    it("should include the first tryout recommendation as a string", () => {
      const result = buildStudyRecommendation(makeProfile());
      expect(result.firstTryout).toBeTypeOf("string");
      expect(result.firstTryout.length).toBeGreaterThan(0);
    });

    it("should cap focusSubjects at 3 even if there are more than 3 weak subjects", () => {
      const profile = makeProfile({
        academic: {
          "Matematika Dasar": "lemah",
          "Bahasa Indonesia": "lemah",
          "Bahasa Inggris": "lemah",
          "Penalaran Umum": "lemah",
          "TKA/Rumpun Prodi": "lemah",
        },
      });

      const result = buildStudyRecommendation(profile);
      expect(result.focusSubjects.length).toBeLessThanOrEqual(3);
    });
  });

  describe("getIntensity (via buildStudyRecommendation)", () => {
    it("should return 'Intensif' when studyDays >= 6", () => {
      const result = buildStudyRecommendation(makeProfile({ studyDays: "6", studyDuration: "1" }));
      expect(result.intensity).toBe("Intensif");
    });

    it("should return 'Intensif' when studyDuration >= 3", () => {
      const result = buildStudyRecommendation(makeProfile({ studyDays: "2", studyDuration: "3" }));
      expect(result.intensity).toBe("Intensif");
    });

    it("should return 'Stabil' when studyDays is 4 or 5 and duration < 3", () => {
      const result4 = buildStudyRecommendation(makeProfile({ studyDays: "4", studyDuration: "1" }));
      expect(result4.intensity).toBe("Stabil");

      const result5 = buildStudyRecommendation(makeProfile({ studyDays: "5", studyDuration: "1" }));
      expect(result5.intensity).toBe("Stabil");
    });

    it("should return 'Stabil' when studyDuration is 2 and days < 6", () => {
      const result = buildStudyRecommendation(makeProfile({ studyDays: "3", studyDuration: "2" }));
      expect(result.intensity).toBe("Stabil");
    });

    it("should return 'Ringan' when studyDays < 4 and studyDuration < 2", () => {
      const result = buildStudyRecommendation(makeProfile({ studyDays: "2", studyDuration: "1" }));
      expect(result.intensity).toBe("Ringan");
    });

    it("should return 'Ringan' when studyDays and studyDuration are both 0 or empty", () => {
      const result = buildStudyRecommendation(makeProfile({ studyDays: "0", studyDuration: "0" }));
      expect(result.intensity).toBe("Ringan");
    });
  });

  describe("defaultAcademic", () => {
    it("should have all 5 subjects defaulting to 'sedang'", () => {
      const subjects = Object.keys(defaultAcademic);
      expect(subjects).toHaveLength(5);

      for (const [, level] of Object.entries(defaultAcademic)) {
        expect(level).toBe("sedang");
      }
    });

    it("should include the standard UM subject names", () => {
      expect(defaultAcademic).toHaveProperty("Matematika Dasar");
      expect(defaultAcademic).toHaveProperty("Bahasa Indonesia");
      expect(defaultAcademic).toHaveProperty("Bahasa Inggris");
      expect(defaultAcademic).toHaveProperty("Penalaran Umum");
      expect(defaultAcademic).toHaveProperty("TKA/Rumpun Prodi");
    });
  });
});
