export type LearningModule = {
  id: string;
  slug: string;
  subject: string;
  title: string;
  type: "masterbook" | "rangkuman" | "latihan" | "tracker";
  duration: number;
  xpReward: number;
  color: string;
  image: string;
  description: string;
  outcomes: string[];
  pages: string;
  recommendedFor: string[];
};

export const learningResources = {
  masterPdf: "/materi/buku-master-materi-um-ptn-2026.pdf",
  masterDocx: "/materi/buku-master-materi-um-ptn-2026.docx",
  logbookPdf: "/materi/logbook-rangkuman-um-ptn-2026.pdf",
  logbookDocx: "/materi/logbook-rangkuman-um-ptn-2026.docx",
};

export const learningModules: LearningModule[] = [
  {
    id: "roadmap-30-hari",
    slug: "roadmap-30-hari",
    subject: "Strategi Belajar",
    title: "Roadmap Belajar 30 Hari",
    type: "tracker",
    duration: 20,
    xpReward: 40,
    color: "bg-blue-600",
    image: "/materi/images/timeline_sejarah.png",
    description:
      "Panduan urutan belajar dari diagnostic test, penguatan TPS, literasi, matematika, TKA, sampai simulasi kampus.",
    outcomes: ["Punya peta belajar 30 hari", "Tahu urutan materi prioritas", "Siap masuk ke tryout terjadwal"],
    pages: "Buku Master: Cara Pakai + Roadmap 30 Hari",
    recommendedFor: ["User baru", "Gap year", "Belajar mepet deadline"],
  },
  {
    id: "tps-penalaran",
    slug: "tps-penalaran",
    subject: "TPS",
    title: "Penalaran Umum, Argumen, dan Silogisme",
    type: "masterbook",
    duration: 35,
    xpReward: 80,
    color: "bg-indigo-600",
    image: "/materi/images/diagram_venn.png",
    description:
      "Materi pola argumen, hubungan logis, diagram Venn, premis-kesimpulan, dan jebakan penalaran yang sering muncul di UM PTN.",
    outcomes: ["Membaca premis lebih rapi", "Menghindari kesimpulan palsu", "Mengerjakan soal logika lebih cepat"],
    pages: "Buku Master: TPS Penalaran Umum",
    recommendedFor: ["SIMAK UI", "UM UGM", "SMITS", "UM UNDIP"],
  },
  {
    id: "literasi-indonesia",
    slug: "literasi-indonesia",
    subject: "Literasi",
    title: "Literasi Bahasa Indonesia",
    type: "rangkuman",
    duration: 30,
    xpReward: 70,
    color: "bg-emerald-600",
    image: "/materi/images/struktur_paragraf.png",
    description:
      "Strategi menemukan gagasan utama, inferensi, sikap penulis, struktur teks, dan jawaban berbasis bukti paragraf.",
    outcomes: ["Lebih cepat membaca teks panjang", "Membedakan ide pokok dan detail", "Menjawab inferensi berbasis bukti"],
    pages: "Master + Logbook: Literasi Bahasa Indonesia",
    recommendedFor: ["Semua jalur mandiri", "Soshum", "Campuran"],
  },
  {
    id: "english-literacy",
    slug: "english-literacy",
    subject: "English",
    title: "English Literacy & Grammar",
    type: "rangkuman",
    duration: 30,
    xpReward: 70,
    color: "bg-sky-600",
    image: "/materi/images/alur_argumen.png",
    description:
      "Rangkuman reading comprehension, grammar kunci, relative clause, inference, dan strategi menjawab teks bahasa Inggris.",
    outcomes: ["Memahami main idea", "Mengerjakan grammar pilihan ganda", "Membaca teks akademik lebih efisien"],
    pages: "Buku Master: English Literacy & Grammar",
    recommendedFor: ["SIMAK UI", "SMUP", "UNAIR", "UPNVJ"],
  },
  {
    id: "matematika-dasar",
    slug: "matematika-dasar",
    subject: "Matematika",
    title: "Matematika Dasar UM PTN",
    type: "masterbook",
    duration: 45,
    xpReward: 100,
    color: "bg-violet-600",
    image: "/materi/images/grafik_fungsi_kuadrat.png",
    description:
      "Aljabar, fungsi, peluang, statistik, geometri, trigonometri dasar, dan strategi memilih cara cepat saat CBT.",
    outcomes: ["Menguasai rumus prioritas", "Mendeteksi tipe soal cepat", "Membangun bank rumus pribadi"],
    pages: "Buku Master: Matematika Dasar + Bank Rumus",
    recommendedFor: ["Semua peserta", "Teknik/Komputer", "Ekonomi/Bisnis"],
  },
  {
    id: "matematika-ipa",
    slug: "matematika-ipa",
    subject: "TKA Saintek",
    title: "Matematika IPA & Trigonometri",
    type: "masterbook",
    duration: 45,
    xpReward: 110,
    color: "bg-fuchsia-600",
    image: "/materi/images/lingkaran_trigonometri.png",
    description:
      "Penguatan fungsi, limit dasar, trigonometri, matriks, geometri analitik, dan pola soal saintek jalur mandiri.",
    outcomes: ["Siap soal kuantitatif saintek", "Mengenali pola substitusi rumus", "Mengurangi kesalahan hitung"],
    pages: "Buku Master: Matematika IPA",
    recommendedFor: ["ITB", "ITS", "Kedokteran/Kesehatan", "Teknik"],
  },
  {
    id: "fisika",
    slug: "fisika",
    subject: "TKA Saintek",
    title: "Fisika: Mekanika, Listrik, dan Optik",
    type: "masterbook",
    duration: 40,
    xpReward: 95,
    color: "bg-cyan-700",
    image: "/materi/images/gerak_parabola.png",
    description:
      "Konsep inti mekanika, gerak parabola, rangkaian listrik, optik bayangan, dan cara menghubungkan rumus dengan konteks.",
    outcomes: ["Memilih rumus sesuai konteks", "Membaca grafik/fenomena", "Mengerjakan soal hitungan bertahap"],
    pages: "Buku Master: Fisika",
    recommendedFor: ["Saintek", "Teknik", "Kedokteran"],
  },
  {
    id: "kimia",
    slug: "kimia",
    subject: "TKA Saintek",
    title: "Kimia: Atom, Reaksi, dan Titrasi",
    type: "masterbook",
    duration: 40,
    xpReward: 95,
    color: "bg-orange-600",
    image: "/materi/images/struktur_atom.png",
    description:
      "Struktur atom, stoikiometri, reaksi, larutan, titrasi, dan pola hitungan kimia yang sering masuk ujian mandiri.",
    outcomes: ["Merapikan konsep mol", "Membaca kurva titrasi", "Menghindari jebakan satuan"],
    pages: "Buku Master: Kimia",
    recommendedFor: ["Kedokteran", "Farmasi", "Saintek"],
  },
  {
    id: "biologi",
    slug: "biologi",
    subject: "TKA Saintek",
    title: "Biologi: Sel, DNA, dan Ekologi",
    type: "masterbook",
    duration: 40,
    xpReward: 95,
    color: "bg-green-700",
    image: "/materi/images/struktur_sel.png",
    description:
      "Struktur sel, DNA, metabolisme, ekologi, rantai makanan, dan cara membaca konsep biologi secara aplikatif.",
    outcomes: ["Menghubungkan konsep antar bab", "Membaca diagram biologi", "Siap soal analisis fenomena"],
    pages: "Buku Master: Biologi",
    recommendedFor: ["Kedokteran", "Biologi", "Saintek"],
  },
  {
    id: "soshum-terpadu",
    slug: "soshum-terpadu",
    subject: "TKA Soshum",
    title: "Ekonomi, Geografi, Sosiologi, Sejarah",
    type: "masterbook",
    duration: 55,
    xpReward: 120,
    color: "bg-rose-600",
    image: "/materi/images/kurva_supply_demand.png",
    description:
      "Paket TKA soshum terpadu: ekonomi, geografi, sosiologi, sejarah, grafik, data sosial, dan penalaran fenomena.",
    outcomes: ["Menganalisis data sosial", "Membaca kurva ekonomi", "Membuat kesimpulan kritis dari fenomena"],
    pages: "Buku Master: Ekonomi, Geografi, Sosiologi, Sejarah",
    recommendedFor: ["Soshum", "Ekonomi/Bisnis", "Hukum", "Komunikasi"],
  },
  {
    id: "latihan-terpadu",
    slug: "latihan-terpadu",
    subject: "Latihan",
    title: "Latihan Soal Terpadu + Pembahasan",
    type: "latihan",
    duration: 60,
    xpReward: 140,
    color: "bg-slate-800",
    image: "/materi/images/matriks_determinan.png",
    description:
      "Latihan campuran untuk mengunci pemahaman sebelum masuk tryout CBT. Cocok dipakai setelah menyelesaikan modul konsep.",
    outcomes: ["Mengukur penguasaan bab", "Mencatat pola salah", "Menentukan materi remedial"],
    pages: "Buku Master: Latihan Soal Terpadu + Kunci",
    recommendedFor: ["Sebelum tryout", "Review mingguan", "Remedial"],
  },
  {
    id: "logbook-error-log",
    slug: "logbook-error-log",
    subject: "Tracker",
    title: "Logbook, Error Log, dan Tracker Progres",
    type: "tracker",
    duration: 25,
    xpReward: 60,
    color: "bg-amber-600",
    image: "/materi/images/siklus_air.png",
    description:
      "Template log harian, tracker belajar, error log, dan remedial agar siswa tahu pola salahnya sendiri.",
    outcomes: ["Mencatat durasi belajar", "Mengelompokkan jenis kesalahan", "Membuat remedial lebih tepat"],
    pages: "Logbook Rangkuman: Tracker Belajar Harian + Error Log",
    recommendedFor: ["Semua siswa", "Belajar mandiri", "Monitoring orang tua"],
  },
];

export function getLearningModule(slug: string) {
  return learningModules.find((module) => module.slug === slug);
}
