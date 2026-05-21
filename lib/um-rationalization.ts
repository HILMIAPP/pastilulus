export type ExamScoreSummary = {
  benar: number;
  salah: number;
  kosong: number;
  total: number;
};

export type RationalizationTarget = {
  id: string;
  kampus: string;
  jalur: string;
  benchmark: number;
  competitiveness: "Sangat ketat" | "Ketat" | "Menengah";
};

export const rationalizationTargets: RationalizationTarget[] = [
  { id: "ui", kampus: "Universitas Indonesia", jalur: "SIMAK UI", benchmark: 740, competitiveness: "Sangat ketat" },
  { id: "itb", kampus: "Institut Teknologi Bandung", jalur: "SSU ITB", benchmark: 730, competitiveness: "Sangat ketat" },
  { id: "ugm", kampus: "Universitas Gadjah Mada", jalur: "UM UGM CBT", benchmark: 710, competitiveness: "Sangat ketat" },
  { id: "unpad", kampus: "Universitas Padjadjaran", jalur: "SMUP UNPAD", benchmark: 685, competitiveness: "Ketat" },
  { id: "its", kampus: "Institut Teknologi Sepuluh Nopember", jalur: "SMITS", benchmark: 675, competitiveness: "Ketat" },
  { id: "undip", kampus: "Universitas Diponegoro", jalur: "UM UNDIP", benchmark: 650, competitiveness: "Ketat" },
  { id: "ipb", kampus: "IPB University", jalur: "SM-IPB", benchmark: 640, competitiveness: "Ketat" },
  { id: "ub", kampus: "Universitas Brawijaya", jalur: "SMUB", benchmark: 625, competitiveness: "Menengah" },
];

export function calculateRationalization(summary: ExamScoreSummary) {
  const maxRawScore = summary.total * 4;
  const rawScore = summary.benar * 4 - summary.salah;
  const normalizedScore = maxRawScore > 0 ? Math.max(0, Math.round((rawScore / maxRawScore) * 1000)) : 0;
  const accuracy = summary.total > 0 ? Math.round((summary.benar / summary.total) * 100) : 0;
  const answeredRate = summary.total > 0 ? Math.round(((summary.benar + summary.salah) / summary.total) * 100) : 0;

  const targets = rationalizationTargets.map((target) => {
    const gap = normalizedScore - target.benchmark;
    const probability = getProbability(gap);

    return {
      ...target,
      gap,
      probability,
      status: getStatusLabel(gap),
      tone: getTone(gap),
    };
  });

  return {
    normalizedScore,
    accuracy,
    answeredRate,
    targets,
    summary: buildSummary(normalizedScore, accuracy, answeredRate),
    nextActions: buildNextActions(normalizedScore, summary.kosong, summary.salah),
  };
}

function getProbability(gap: number) {
  if (gap >= 80) return 86;
  if (gap >= 40) return 74;
  if (gap >= 0) return 61;
  if (gap >= -40) return 44;
  if (gap >= -90) return 27;
  return 15;
}

function getStatusLabel(gap: number) {
  if (gap >= 80) return "Aman";
  if (gap >= 0) return "Kompetitif";
  if (gap >= -60) return "Perlu dikejar";
  return "Berisiko";
}

function getTone(gap: number) {
  if (gap >= 80) return "emerald" as const;
  if (gap >= 0) return "blue" as const;
  if (gap >= -60) return "amber" as const;
  return "rose" as const;
}

function buildSummary(score: number, accuracy: number, answeredRate: number) {
  if (score >= 720) {
    return "Posisi kamu sudah kuat untuk jalur mandiri kompetitif. Pertahankan akurasi dan mulai fokus ke simulasi penuh durasi.";
  }

  if (score >= 620) {
    return "Kamu sudah masuk zona kompetitif, tapi masih perlu menaikkan konsistensi. Prioritaskan evaluasi soal salah dan materi bernilai tinggi.";
  }

  if (accuracy < 45 || answeredRate < 70) {
    return "Fondasi masih perlu dikuatkan. Fokus dulu ke akurasi, manajemen waktu, dan mengurangi soal kosong.";
  }

  return "Nilai masih bisa dikejar dengan strategi yang tepat. Pakai hasil ini untuk memilih kampus target utama dan cadangan secara realistis.";
}

function buildNextActions(score: number, empty: number, wrong: number) {
  const actions = [
    "Review semua soal salah dan tulis pola kesalahan yang paling sering muncul.",
    "Kerjakan satu simulasi penuh lagi setelah 2-3 sesi latihan materi lemah.",
    "Pilih maksimal 3 kampus target utama supaya latihan lebih fokus.",
  ];

  if (empty > 20) {
    actions.unshift("Latih manajemen waktu; jumlah soal kosong masih terlalu banyak untuk jalur mandiri kompetitif.");
  }

  if (wrong > 35) {
    actions.unshift("Turunkan tebakan impulsif; lebih baik kosong daripada salah jika benar-benar tidak yakin.");
  }

  if (score >= 700) {
    actions.unshift("Mulai latihan variasi HOTS dan soal kampus target yang paling ketat.");
  }

  return actions.slice(0, 4);
}
