import { soalUmPaket1, soalUmPaket2 } from "@/lib/um-question-bank";
import { soalUm10PtnPaket } from "@/lib/um-question-bank-10-ptn";
import { soalUmptkinPaket1, soalUmptkinPaket2, soalUmptkinPaket3, soalUmptkinPaket4, soalUmptkinPaket5 } from "@/lib/umptkin-question-bank";
import { PASTI_LULUS_ITEMS } from "@/lib/pasti-lulus-data";
import { pastiLulusQuestionCounts, soalPastiLulusPaketById } from "@/lib/pasti-lulus-question-bank";

/** Konten try out hasil impor dari folder SOAL UM. */

export type TryoutPaket = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  soalCount: number;
  durasiMenit: number;
  pola: string;
  akses: "gratis" | "belajar_pro";
  /** Teks deskripsi sistem penilaian untuk ditampilkan ke siswa. */
  scoring: string;
  /**
   * "classical" — benar +4, salah −1, kosong 0  (UM Mandiri PTN)
   * "irt"       — penilaian IRT 3-PL per sub-tes, skala 0–1000 (UM-PTKIN)
  */
  scoringType: "classical" | "irt";
  /** Paket dengan gate token PASTI LULUS, bukan gate tier langganan. */
  requiresPastiLulusToken?: boolean;
  /** Path logo institusi di /public (opsional). Ditampilkan di kartu paket. */
  logoUrl?: string;
};

const CLASSICAL_SCORING = "Benar +4, kosong 0, salah -1";
const IRT_SCORING = "Penilaian IRT per sub-tes — skor kemampuan skala 0–1000, tanpa penalti kosong";

const kampusTryoutPaket: TryoutPaket[] = [
  {
    id: "simak-ui-100",
    slug: "simak-ui-100",
    title: "SIMAK UI - Full 100 Soal",
    subtitle: "Paket spesifik Universitas Indonesia: TPS, Matdas, dan TKA campuran",
    soalCount: 100,
    durasiMenit: 120,
    pola: "Karakter SIMAK UI: penalaran kritis, literasi akademik panjang, dan matematika konseptual.",
    akses: "belajar_pro",
    scoring: CLASSICAL_SCORING,
    scoringType: "classical",
    logoUrl: "/assets/univ/logo-ui.svg",
  },
  {
    id: "um-ugm-100",
    slug: "um-ugm-100",
    title: "CBT UM UGM - Full 100 Soal",
    subtitle: "Latihan kampus UGM dengan pola TPS + TKA dan pembahasan lengkap",
    soalCount: 100,
    durasiMenit: 120,
    pola: "Karakter UM UGM CBT: hitungan cepat, literasi, dan konsep lintas bidang.",
    akses: "belajar_pro",
    scoring: CLASSICAL_SCORING,
    scoringType: "classical",
    logoUrl: "/assets/univ/logo-ugm.svg",
  },
  {
    id: "sm-itb-100",
    slug: "sm-itb-100",
    title: "SM ITB - Full 100 Soal",
    subtitle: "Paket seleksi mandiri ITB untuk penalaran, matematika, dan saintek",
    soalCount: 100,
    durasiMenit: 120,
    pola: "Karakter SM ITB: logika, kuantitatif, dan problem solving bertahap.",
    akses: "belajar_pro",
    scoring: CLASSICAL_SCORING,
    scoringType: "classical",
    logoUrl: "/assets/univ/logo-itb.svg",
  },
  {
    id: "smua-unair-100",
    slug: "smua-unair-100",
    title: "SMUA UNAIR - Full 100 Soal",
    subtitle: "Paket mandiri UNAIR dengan kombinasi TPS, literasi, dan TKA",
    soalCount: 100,
    durasiMenit: 120,
    pola: "Karakter UNAIR: pemahaman bacaan, sains dasar, dan penalaran kontekstual.",
    akses: "belajar_pro",
    scoring: CLASSICAL_SCORING,
    scoringType: "classical",
    logoUrl: "/assets/univ/logo-unair.svg",
  },
  {
    id: "utm-ipb-100",
    slug: "utm-ipb-100",
    title: "UTM IPB - Full 100 Soal",
    subtitle: "Paket mandiri IPB untuk TPS, matematika dasar, dan TKA terpadu",
    soalCount: 100,
    durasiMenit: 120,
    pola: "Karakter IPB: data, biologi, kuantitatif, dan penalaran aplikatif.",
    akses: "belajar_pro",
    scoring: CLASSICAL_SCORING,
    scoringType: "classical",
    logoUrl: "/assets/univ/logo-ipb.svg",
  },
  {
    id: "sm-its-100",
    slug: "sm-its-100",
    title: "SM ITS - Full 100 Soal",
    subtitle: "Paket mandiri ITS dengan fokus saintek, matematika, dan logika",
    soalCount: 100,
    durasiMenit: 120,
    pola: "Karakter ITS: matematika, fisika terapan, dan problem solving teknik.",
    akses: "belajar_pro",
    scoring: CLASSICAL_SCORING,
    scoringType: "classical",
    logoUrl: "/assets/univ/logo-its.svg",
  },
  {
    id: "smup-unpad-100",
    slug: "smup-unpad-100",
    title: "SMUP UNPAD - Full 100 Soal",
    subtitle: "Paket mandiri UNPAD untuk latihan lintas prodi dan pembahasan lengkap",
    soalCount: 100,
    durasiMenit: 120,
    pola: "Karakter UNPAD: literasi, penalaran umum, dan TKA kontekstual.",
    akses: "belajar_pro",
    scoring: CLASSICAL_SCORING,
    scoringType: "classical",
    logoUrl: "/assets/univ/logo-unpad.svg",
  },
  {
    id: "um-undip-100",
    slug: "um-undip-100",
    title: "UM UNDIP - Full 100 Soal",
    subtitle: "Paket mandiri UNDIP berbasis TPS, literasi, dan TKA campuran",
    soalCount: 100,
    durasiMenit: 120,
    pola: "Karakter UNDIP: ketelitian bacaan, konsep dasar, dan waktu pengerjaan ketat.",
    akses: "belajar_pro",
    scoring: CLASSICAL_SCORING,
    scoringType: "classical",
    logoUrl: "/assets/univ/logo-undip.svg",
  },
  {
    id: "smub-ub-100",
    slug: "smub-ub-100",
    title: "SMUB UB - Full 100 Soal",
    subtitle: "Paket mandiri Universitas Brawijaya dengan 100 soal dan pembahasan",
    soalCount: 100,
    durasiMenit: 120,
    pola: "Karakter UB: TPS, literasi, TKA, dan soal campuran berbasis konteks.",
    akses: "belajar_pro",
    scoring: CLASSICAL_SCORING,
    scoringType: "classical",
    logoUrl: "/assets/univ/logo-ub.svg",
  },
  {
    id: "mandiri-unhas-100",
    slug: "mandiri-unhas-100",
    title: "Mandiri UNHAS - Full 100 Soal",
    subtitle: "Paket mandiri UNHAS untuk persiapan komprehensif lintas subtes",
    soalCount: 100,
    durasiMenit: 120,
    pola: "Karakter UNHAS: penalaran, literasi, dan TKA dasar untuk berbagai rumpun.",
    akses: "belajar_pro",
    scoring: CLASSICAL_SCORING,
    scoringType: "classical",
    logoUrl: "/assets/univ/logo-unhas.svg",
  },
];

export const tryoutPaket: TryoutPaket[] = [
  {
    id: "paket-1",
    slug: "paket-1",
    title: "Paket UM Mandiri PTN - Set 1",
    subtitle: "TPS + TKA - kompilasi pola ujian mandiri PTN 2023-2025",
    soalCount: 120,
    durasiMenit: 150,
    pola: "SIMAK UI, SM-ITB, UTUL UGM, SMUP UNPAD, dan kampus lain.",
    akses: "gratis",
    scoring: CLASSICAL_SCORING,
    scoringType: "classical",
    logoUrl: "/assets/univ/logo-multi-ptn.svg",
  },
  {
    id: "paket-2",
    slug: "paket-2",
    title: "Paket UM Mandiri PTN - Set 2",
    subtitle: "Paket Ultra 2 dengan distribusi soal baru dan variasi HOTS lebih tinggi",
    soalCount: 120,
    durasiMenit: 150,
    pola: "Multi-kampus sesuai folder SOAL UM.",
    akses: "belajar_pro",
    scoring: CLASSICAL_SCORING,
    scoringType: "classical",
    logoUrl: "/assets/univ/logo-multi-ptn.svg",
  },
  ...kampusTryoutPaket,
];

export const tryoutPastiLulusPaket: TryoutPaket[] = PASTI_LULUS_ITEMS.map((item) => ({
  id: `pasti-lulus-${item.nomor}`,
  slug: `pasti-lulus-${item.nomor}`,
  title: `${item.universitas} - ${item.jurusan}`,
  subtitle: "Tryout CBT PASTI LULUS 1 dari naskah PDF",
  soalCount: pastiLulusQuestionCounts[`pasti-lulus-${item.nomor}` as keyof typeof pastiLulusQuestionCounts] ?? 0,
  durasiMenit: 120,
  pola: "Simulasi CBT spesifik universitas dan jurusan pilihan.",
  akses: "gratis",
  scoring: CLASSICAL_SCORING,
  scoringType: "classical",
  requiresPastiLulusToken: true,
  logoUrl: "/assets/univ/logo-multi-ptn.svg",
}));

export type TryoutQuestion = {
  id: string;
  nomor: number;
  bagian: string;
  tingkat: "MUDAH" | "SEDANG" | "HOTS";
  pertanyaan: string;
  opsi: Record<"A" | "B" | "C" | "D" | "E", string>;
  kunci: "A" | "B" | "C" | "D" | "E";
  pembahasan: string;
};

export const soalPaket1: TryoutQuestion[] = soalUmPaket1;
export const soalPaket2: TryoutQuestion[] = soalUmPaket2;

export const soalPaketById: Record<string, TryoutQuestion[]> = {
  "paket-1": soalPaket1,
  "paket-2": soalPaket2,
  ...soalUm10PtnPaket,
  "umptkin-1": soalUmptkinPaket1,
  "umptkin-2": soalUmptkinPaket2,
  "umptkin-3": soalUmptkinPaket3,
  "umptkin-4": soalUmptkinPaket4,
  "umptkin-5": soalUmptkinPaket5,
  ...soalPastiLulusPaketById,
};

export const tryoutUmptkinPaket: TryoutPaket[] = [
  {
    id: "umptkin-1",
    slug: "umptkin-1",
    title: "UM PTKIN HOTS 2026 — Paket 1",
    subtitle: "121 soal HOTS: Penalaran Akademik, Matematika, Literasi, Agama Islam",
    soalCount: 121,
    durasiMenit: 120,
    pola: "Komposisi resmi UM-PTKIN: Sub Tes 1–5 dengan bobot HOTS tinggi.",
    akses: "gratis",
    scoring: IRT_SCORING,
    scoringType: "irt",
    logoUrl: "/assets/univ/logo-kemenag.svg",
  },
  {
    id: "umptkin-2",
    slug: "umptkin-2",
    title: "UM PTKIN HOTS 2026 — Paket 2",
    subtitle: "121 soal HOTS variasi 2 — distribusi subtes sesuai blueprint UM-PTKIN",
    soalCount: 121,
    durasiMenit: 120,
    pola: "Penekanan pada Literasi Bahasa Indonesia dan Penalaran Akademik.",
    akses: "belajar_pro",
    scoring: IRT_SCORING,
    scoringType: "irt",
    logoUrl: "/assets/univ/logo-kemenag.svg",
  },
  {
    id: "umptkin-3",
    slug: "umptkin-3",
    title: "UM PTKIN HOTS 2026 — Paket 3",
    subtitle: "121 soal HOTS variasi 3 — penguatan Penalaran Matematika & Agama",
    soalCount: 121,
    durasiMenit: 120,
    pola: "Fokus Penalaran Matematika dan Pengetahuan Agama Islam tingkat lanjut.",
    akses: "belajar_pro",
    scoring: IRT_SCORING,
    scoringType: "irt",
    logoUrl: "/assets/univ/logo-kemenag.svg",
  },
  {
    id: "umptkin-4",
    slug: "umptkin-4",
    title: "UM PTKIN HOTS 2026 — Paket 4",
    subtitle: "121 soal HOTS variasi 4 — gabungan subtes dengan intensitas tinggi",
    soalCount: 121,
    durasiMenit: 120,
    pola: "Semua subtes dengan variasi soal kontekstual dan analitis.",
    akses: "belajar_pro",
    scoring: IRT_SCORING,
    scoringType: "irt",
    logoUrl: "/assets/univ/logo-kemenag.svg",
  },
  {
    id: "umptkin-5",
    slug: "umptkin-5",
    title: "UM PTKIN HOTS 2026 — Paket 5",
    subtitle: "121 soal HOTS variasi 5 — simulasi paling komprehensif",
    soalCount: 121,
    durasiMenit: 120,
    pola: "Paket final: distribusi subtes merata dengan soal HOTS paling menantang.",
    akses: "belajar_pro",
    scoring: IRT_SCORING,
    scoringType: "irt",
    logoUrl: "/assets/univ/logo-kemenag.svg",
  },
];
