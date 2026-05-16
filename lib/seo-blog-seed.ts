export type SeoBlogSeedPost = {
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  body: string;
};

type Topic = {
  slug: string;
  title: string;
  category: string;
  keyword: string;
  focus: string;
  ptn: string;
};

const topics: Topic[] = [
  { slug: "strategi-belajar-ujian-mandiri-ptn-dari-nol", title: "Strategi Belajar Ujian Mandiri PTN dari Nol", category: "Strategi belajar", keyword: "strategi belajar ujian mandiri", focus: "membangun fondasi belajar dari jadwal, latihan, dan evaluasi", ptn: "PTN favorit" },
  { slug: "cara-menyusun-jadwal-belajar-ujian-mandiri-30-hari", title: "Cara Menyusun Jadwal Belajar Ujian Mandiri 30 Hari", category: "Strategi belajar", keyword: "jadwal belajar ujian mandiri", focus: "membagi waktu harian tanpa belajar acak", ptn: "kampus target" },
  { slug: "perbedaan-soal-ujian-mandiri-dan-snbt", title: "Perbedaan Soal Ujian Mandiri dan SNBT yang Perlu Dipahami", category: "Analisis soal", keyword: "perbedaan ujian mandiri dan SNBT", focus: "mengenali pola soal kampus yang sering berbeda dari tes nasional", ptn: "UI, ITB, UGM, dan PTN lain" },
  { slug: "cara-latihan-soal-simak-ui-agar-lebih-terarah", title: "Cara Latihan Soal SIMAK UI agar Lebih Terarah", category: "SIMAK UI", keyword: "latihan soal SIMAK UI", focus: "memilih latihan, membaca pembahasan, dan mengejar pola soal", ptn: "Universitas Indonesia" },
  { slug: "tips-mengerjakan-soal-matematika-dasar-ujian-mandiri", title: "Tips Mengerjakan Soal Matematika Dasar Ujian Mandiri", category: "Matematika", keyword: "matematika dasar ujian mandiri", focus: "menguatkan konsep hitung, aljabar, fungsi, dan peluang", ptn: "PTN favorit" },
  { slug: "cara-meningkatkan-skor-tryout-ujian-mandiri", title: "Cara Meningkatkan Skor Tryout Ujian Mandiri", category: "Try out", keyword: "skor tryout ujian mandiri", focus: "mengubah hasil tryout menjadi rencana perbaikan", ptn: "kampus target" },
  { slug: "checklist-persiapan-daftar-jalur-mandiri-ptn", title: "Checklist Persiapan Daftar Jalur Mandiri PTN", category: "Info PTN", keyword: "daftar jalur mandiri PTN", focus: "menyiapkan dokumen, jadwal, biaya, dan pilihan prodi", ptn: "PTN tujuan" },
  { slug: "cara-memilih-ptn-target-untuk-ujian-mandiri", title: "Cara Memilih PTN Target untuk Ujian Mandiri", category: "Info PTN", keyword: "memilih PTN target", focus: "menentukan kampus berdasarkan peluang, biaya, dan kesiapan akademik", ptn: "kampus impian" },
  { slug: "strategi-14-hari-menjelang-ujian-mandiri", title: "Strategi 14 Hari Menjelang Ujian Mandiri", category: "Strategi belajar", keyword: "strategi 14 hari ujian mandiri", focus: "prioritas latihan ketika waktu belajar sudah mepet", ptn: "PTN favorit" },
  { slug: "cara-review-pembahasan-soal-yang-salah", title: "Cara Review Pembahasan Soal yang Salah agar Tidak Terulang", category: "Analisis soal", keyword: "review pembahasan soal", focus: "membedakan salah konsep, salah hitung, dan salah strategi waktu", ptn: "kampus target" },
  { slug: "tips-belajar-penalaran-umum-ujian-mandiri", title: "Tips Belajar Penalaran Umum untuk Ujian Mandiri", category: "Penalaran", keyword: "penalaran umum ujian mandiri", focus: "melatih pola logika, kesimpulan, dan analisis bacaan", ptn: "PTN favorit" },
  { slug: "panduan-belajar-bahasa-inggris-ujian-mandiri", title: "Panduan Belajar Bahasa Inggris Ujian Mandiri", category: "Bahasa Inggris", keyword: "bahasa Inggris ujian mandiri", focus: "mengerjakan reading, vocabulary, dan grammar secara efisien", ptn: "kampus target" },
  { slug: "cara-membaca-peluang-lolos-ujian-mandiri", title: "Cara Membaca Peluang Lolos Ujian Mandiri secara Realistis", category: "Rasionalisasi", keyword: "peluang lolos ujian mandiri", focus: "menggunakan skor, daya tampung, dan konsistensi latihan", ptn: "PTN tujuan" },
  { slug: "kesalahan-umum-saat-belajar-ujian-mandiri", title: "Kesalahan Umum Saat Belajar Ujian Mandiri", category: "Strategi belajar", keyword: "kesalahan belajar ujian mandiri", focus: "menghindari belajar terlalu luas tanpa evaluasi", ptn: "PTN favorit" },
  { slug: "cara-belajar-ujian-mandiri-sambil-sekolah", title: "Cara Belajar Ujian Mandiri sambil Sekolah", category: "Manajemen waktu", keyword: "belajar ujian mandiri sambil sekolah", focus: "mengatur energi setelah sekolah dan tetap konsisten", ptn: "kampus target" },
  { slug: "tips-mengatur-waktu-saat-tryout-ujian-mandiri", title: "Tips Mengatur Waktu Saat Tryout Ujian Mandiri", category: "Try out", keyword: "waktu tryout ujian mandiri", focus: "menentukan urutan soal dan batas waktu per bagian", ptn: "PTN favorit" },
  { slug: "materi-yang-sering-muncul-di-ujian-mandiri", title: "Materi yang Sering Muncul di Ujian Mandiri PTN", category: "Materi belajar", keyword: "materi ujian mandiri PTN", focus: "memetakan materi prioritas dari matematika, literasi, dan penalaran", ptn: "PTN tujuan" },
  { slug: "cara-membuat-target-skor-tryout-yang-masuk-akal", title: "Cara Membuat Target Skor Tryout yang Masuk Akal", category: "Try out", keyword: "target skor tryout", focus: "menetapkan target bertahap berdasarkan hasil awal", ptn: "kampus target" },
  { slug: "panduan-ujian-mandiri-itb-untuk-pemula", title: "Panduan Ujian Mandiri ITB untuk Pemula", category: "SM-ITB", keyword: "ujian mandiri ITB", focus: "memahami persiapan akademik dan administrasi SM-ITB", ptn: "Institut Teknologi Bandung" },
  { slug: "panduan-ujian-mandiri-ugm-untuk-pemula", title: "Panduan Ujian Mandiri UGM untuk Pemula", category: "UM UGM", keyword: "ujian mandiri UGM", focus: "menyusun latihan dan mengecek jalur UM UGM", ptn: "Universitas Gadjah Mada" },
  { slug: "panduan-ujian-mandiri-unpad-untuk-pemula", title: "Panduan Ujian Mandiri UNPAD untuk Pemula", category: "SMUP UNPAD", keyword: "ujian mandiri UNPAD", focus: "membaca jadwal, materi, dan strategi SMUP", ptn: "Universitas Padjadjaran" },
  { slug: "cara-menentukan-prioritas-materi-ujian-mandiri", title: "Cara Menentukan Prioritas Materi Ujian Mandiri", category: "Materi belajar", keyword: "prioritas materi ujian mandiri", focus: "memilih materi berdampak besar berdasarkan hasil latihan", ptn: "PTN favorit" },
  { slug: "strategi-belajar-matematika-soshum-ujian-mandiri", title: "Strategi Belajar Matematika Soshum Ujian Mandiri", category: "Matematika", keyword: "matematika soshum ujian mandiri", focus: "menguasai konsep dasar yang sering menjadi pembeda skor", ptn: "kampus target" },
  { slug: "cara-mengatasi-blank-saat-ujian-mandiri", title: "Cara Mengatasi Blank Saat Ujian Mandiri", category: "Mental ujian", keyword: "blank saat ujian mandiri", focus: "mengatur napas, pindah soal, dan menjaga ritme", ptn: "PTN tujuan" },
  { slug: "tips-belajar-literasi-bahasa-indonesia-ujian-mandiri", title: "Tips Belajar Literasi Bahasa Indonesia Ujian Mandiri", category: "Literasi", keyword: "literasi bahasa Indonesia ujian mandiri", focus: "membaca cepat tanpa kehilangan detail argumen", ptn: "PTN favorit" },
  { slug: "cara-menganalisis-hasil-tryout-ujian-mandiri", title: "Cara Menganalisis Hasil Tryout Ujian Mandiri", category: "Try out", keyword: "analisis hasil tryout", focus: "membaca skor per materi dan membuat agenda remedial", ptn: "kampus target" },
  { slug: "urutan-belajar-ujian-mandiri-yang-efektif", title: "Urutan Belajar Ujian Mandiri yang Efektif", category: "Strategi belajar", keyword: "urutan belajar ujian mandiri", focus: "mulai dari diagnosis, materi prioritas, latihan, dan evaluasi", ptn: "PTN tujuan" },
  { slug: "cara-belajar-dari-soal-tahun-sebelumnya", title: "Cara Belajar dari Soal Tahun Sebelumnya", category: "Analisis soal", keyword: "soal tahun sebelumnya ujian mandiri", focus: "mengambil pola tanpa sekadar menghafal jawaban", ptn: "PTN favorit" },
  { slug: "tips-memilih-prodi-di-jalur-mandiri-ptn", title: "Tips Memilih Prodi di Jalur Mandiri PTN", category: "Info PTN", keyword: "memilih prodi jalur mandiri", focus: "menimbang minat, peluang, biaya, dan kekuatan akademik", ptn: "kampus target" },
  { slug: "cara-belajar-konsisten-untuk-ujian-mandiri", title: "Cara Belajar Konsisten untuk Ujian Mandiri", category: "Manajemen waktu", keyword: "belajar konsisten ujian mandiri", focus: "membangun kebiasaan kecil yang bisa dijalankan setiap hari", ptn: "PTN tujuan" },
  { slug: "strategi-mengerjakan-soal-sulit-ujian-mandiri", title: "Strategi Mengerjakan Soal Sulit Ujian Mandiri", category: "Analisis soal", keyword: "soal sulit ujian mandiri", focus: "membedakan soal yang layak dikerjakan dan ditinggalkan dulu", ptn: "PTN favorit" },
  { slug: "panduan-membuat-catatan-belajar-ujian-mandiri", title: "Panduan Membuat Catatan Belajar Ujian Mandiri", category: "Strategi belajar", keyword: "catatan belajar ujian mandiri", focus: "mencatat rumus, kesalahan, dan pola soal secara ringkas", ptn: "kampus target" },
  { slug: "cara-mengejar-ketertinggalan-belajar-ujian-mandiri", title: "Cara Mengejar Ketertinggalan Belajar Ujian Mandiri", category: "Strategi belajar", keyword: "mengejar ketertinggalan ujian mandiri", focus: "membuat prioritas saat materi terasa terlalu banyak", ptn: "PTN tujuan" },
  { slug: "tips-menjaga-motivasi-menjelang-ujian-mandiri", title: "Tips Menjaga Motivasi Menjelang Ujian Mandiri", category: "Mental ujian", keyword: "motivasi ujian mandiri", focus: "menjaga energi tanpa memaksa diri belajar berlebihan", ptn: "PTN favorit" },
  { slug: "cara-belajar-dengan-ai-tutor-untuk-ujian-mandiri", title: "Cara Belajar dengan AI Tutor untuk Ujian Mandiri", category: "AI tutor", keyword: "AI tutor ujian mandiri", focus: "menggunakan bantuan AI untuk memahami pembahasan dan konsep", ptn: "kampus target" },
  { slug: "apa-yang-harus-dilakukan-setelah-tryout-pertama", title: "Apa yang Harus Dilakukan Setelah Tryout Pertama?", category: "Try out", keyword: "setelah tryout pertama", focus: "mengubah hasil awal menjadi baseline belajar", ptn: "PTN tujuan" },
  { slug: "cara-membaca-deadline-pendaftaran-ptn", title: "Cara Membaca Deadline Pendaftaran PTN agar Tidak Terlambat", category: "Info PTN", keyword: "deadline pendaftaran PTN", focus: "membedakan registrasi akun, pembayaran, unggah dokumen, dan finalisasi", ptn: "PTN favorit" },
  { slug: "strategi-belajar-untuk-anak-gap-year-ujian-mandiri", title: "Strategi Belajar untuk Anak Gap Year yang Ikut Ujian Mandiri", category: "Strategi belajar", keyword: "gap year ujian mandiri", focus: "menjaga ritme belajar dan memilih target yang realistis", ptn: "kampus target" },
  { slug: "cara-menyiapkan-dokumen-jalur-mandiri-ptn", title: "Cara Menyiapkan Dokumen Jalur Mandiri PTN", category: "Info PTN", keyword: "dokumen jalur mandiri PTN", focus: "mencatat kebutuhan identitas, rapor, ijazah, foto, dan bukti pembayaran", ptn: "PTN tujuan" },
  { slug: "tips-mengerjakan-soal-penalaran-logis-ujian-mandiri", title: "Tips Mengerjakan Soal Penalaran Logis Ujian Mandiri", category: "Penalaran", keyword: "penalaran logis ujian mandiri", focus: "membaca premis, menguji kesimpulan, dan menghindari asumsi berlebih", ptn: "PTN favorit" },
  { slug: "cara-mengelola-stres-sebelum-ujian-mandiri", title: "Cara Mengelola Stres Sebelum Ujian Mandiri", category: "Mental ujian", keyword: "stres sebelum ujian mandiri", focus: "menjaga pola tidur, simulasi, dan ekspektasi", ptn: "kampus target" },
  { slug: "cara-membandingkan-paket-belajar-ujian-mandiri", title: "Cara Membandingkan Paket Belajar Ujian Mandiri", category: "Tips belajar", keyword: "paket belajar ujian mandiri", focus: "memilih fitur yang benar-benar membantu persiapan", ptn: "PTN tujuan" },
  { slug: "strategi-belajar-untuk-prodi-ketat-di-ptn", title: "Strategi Belajar untuk Prodi Ketat di PTN", category: "Rasionalisasi", keyword: "prodi ketat PTN", focus: "meningkatkan skor sambil menyiapkan pilihan cadangan", ptn: "PTN favorit" },
  { slug: "cara-membuat-rencana-belajar-7-hari", title: "Cara Membuat Rencana Belajar 7 Hari yang Realistis", category: "Strategi belajar", keyword: "rencana belajar 7 hari", focus: "mengatur target mingguan yang bisa dievaluasi", ptn: "kampus target" },
  { slug: "tips-belajar-efektif-di-malam-hari", title: "Tips Belajar Efektif di Malam Hari untuk Ujian Mandiri", category: "Manajemen waktu", keyword: "belajar malam ujian mandiri", focus: "menjaga fokus saat waktu belajar utama ada di malam hari", ptn: "PTN tujuan" },
  { slug: "cara-menentukan-mapel-terlemah-dari-tryout", title: "Cara Menentukan Mapel Terlemah dari Tryout", category: "Try out", keyword: "mapel terlemah tryout", focus: "membaca data tryout agar latihan berikutnya lebih tajam", ptn: "PTN favorit" },
  { slug: "panduan-belajar-simak-ui-30-hari", title: "Panduan Belajar SIMAK UI 30 Hari", category: "SIMAK UI", keyword: "belajar SIMAK UI 30 hari", focus: "menggabungkan latihan soal, pembahasan, dan evaluasi mingguan", ptn: "Universitas Indonesia" },
  { slug: "cara-membuat-bank-kesalahan-belajar", title: "Cara Membuat Bank Kesalahan Belajar", category: "Strategi belajar", keyword: "bank kesalahan belajar", focus: "mengumpulkan kesalahan agar tidak berulang di tryout berikutnya", ptn: "kampus target" },
  { slug: "tips-finalisasi-pendaftaran-ujian-mandiri", title: "Tips Finalisasi Pendaftaran Ujian Mandiri", category: "Info PTN", keyword: "finalisasi pendaftaran ujian mandiri", focus: "mengecek data, pembayaran, dan bukti final sebelum deadline", ptn: "PTN tujuan" },
  { slug: "cara-belajar-ujian-mandiri-tanpa-bimbel", title: "Cara Belajar Ujian Mandiri Tanpa Bimbel", category: "Strategi belajar", keyword: "belajar ujian mandiri tanpa bimbel", focus: "membangun sistem belajar mandiri dengan tryout dan pembahasan", ptn: "PTN favorit" },
];

function makeBody(topic: Topic) {
  return [
    `${topic.title} perlu dimulai dari pemahaman bahwa ujian mandiri tidak selalu sama dengan pola tes nasional. Setiap kampus bisa punya tekanan waktu, gaya soal, dan prioritas materi yang berbeda. Karena itu, ${topic.keyword} sebaiknya tidak dilakukan dengan cara membaca semua materi secara acak.`,
    `Langkah pertama adalah menentukan ${topic.ptn} sebagai acuan. Setelah target jelas, siswa bisa memetakan materi yang paling sering muncul, membuat jadwal latihan, lalu mengukur hasilnya lewat tryout. Fokus utama artikel ini adalah ${topic.focus}.`,
    `Gunakan prinsip diagnosis sebelum belajar panjang. Kerjakan simulasi singkat, lihat bagian yang paling banyak salah, lalu ulangi materi dari akar konsepnya. Jika kesalahan muncul karena salah hitung, buat latihan pendek. Jika salah karena tidak paham konsep, baca pembahasan dan tulis ulang dengan bahasa sendiri.`,
    `Untuk hasil yang lebih stabil, jangan hanya mengejar jumlah soal. Lebih baik mengerjakan sedikit soal tetapi benar-benar memahami alasan jawaban benar dan salah. Catat pola jebakan, rumus yang sering lupa, dan jenis soal yang memakan waktu terlalu lama.`,
    `Dalam satu minggu, buat target yang konkret: satu sesi tryout, dua sesi review pembahasan, dan tiga sesi latihan materi terlemah. Pola sederhana seperti ini membantu siswa melihat perkembangan, bukan sekadar merasa sudah belajar lama.`,
    `Kesimpulannya, ${topic.keyword} akan lebih efektif jika diarahkan oleh data latihan. Mulai dari target kampus, cek kemampuan awal, perbaiki titik lemah, lalu ulangi siklusnya sampai hari ujian. Dengan cara ini, persiapan terasa lebih terukur dan tidak mudah panik.`,
  ].join("\n\n");
}

export const seoBlogSeedPosts: SeoBlogSeedPost[] = topics.map((topic) => ({
  slug: topic.slug,
  title: topic.title,
  category: topic.category,
  excerpt: `Panduan praktis tentang ${topic.keyword} untuk membantu siswa menyiapkan ${topic.ptn} dengan strategi yang lebih terarah.`,
  body: makeBody(topic),
}));
