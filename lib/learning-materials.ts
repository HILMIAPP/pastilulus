export type MateriSeksi = {
  judul: string;
  deskripsi: string;
};

export type LearningModule = {
  id: string;
  slug: string;
  subject: string;
  title: string;
  type: "masterbook" | "rangkuman" | "latihan" | "tracker";
  jalur?: "um" | "umptkin";
  akses?: "gratis" | "belajar_pro";
  duration: number;
  xpReward: number;
  color: string;
  image: string;
  description: string;
  outcomes: string[];
  pages: string;
  recommendedFor: string[];
  docxUrl?: string;
  seksi?: MateriSeksi[];
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
    akses: "gratis",
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

export const umptkinModules: LearningModule[] = [
  {
    id: "umptkin-roadmap",
    slug: "umptkin-roadmap",
    subject: "Strategi Belajar",
    title: "Roadmap Bimbel UM-PTKIN A-Z",
    type: "tracker",
    jalur: "umptkin",
    akses: "gratis",
    duration: 25,
    xpReward: 50,
    color: "bg-emerald-700",
    image: "/materi/images/timeline_sejarah.png",
    description: "Panduan lengkap strategi belajar UM-PTKIN: mengenal karakter ujian, metode bimbel efektif, dan manajemen waktu simulasi dari nol hingga siap ujian.",
    outcomes: [
      "Memahami karakter dan sistem penilaian UM-PTKIN",
      "Menyusun jadwal belajar yang realistis dan terstruktur",
      "Menguasai siklus belajar: baca teori → latihan → evaluasi",
      "Mengelola waktu dan energi saat simulasi ujian",
    ],
    pages: "3 Bab — Roadmap Bimbel UM-PTKIN A-Z",
    recommendedFor: ["Peserta baru UM-PTKIN", "Gap year", "Belajar mandiri dari nol"],
    docxUrl: "/materi/umptkin/00_Roadmap_Bimbel_UM_PTKIN_A_Z.docx",
    seksi: [
      { judul: "Bab 1: Mengenal Karakter UM-PTKIN", deskripsi: "Cara membaca ujian sebagai sistem kemampuan, bukan sekadar kumpulan soal. Peserta perlu memahami bahwa nilai baik lahir dari kombinasi konsep, strategi, dan manajemen waktu." },
      { judul: "Bab 2: Metode Belajar Bimbel yang Efektif", deskripsi: "Bimbel yang baik bukan hanya memberi soal, tetapi mengatur siklus belajar. Peserta harus tahu kapan membaca teori, kapan latihan terarah, dan kapan simulasi penuh." },
      { judul: "Bab 3: Strategi Waktu dan Simulasi", deskripsi: "Ujian bukan hanya soal bisa atau tidak bisa. Peserta juga harus mengelola waktu, energi, dan urutan pengerjaan agar nilai total maksimal." },
    ],
  },
  {
    id: "umptkin-penalaran-akademik",
    slug: "umptkin-penalaran-akademik",
    subject: "Penalaran Akademik",
    title: "Penalaran Akademik HOTS UM-PTKIN",
    type: "masterbook",
    jalur: "umptkin",
    duration: 40,
    xpReward: 90,
    color: "bg-blue-700",
    image: "/materi/images/diagram_venn.png",
    description: "Materi lengkap penalaran akademik UM-PTKIN: logika pernyataan, silogisme, analogi, relasi kata, pola bilangan, dan membaca argumen untuk soal HOTS.",
    outcomes: [
      "Menyelesaikan soal silogisme dan logika formal dengan cepat",
      "Menemukan hubungan analogi yang paling presisi",
      "Melihat pola bilangan, huruf, dan gambar secara sistematis",
      "Mengidentifikasi klaim, asumsi, dan kelemahan argumen",
    ],
    pages: "4 Bab — Modul Penalaran Akademik UM-PTKIN",
    recommendedFor: ["Semua peserta UM-PTKIN", "Yang lemah di Sub Tes 1", "Target UIN favorit"],
    docxUrl: "/materi/umptkin/01_Penalaran_Akademik.docx",
    seksi: [
      { judul: "Bab 1: Logika Pernyataan dan Silogisme", deskripsi: "Membangun dasar penalaran formal: memahami syarat, akibat, kuantor, dan kesimpulan yang sah. Banyak soal HOTS tersembunyi di sini." },
      { judul: "Bab 2: Analogi, Relasi Kata, dan Makna", deskripsi: "Soal analogi tidak cukup dijawab dengan asosiasi umum. Peserta harus menemukan hubungan yang paling presisi antara dua konsep." },
      { judul: "Bab 3: Pola Bilangan, Huruf, dan Gambar", deskripsi: "Pola menguji kemampuan melihat keteraturan. Peserta perlu mencoba beberapa kemungkinan secara sistematis, bukan menebak." },
      { judul: "Bab 4: Membaca Argumen dan Simpulan", deskripsi: "Argumen terdiri atas klaim, alasan, bukti, dan asumsi. Soal HOTS sering meminta simpulan, kelemahan, atau pernyataan yang memperkuat." },
    ],
  },
  {
    id: "umptkin-penalaran-matematika",
    slug: "umptkin-penalaran-matematika",
    subject: "Penalaran Matematika",
    title: "Penalaran Matematika HOTS UM-PTKIN",
    type: "masterbook",
    jalur: "umptkin",
    duration: 45,
    xpReward: 90,
    color: "bg-violet-700",
    image: "/materi/images/struktur_paragraf.png",
    description: "Materi penalaran matematika UM-PTKIN: aljabar, fungsi, geometri, statistika, peluang, dan model cerita kontekstual untuk soal HOTS Sub Tes 2.",
    outcomes: [
      "Mengubah soal cerita menjadi model aljabar dengan benar",
      "Membaca makna grafik fungsi dan mencari nilai optimum",
      "Menyelesaikan soal geometri dengan gambar bantu efektif",
      "Memilih ukuran statistik yang tepat sesuai konteks data",
    ],
    pages: "4 Bab — Modul Penalaran Matematika UM-PTKIN",
    recommendedFor: ["Yang lemah matematika", "Sub Tes 2 UM-PTKIN", "IPA/Campuran"],
    docxUrl: "/materi/umptkin/02_Penalaran_Matematika.docx",
    seksi: [
      { judul: "Bab 1: Aljabar Dasar sampai Persamaan", deskripsi: "Aljabar adalah bahasa untuk mengubah cerita menjadi model. Kesalahan terbesar sering bukan rumus, melainkan cara membaca instruksi." },
      { judul: "Bab 2: Fungsi, Grafik, dan Optimasi", deskripsi: "Fungsi menghubungkan input dan output. Soal HOTS sering meminta membaca makna grafik atau mencari nilai maksimum/minimum dalam konteks nyata." },
      { judul: "Bab 3: Geometri dan Pengukuran", deskripsi: "Geometri menuntut kemampuan membayangkan bentuk. Gambar bantu sering lebih penting daripada hafalan rumus." },
      { judul: "Bab 4: Statistika, Peluang, dan Kombinatorika", deskripsi: "Data tidak hanya dihitung, tetapi juga ditafsirkan. Peserta harus tahu kapan memakai rata-rata, median, modus, peluang, atau kombinasi." },
    ],
  },
  {
    id: "umptkin-literasi-membaca",
    slug: "umptkin-literasi-membaca",
    subject: "Literasi Membaca",
    title: "Literasi Membaca UM-PTKIN",
    type: "rangkuman",
    jalur: "umptkin",
    duration: 35,
    xpReward: 80,
    color: "bg-teal-700",
    image: "/materi/images/siklus_air.png",
    description: "Strategi literasi membaca UM-PTKIN: gagasan utama, inferensi, literasi Bahasa Inggris, dan dasar Bahasa Arab untuk Sub Tes 3 dan 4.",
    outcomes: [
      "Menemukan gagasan utama dan struktur paragraf dengan cepat",
      "Menarik inferensi yang tidak tertulis langsung dari teks",
      "Menjawab soal reading comprehension Bahasa Inggris berbasis bukti",
      "Mengenali kosakata dan struktur kalimat Bahasa Arab dasar",
    ],
    pages: "4 Bab — Modul Literasi Membaca UM-PTKIN",
    recommendedFor: ["Sub Tes 3 & 4 UM-PTKIN", "Soshum/Campuran", "Yang lemah literasi"],
    docxUrl: "/materi/umptkin/03_Literasi_Membaca.docx",
    seksi: [
      { judul: "Bab 1: Gagasan Utama dan Struktur Paragraf", deskripsi: "Literasi membaca dimulai dari kemampuan menemukan gagasan pusat. Tanpa ini, peserta mudah tersesat oleh detail yang sengaja dijadikan jebakan." },
      { judul: "Bab 2: Inferensi dan Makna Tersirat", deskripsi: "Inferensi adalah kesimpulan yang tidak tertulis langsung tetapi wajib mengikuti isi teks. Ini inti soal HOTS literasi." },
      { judul: "Bab 3: Literasi Bahasa Inggris", deskripsi: "Soal bahasa Inggris menguji reading comprehension, vocabulary in context, reference, dan inference. Fokus utama: jawab dari teks, bukan asumsi." },
      { judul: "Bab 4: Literasi Bahasa Arab Dasar", deskripsi: "Peserta perlu mengenali kosakata umum, struktur jumlah ismiyyah/fi'liyyah, dan petunjuk konteks. Tidak perlu fasih, cukup cerdas membaca konteks." },
    ],
  },
  {
    id: "umptkin-literasi-islam",
    slug: "umptkin-literasi-islam",
    subject: "Literasi Ajaran Islam",
    title: "Literasi Ajaran Islam UM-PTKIN",
    type: "masterbook",
    jalur: "umptkin",
    duration: 40,
    xpReward: 90,
    color: "bg-amber-700",
    image: "/materi/images/timeline_sejarah.png",
    description: "Materi Pengetahuan Agama Islam UM-PTKIN: Quran-Hadits, aqidah-akhlak, fikih ibadah-muamalah, SKI, dan moderasi beragama untuk Sub Tes 5.",
    outcomes: [
      "Memahami fungsi Quran dan Hadits secara konseptual dan aplikatif",
      "Membedakan aqidah yang benar dan menjawab soal akhlak kontekstual",
      "Menjelaskan hukum fikih ibadah dan muamalah beserta alasannya",
      "Menganalisis peristiwa SKI dari sebab, tokoh, dan nilai peradaban",
    ],
    pages: "4 Bab — Modul Literasi Ajaran Islam UM-PTKIN",
    recommendedFor: ["Sub Tes 5 UM-PTKIN", "Semua peserta PTKIN", "Yang ingin nilai PAI tinggi"],
    docxUrl: "/materi/umptkin/04_Literasi_Ajaran_Islam.docx",
    seksi: [
      { judul: "Bab 1: Quran dan Hadits sebagai Sumber Ajaran", deskripsi: "Menekankan fungsi Quran dan Hadits dalam membimbing akidah, ibadah, akhlak, dan kehidupan sosial. Soal HOTS biasanya menguji pemahaman konteks, bukan hafalan." },
      { judul: "Bab 2: Aqidah dan Akhlak", deskripsi: "Aqidah memberi dasar keyakinan, sedangkan akhlak menunjukkan buah keyakinan dalam tindakan. Keduanya sering muncul dalam soal kasus nyata." },
      { judul: "Bab 3: Fikih Ibadah dan Muamalah", deskripsi: "Fikih mengatur tata cara ibadah dan hubungan sosial. Soal yang baik tidak hanya bertanya hukum, tetapi alasan dan tujuan (maqashid)." },
      { judul: "Bab 4: Sejarah Kebudayaan Islam dan Moderasi", deskripsi: "SKI bukan hafalan tahun semata. Peserta perlu melihat sebab, tokoh, kontribusi ilmu, dan nilai peradaban Islam yang relevan saat ini." },
    ],
  },
];

export function getLearningModule(slug: string) {
  return [...learningModules, ...umptkinModules].find((module) => module.slug === slug);
}
