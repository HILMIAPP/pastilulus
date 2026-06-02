/** Daftar item tryout PASTI LULUS 1.
 *  Digunakan bersama oleh halaman siswa, admin portal, dan API routes.
 */

export type PastiLulusItem = {
  nomor: string;
  universitas: string;
  jurusan: string;
  /** Nama file soal default dari folder tryout_univ_jurusan_pastilulus_pdf/ */
  defaultSoalFilename: string;
};

export const PASTI_LULUS_ITEMS: PastiLulusItem[] = [
  { nomor: "01", universitas: "Politeknik Negeri Sriwijaya (POLSRI)", jurusan: "Teknik Kimia", defaultSoalFilename: "01_tryout_politeknik-negeri-sriwijaya-polsri_teknik-kimia.pdf" },
  { nomor: "02", universitas: "Universitas Hasanuddin (UNHAS)", jurusan: "Farmasi", defaultSoalFilename: "02_tryout_universitas-hasanuddin_farmasi.pdf" },
  { nomor: "03", universitas: "Universitas Hasanuddin (UNHAS)", jurusan: "Ilmu Keperawatan", defaultSoalFilename: "03_tryout_universitas-hasanuddin_ilmu-keperawatan.pdf" },
  { nomor: "04", universitas: "Universitas Negeri Medan (UNIMED)", jurusan: "Kedokteran", defaultSoalFilename: "04_tryout_universitas-negeri-medan-unimed_fakultas-kedokteran-kedokteran.pdf" },
  { nomor: "05", universitas: "Universitas Sumatera Utara (USU)", jurusan: "Kedokteran", defaultSoalFilename: "05_tryout_universitas-sumatera-utara-usu_fakultas-kedokteran-kedokteran.pdf" },
  { nomor: "06", universitas: "Politeknik Negeri Padang (PNP)", jurusan: "Logistik Perdagangan Internasional", defaultSoalFilename: "06_tryout_politeknik-negeri-padang-pnp_logistik-perdagangan-internasional.pdf" },
  { nomor: "07", universitas: "Politeknik Negeri Padang (PNP)", jurusan: "Akuntansi", defaultSoalFilename: "07_tryout_politeknik-negeri-padang-pnp_akuntansi.pdf" },
  { nomor: "08", universitas: "Universitas (konfirmasi nama)", jurusan: "Administrasi Publik", defaultSoalFilename: "08_tryout_belum-disebutkan_administrasi-publik.pdf" },
  { nomor: "09", universitas: "Universitas (konfirmasi nama)", jurusan: "Ilmu Komunikasi", defaultSoalFilename: "09_tryout_belum-disebutkan_ilmu-komunikasi.pdf" },
  { nomor: "10", universitas: "Universitas Jambi (UNJA)", jurusan: "Kehutanan", defaultSoalFilename: "10_tryout_universitas-jambi-unja_kehutanan.pdf" },
  { nomor: "11", universitas: "Universitas Jambi (UNJA)", jurusan: "Ilmu Lingkungan", defaultSoalFilename: "11_tryout_universitas-jambi-unja_ilmu-lingkungan.pdf" },
  { nomor: "12", universitas: "Ganesa Bali", jurusan: "Manajemen", defaultSoalFilename: "12_tryout_ganesa-bali-perlu-konfirmasi-nama-resmi-kampus_manajemen.pdf" },
  { nomor: "13", universitas: "Ganesa Bali", jurusan: "Ekonomi", defaultSoalFilename: "13_tryout_ganesa-bali-perlu-konfirmasi-nama-resmi-kampus_ekonomi.pdf" },
  { nomor: "14", universitas: "Universitas Sumatera Utara (USU)", jurusan: "Kesehatan Masyarakat", defaultSoalFilename: "14_tryout_universitas-sumatera-utara-usu_fakultas-kesehatan-masyarakat.pdf" },
  { nomor: "15", universitas: "Politeknik Negeri Batam", jurusan: "Pembangkit Energi Terbarukan", defaultSoalFilename: "15_tryout_politeknik-negeri-batam_pembangkit-energi-terbarukan-perlu-konfirmasi.pdf" },
  { nomor: "16", universitas: "Politeknik Negeri Batam", jurusan: "Pengelasan & Fabrikasi", defaultSoalFilename: "16_tryout_politeknik-negeri-batam_pengelasan-dan-fabrikasi-perlu-konfirmasi.pdf" },
  { nomor: "17", universitas: "Universitas Diponegoro (UNDIP)", jurusan: "Peternakan", defaultSoalFilename: "17_tryout_universitas-diponegoro-undip_peternakan.pdf" },
  { nomor: "18", universitas: "Universitas Diponegoro (UNDIP)", jurusan: "Akuakultur", defaultSoalFilename: "18_tryout_universitas-diponegoro-undip_akuakultur.pdf" },
  { nomor: "19", universitas: "Universitas Borneo Tarakan (UBT)", jurusan: "Keperawatan", defaultSoalFilename: "19_tryout_universitas-borneo-tarakan-ubt_keperawatan.pdf" },
  { nomor: "20", universitas: "Universitas Borneo Tarakan (UBT)", jurusan: "Hukum", defaultSoalFilename: "20_tryout_universitas-borneo-tarakan-ubt_hukum.pdf" },
  { nomor: "21", universitas: "Universitas Borneo Tarakan (UBT)", jurusan: "Kebidanan", defaultSoalFilename: "21_tryout_universitas-borneo-tarakan-ubt_kebidanan.pdf" },
  { nomor: "22", universitas: "Universitas Borneo Tarakan (UBT)", jurusan: "Manajemen", defaultSoalFilename: "22_tryout_universitas-borneo-tarakan-ubt_manajemen.pdf" },
  { nomor: "23", universitas: "Politeknik Negeri Ujung Pandang (PNUP)", jurusan: "Administrasi Bisnis", defaultSoalFilename: "23_tryout_politeknik-negeri-ujung-pandang-pnup_administrasi-bisnis.pdf" },
  { nomor: "24", universitas: "Politeknik Negeri Ujung Pandang (PNUP)", jurusan: "Administrasi Perkantoran Digital", defaultSoalFilename: "24_tryout_politeknik-negeri-ujung-pandang-pnup_administrasi-perkantoran-digital.pdf" },
  { nomor: "25", universitas: "Politeknik Negeri Sriwijaya (POLSRI)", jurusan: "Teknik Sipil", defaultSoalFilename: "25_tryout_politeknik-negeri-sriwijaya-polsri_teknik-sipil.pdf" },
  { nomor: "26", universitas: "Politeknik Negeri Sriwijaya (POLSRI)", jurusan: "Manajemen Bisnis", defaultSoalFilename: "26_tryout_politeknik-negeri-sriwijaya-polsri_manajemen-bisnis.pdf" },
  { nomor: "27", universitas: "Politeknik Perkapalan Negeri Surabaya (PPNS)", jurusan: "D4 Manajemen Bisnis", defaultSoalFilename: "27_tryout_politeknik-perkapalan-negeri-surabaya-ppns_d4-manajemen-bisnis.pdf" },
  { nomor: "28", universitas: "Universitas Andalas (UNAND)", jurusan: "Kedokteran Gigi", defaultSoalFilename: "universitas_andalas_kedokteran_gigi.pdf" },
  { nomor: "29", universitas: "Universitas Andalas (UNAND)", jurusan: "Kesehatan Masyarakat", defaultSoalFilename: "universitas_andalas_kesehatan_masyarakat.pdf" },
  { nomor: "30", universitas: "Universitas Negeri Makassar (UNM)", jurusan: "Biologi", defaultSoalFilename: "universitas_negeri_makassar_biologi.pdf" },
  { nomor: "31", universitas: "Universitas Negeri Makassar (UNM)", jurusan: "Paket Umum", defaultSoalFilename: "universitas_negeri_makassar_paket_umum.pdf" },
  { nomor: "32", universitas: "Universitas Sriwijaya (UNSRI)", jurusan: "Kesehatan Lingkungan", defaultSoalFilename: "universitas_sriwijaya_kesehatan_lingkungan.pdf" },
  { nomor: "33", universitas: "Universitas Sriwijaya (UNSRI)", jurusan: "Kesehatan Masyarakat", defaultSoalFilename: "universitas_sriwijaya_kesehatan_masyarakat.pdf" },
  { nomor: "34", universitas: "Politeknik Negeri Batam", jurusan: "Paket UMPB", defaultSoalFilename: "politeknik_negeri_batam_paket_umpb.pdf" },
  { nomor: "35", universitas: "Politeknik Negeri Bengkalis", jurusan: "Teknik Mesin Produksi dan Perawatan", defaultSoalFilename: "politeknik_negeri_bengkalis_teknik_mesin_produksi_dan_perawatan.pdf" },
  { nomor: "36", universitas: "STIKes Karsa Husada", jurusan: "Keperawatan", defaultSoalFilename: "stikes_karsa_husada_keperawatan.pdf" },
  { nomor: "37", universitas: "Universitas Andalas (UNAND)", jurusan: "Kedokteran", defaultSoalFilename: "UNAND_Kedokteran_Tryout_Pastilulus.pdf" },
  { nomor: "38", universitas: "Universitas Sriwijaya (UNSRI)", jurusan: "Farmasi", defaultSoalFilename: "UNSRI_Farmasi_Tryout_Pastilulus.pdf" },
  { nomor: "39", universitas: "Universitas Tadulako (UNTAD)", jurusan: "Ilmu Hukum", defaultSoalFilename: "UNTAD_Ilmu_Hukum_Tryout_Pastilulus.pdf" },
];

export const INDEX_PDF_FILENAME = "00_INDEX_DAFTAR_TRYOUT.pdf";
export const ADDITIONAL_INDEX_PDF_FILENAMES = [
  "00_INDEX_DAFTAR_TRYOUT_TAMBAHAN.pdf",
  "00_INDEX_DAFTAR_TRYOUT_BATCH2.pdf",
] as const;
