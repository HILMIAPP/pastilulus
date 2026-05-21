import { describe, it, expect } from "vitest";
import { calculateRationalization, ExamScoreSummary } from "@/lib/um-rationalization";

describe("UM Rationalization Engine", () => {
  it("should calculate correct normalized score, accuracy, and filled rate for average exam result", () => {
    const summary: ExamScoreSummary = {
      benar: 80,
      salah: 20,
      kosong: 20,
      total: 120,
    };

    const result = calculateRationalization(summary);
    
    // maxRawScore = 120 * 4 = 480
    // rawScore = 80 * 4 - 20 = 300
    // normalizedScore = Math.round((300 / 480) * 1000) = 625
    expect(result.normalizedScore).toBe(625);
    
    // accuracy = (80 / 120) * 100 = 67%
    expect(result.accuracy).toBe(67);
    
    // answeredRate = ((80 + 20) / 120) * 100 = 83%
    expect(result.answeredRate).toBe(83);
    
    expect(result.targets).toHaveLength(8);
    expect(result.nextActions).toBeInstanceOf(Array);
    expect(result.summary).toBeTypeOf("string");
  });

  it("should handle perfect score correctly", () => {
    const summary: ExamScoreSummary = {
      benar: 100,
      salah: 0,
      kosong: 0,
      total: 100,
    };

    const result = calculateRationalization(summary);
    expect(result.normalizedScore).toBe(1000);
    expect(result.accuracy).toBe(100);
    expect(result.answeredRate).toBe(100);
    
    // Targets should have very high probability and "Aman" status
    const uiTarget = result.targets.find((t) => t.id === "ui");
    expect(uiTarget).toBeDefined();
    expect(uiTarget?.status).toBe("Aman");
    expect(uiTarget?.probability).toBe(86);
  });

  it("should handle zero scores and all wrong scores without negative normalizedScore", () => {
    const summary: ExamScoreSummary = {
      benar: 0,
      salah: 100,
      kosong: 0,
      total: 100,
    };

    const result = calculateRationalization(summary);
    // rawScore = -100, but normalizedScore should be capped at 0 (via Math.max(0, ...))
    expect(result.normalizedScore).toBe(0);
    expect(result.accuracy).toBe(0);
    expect(result.answeredRate).toBe(100);
  });

  it("should handle empty exam inputs safely", () => {
    const summary: ExamScoreSummary = {
      benar: 0,
      salah: 0,
      kosong: 0,
      total: 0,
    };

    const result = calculateRationalization(summary);
    expect(result.normalizedScore).toBe(0);
    expect(result.accuracy).toBe(0);
    expect(result.answeredRate).toBe(0);
  });

  it("should suggest specific actions based on wrong and empty counts", () => {
    // Too many wrong answers (wrong > 35)
    const summaryWithManyWrongs: ExamScoreSummary = {
      benar: 40,
      salah: 40,
      kosong: 20,
      total: 100,
    };
    
    const resultWrongs = calculateRationalization(summaryWithManyWrongs);
    expect(resultWrongs.nextActions).toContain("Turunkan tebakan impulsif; lebih baik kosong daripada salah jika benar-benar tidak yakin.");

    // Too many empty answers (empty > 20)
    const summaryWithManyEmpty: ExamScoreSummary = {
      benar: 40,
      salah: 10,
      kosong: 50,
      total: 100,
    };
    
    const resultEmpty = calculateRationalization(summaryWithManyEmpty);
    expect(resultEmpty.nextActions).toContain("Latih manajemen waktu; jumlah soal kosong masih terlalu banyak untuk jalur mandiri kompetitif.");
  });
});
