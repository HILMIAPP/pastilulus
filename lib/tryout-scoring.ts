/**
 * Tryout Scoring Engine
 *
 * Classical (UM PTN)  : benar +4, salah −1, kosong 0
 * IRT 3-PL (UM-PTKIN) : MAP theta estimation per subtes menggunakan
 *                        tingkat soal (MUDAH/SEDANG/HOTS) sebagai proxy
 *                        parameter kesulitan, kemudian diskala ke 0–1000.
 */

import type { TryoutQuestion } from "@/lib/app-data";

export type Choice = "A" | "B" | "C" | "D" | "E";

export type BagianStat = {
  benar: number;
  salah: number;
  kosong: number;
  total: number;
  /** Skor IRT per sub-tes (skala 200–800). Hanya ada pada scoringType "irt". */
  irtScore?: number;
};

export type ScoreResult = {
  benar: number;
  salah: number;
  kosong: number;
  /** Skor total. Classical: benar*4−salah. IRT: skor konversi theta, skala 0–1000. */
  skor: number;
  total: number;
  bagianStats: Record<string, BagianStat>;
  scoringType: "classical" | "irt";
};

// ─── Classical scoring ────────────────────────────────────────────────────────

export function computeClassicalScore(
  soalList: TryoutQuestion[],
  answers: Record<string, Choice | null>,
): ScoreResult {
  let benar = 0;
  let salah = 0;
  let kosong = 0;
  const bagianStats: Record<string, BagianStat> = {};

  for (const q of soalList) {
    const answer = answers[q.id];
    const isBenar = answer != null && answer === q.kunci;
    const isSalah = answer != null && answer !== q.kunci;

    if (isBenar) benar++;
    else if (isSalah) salah++;
    else kosong++;

    if (!bagianStats[q.bagian]) bagianStats[q.bagian] = { benar: 0, salah: 0, kosong: 0, total: 0 };
    const s = bagianStats[q.bagian];
    s.total++;
    if (isBenar) s.benar++;
    else if (isSalah) s.salah++;
    else s.kosong++;
  }

  return {
    benar,
    salah,
    kosong,
    skor: benar * 4 - salah,
    total: soalList.length,
    bagianStats,
    scoringType: "classical",
  };
}

// ─── IRT 3-PL scoring ─────────────────────────────────────────────────────────
//
// Model 3 parameter logistik:
//   P(u=1|θ) = c + (1−c) / (1 + exp(−a·(θ−b)))
//
// Parameter item (uniform di semua soal):
//   a = 1.0 (diskriminasi)
//   c = 0.20 (peluang tebak, 1/5 pilihan)
//   b = difficulty berdasarkan tingkat:
//       MUDAH → −1.5 | SEDANG → 0.0 | HOTS → +1.5
//
// Estimasi θ: Newton–Raphson MAP dengan prior N(0,1) per sub-tes.
// Konversi: θ ∈ [−4.5, 4.5] → sub-skor 200–800 → skor gabungan 0–1000.

const DIFFICULTY: Record<string, number> = { MUDAH: -1.5, SEDANG: 0.0, HOTS: 1.5 };
const DISC = 1.0;
const GUESS = 0.2;

function icc(theta: number, b: number): number {
  return GUESS + (1 - GUESS) / (1 + Math.exp(-DISC * (theta - b)));
}

/**
 * MAP theta estimation via Newton–Raphson.
 * Menerima array respon {correct, tingkat} untuk satu sub-tes.
 */
function estimateTheta(responses: Array<{ correct: boolean; tingkat: string }>): number {
  let theta = 0.0;

  for (let iter = 0; iter < 60; iter++) {
    // Prior N(0,1): grad_prior = −θ, info_prior = 1
    let grad = -theta;
    let info = 1.0;

    for (const { correct, tingkat } of responses) {
      const b = DIFFICULTY[tingkat] ?? 0;
      const psi = 1 / (1 + Math.exp(-DISC * (theta - b)));
      const P = icc(theta, b);
      const Q = 1 - P;
      // dP/dθ = a·(1−c)·ψ·(1−ψ)
      const dP = DISC * (1 - GUESS) * psi * (1 - psi);
      const safePQ = Math.max(P * Q, 1e-10);

      // Skor: (u − P)·dP / (P·Q)
      grad += ((correct ? 1 : 0) - P) * dP / safePQ;
      // Informasi Fisher: (dP)² / (P·Q)
      info += dP * dP / safePQ;
    }

    const delta = grad / info; // Newton step menuju maksimum
    theta = Math.max(-4.5, Math.min(4.5, theta + delta));
    if (Math.abs(delta) < 1e-6) break;
  }

  return theta;
}

/** θ ∈ [−4.5, 4.5] → sub-skor ∈ [200, 800] */
function thetaToSubScore(theta: number): number {
  return Math.round(500 + theta * (300 / 4.5));
}

export function computeIrtScore(
  soalList: TryoutQuestion[],
  answers: Record<string, Choice | null>,
): ScoreResult {
  let benar = 0;
  let salah = 0;
  let kosong = 0;
  const bagianStats: Record<string, BagianStat> = {};
  const bagianResponses: Record<string, Array<{ correct: boolean; tingkat: string }>> = {};

  for (const q of soalList) {
    const answer = answers[q.id];
    const isBenar = answer != null && answer === q.kunci;
    const isSalah = answer != null && answer !== q.kunci;

    if (isBenar) benar++;
    else if (isSalah) salah++;
    else kosong++;

    if (!bagianStats[q.bagian]) bagianStats[q.bagian] = { benar: 0, salah: 0, kosong: 0, total: 0 };
    const s = bagianStats[q.bagian];
    s.total++;
    if (isBenar) s.benar++;
    else if (isSalah) s.salah++;
    else s.kosong++;

    if (!bagianResponses[q.bagian]) bagianResponses[q.bagian] = [];
    bagianResponses[q.bagian].push({ correct: isBenar, tingkat: q.tingkat });
  }

  // Estimasi θ dan sub-skor per bagian
  let totalSubScore = 0;
  const bagianList = Object.keys(bagianResponses);

  for (const bagian of bagianList) {
    const theta = estimateTheta(bagianResponses[bagian]);
    const subScore = thetaToSubScore(theta);
    bagianStats[bagian].irtScore = subScore;
    totalSubScore += subScore;
  }

  // Skor gabungan: rata-rata sub-skor → konversi ke 0–1000
  const meanSub = bagianList.length > 0 ? totalSubScore / bagianList.length : 500;
  // meanSub ∈ [200, 800] → skor ∈ [0, 1000]
  const skor = Math.max(0, Math.min(1000, Math.round(((meanSub - 200) / 600) * 1000)));

  return {
    benar,
    salah,
    kosong,
    skor,
    total: soalList.length,
    bagianStats,
    scoringType: "irt",
  };
}

// ─── Dispatcher ───────────────────────────────────────────────────────────────

export function computeScore(
  soalList: TryoutQuestion[],
  answers: Record<string, Choice | null>,
  scoringType: "classical" | "irt",
): ScoreResult {
  return scoringType === "irt"
    ? computeIrtScore(soalList, answers)
    : computeClassicalScore(soalList, answers);
}

// ─── Attempt tracking helpers ─────────────────────────────────────────────────

export const MAX_ATTEMPTS = 5;

export function readAttempts(storageKey: string, paketId: string): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = window.localStorage.getItem(storageKey);
    const data = raw ? (JSON.parse(raw) as Record<string, number>) : {};
    return data[paketId] ?? 0;
  } catch {
    return 0;
  }
}

export function incrementAttempts(storageKey: string, paketId: string): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = window.localStorage.getItem(storageKey);
    const data = raw ? (JSON.parse(raw) as Record<string, number>) : {};
    const next = (data[paketId] ?? 0) + 1;
    data[paketId] = next;
    window.localStorage.setItem(storageKey, JSON.stringify(data));
    return next;
  } catch {
    return 0;
  }
}
