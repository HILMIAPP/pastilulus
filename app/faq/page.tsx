import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { site } from "@/lib/site-config";

export const metadata = {
  title: "FAQ — Pertanyaan Umum",
  description: `Jawaban atas pertanyaan umum tentang ${site.name}: tryout, materi, paket, pembayaran, dan akun.`,
  alternates: { canonical: `${site.url}/faq` },
};

type FaqItem = { q: string; a: string };
type FaqSection = { heading: string; items: FaqItem[] };

const sections: FaqSection[] = [
  {
    heading: "Tryout & Soal",
    items: [
      {
        q: "Apakah soal tryout sama setiap kali dikerjakan?",
        a: "Tidak. Setiap paket tryout memiliki bank soal tetap yang sudah disusun berdasarkan pola ujian mandiri PTN/PTKIN. Urutannya konsisten agar kamu bisa membandingkan hasil antar sesi.",
      },
      {
        q: "Berapa jumlah soal dalam satu paket tryout?",
        a: "Paket UM Mandiri PTN terdiri dari 120 soal dalam 150 menit. Paket UM-PTKIN terdiri dari 121 soal dalam 120 menit, sesuai dengan komposisi resmi Sub Tes 1–5.",
      },
      {
        q: "Bagaimana sistem penilaian tryout?",
        a: "Benar +4, kosong 0, salah −1. Sistem ini sama dengan pola penilaian mayoritas ujian mandiri PTN kompetitif seperti SIMAK UI, SM-ITB, dan UM UGM.",
      },
      {
        q: "Apakah ada pembahasan soal setelah tryout?",
        a: "Ya. Setiap soal dilengkapi dengan kunci jawaban dan pembahasan singkat yang muncul setelah kamu menyelesaikan atau mengakhiri sesi tryout.",
      },
      {
        q: "Berapa paket tryout yang bisa saya kerjakan?",
        a: "Pengguna gratis dapat mengakses Paket 1 (UM Mandiri) dan Paket UM-PTKIN 1. Pengguna Belajar mendapatkan akses ke semua paket, termasuk 10 paket spesifik kampus (SIMAK UI, SM-ITB, UM UGM, dan lainnya).",
      },
      {
        q: "Apakah hasil tryout disimpan?",
        a: "Hasil tryout terakhir disimpan secara lokal di perangkat kamu (localStorage) dan ditampilkan di dashboard. Saat ini belum ada penyimpanan histori hasil di server.",
      },
    ],
  },
  {
    heading: "Materi Belajar",
    items: [
      {
        q: "Materi apa saja yang tersedia?",
        a: "Ada 12 modul UM PTN (Roadmap 30 Hari, TPS Penalaran, Literasi Indonesia, English Literacy, Matematika Dasar, Matematika IPA, Fisika, Kimia, Biologi, Soshum, Latihan Terpadu, Logbook) dan 5 modul UM-PTKIN (Roadmap, Penalaran Akademik, Penalaran Matematika, Literasi Membaca, Literasi Ajaran Islam).",
      },
      {
        q: "Apakah materi bisa diunduh?",
        a: "Ya. Setiap modul tersedia dalam format PDF yang bisa dibuka langsung di browser, dan versi DOCX bisa diunduh untuk modul UM-PTKIN. Modul UM PTN juga memiliki buku individual dalam format PDF.",
      },
      {
        q: "Apakah semua materi bisa diakses gratis?",
        a: "Beberapa modul (seperti Roadmap 30 Hari dan Roadmap UM-PTKIN) bisa diakses gratis. Modul lainnya memerlukan paket Belajar.",
      },
      {
        q: "Seberapa sering materi diperbarui?",
        a: "Materi diperbarui secara berkala mengikuti pola soal ujian mandiri terbaru. Kamu akan mendapat akses ke versi terbaru selama masa aktif paket.",
      },
    ],
  },
  {
    heading: "Paket & Harga",
    items: [
      {
        q: "Apa perbedaan paket Gratis, Belajar, dan Belajar Full?",
        a: "Gratis: 1 paket tryout, materi terbatas, tanpa batas waktu. Belajar: semua tryout (12 PTN + 39 UIN PTKIN), semua materi, rasionalisasi lengkap. Belajar Full: semua fitur Belajar plus prioritas akses konten baru dan support langsung.",
      },
      {
        q: "Berapa lama akses aktif setelah pembayaran?",
        a: "Akses berlaku selama periode yang tertera di paket (biasanya hingga akhir musim ujian mandiri 2026). Detail durasi ditampilkan di halaman Harga.",
      },
      {
        q: "Apakah ada garansi uang kembali?",
        a: "Tidak ada garansi uang kembali karena produk bersifat digital dan bisa langsung diakses setelah aktivasi. Silakan coba fitur gratis dulu sebelum memutuskan upgrade.",
      },
      {
        q: "Apakah harga bisa berubah?",
        a: "Ya. Kami menggunakan sistem Early Bird di mana harga naik otomatis setelah kuota terpenuhi. Harga yang kamu bayar saat ini terkunci selama masa aktif paketmu.",
      },
    ],
  },
  {
    heading: "Pembayaran & Aktivasi",
    items: [
      {
        q: "Metode pembayaran apa yang tersedia?",
        a: "QRIS, transfer bank (Virtual Account), dompet digital (GoPay, OVO, Dana, ShopeePay), dan kartu kredit/debit. Semua kanal diproses melalui payment gateway resmi.",
      },
      {
        q: "Paket saya belum aktif setelah bayar. Apa yang harus dilakukan?",
        a: "Tunggu maksimal 15 menit setelah pembayaran berhasil. Jika masih belum aktif, kirim email ke " + site.emailKontak + " dengan menyertakan: email akun, Order ID, dan screenshot bukti bayar.",
      },
      {
        q: "Apakah ada biaya tambahan selain harga paket?",
        a: "Tidak ada biaya tersembunyi. Harga yang ditampilkan adalah harga final.",
      },
      {
        q: "Bagaimana cara mengetahui status pembayaran saya?",
        a: "Cek halaman Transaksi di dashboard siswa. Status akan menampilkan: Menunggu pembayaran, Aktif, atau Gagal.",
      },
    ],
  },
  {
    heading: "Akun & Teknis",
    items: [
      {
        q: "Apakah saya bisa daftar dengan Google?",
        a: "Ya. Kamu bisa langsung daftar atau masuk menggunakan akun Google tanpa perlu membuat password.",
      },
      {
        q: "Bagaimana cara mengganti kata sandi?",
        a: 'Masuk ke halaman Masuk, lalu klik "Lupa kata sandi?" dan masukkan emailmu. Link reset akan dikirim ke emailmu.',
      },
      {
        q: "Apakah data saya aman?",
        a: "Data akun disimpan menggunakan Supabase dengan enkripsi standar industri. Kami tidak menyimpan data kartu pembayaran — semua transaksi diproses oleh payment gateway pihak ketiga.",
      },
      {
        q: "Di perangkat apa saja platform ini bisa diakses?",
        a: "Platform berbasis web dan bisa diakses dari browser mana pun (Chrome, Safari, Firefox) di HP, tablet, maupun laptop. Tidak perlu menginstal aplikasi.",
      },
      {
        q: "Apakah bisa diakses di lebih dari satu perangkat?",
        a: "Ya. Akun kamu bisa digunakan di beberapa perangkat secara bersamaan.",
      },
    ],
  },
  {
    heading: "UM PTN vs UM-PTKIN",
    items: [
      {
        q: "Apa perbedaan UM PTN dan UM-PTKIN?",
        a: "UM PTN adalah jalur mandiri untuk universitas negeri umum (UI, ITB, UGM, dll.) — fokus pada TPS, literasi, matematika, dan TKA. UM-PTKIN adalah ujian mandiri untuk UIN/IAIN/STAIN (39 kampus Islam negeri) — fokus pada Penalaran Akademik, Penalaran Matematika, Literasi Membaca, dan Pengetahuan Agama Islam.",
      },
      {
        q: "Berapa kampus PTN yang dicakup tryout?",
        a: "Ada 12 kampus PTN (SIMAK UI, SM-ITB, UM UGM, SMUP UNPAD, SM-ITS, UM UNDIP, SM-IPB, SMUB UB, Mandiri UNHAS, SMUA UNAIR, UTM IPB, dan paket multi-kampus).",
      },
      {
        q: "Berapa UIN/PTKIN yang dicakup?",
        a: "Kami menyediakan 5 paket tryout berbasis pola UM-PTKIN yang mencakup seluruh 39 UIN/IAIN/STAIN yang menggunakan sistem UM-PTKIN. Lihat daftar lengkapnya di halaman Info UM-PTKIN.",
      },
      {
        q: "Apakah satu paket Belajar mencakup keduanya?",
        a: "Ya. Satu paket Belajar memberikan akses ke semua tryout UM PTN dan UM-PTKIN, serta semua modul materi untuk kedua jalur.",
      },
    ],
  },
];

export default function FaqPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-14 sm:px-6">
        <p className="text-sm font-black uppercase tracking-wide text-[#0A66FF]">FAQ</p>
        <h1 className="mt-3 text-3xl font-black text-slate-950 sm:text-4xl">
          Pertanyaan yang sering ditanyakan.
        </h1>
        <p className="mt-4 leading-relaxed text-slate-600">
          Tidak ketemu jawabannya? Hubungi kami di{" "}
          <a href={`mailto:${site.emailKontak}`} className="font-bold text-[#0A66FF] hover:underline">
            {site.emailKontak}
          </a>{" "}
          atau masuk ke{" "}
          <Link href="/kontak" className="font-bold text-[#0A66FF] hover:underline">
            halaman Kontak
          </Link>
          .
        </p>

        <div className="mt-12 space-y-12">
          {sections.map((section) => (
            <section key={section.heading}>
              <h2 className="mb-4 text-lg font-black text-slate-950">{section.heading}</h2>
              <div className="divide-y divide-slate-100 rounded-3xl border border-slate-200 bg-white shadow-sm">
                {section.items.map((item) => (
                  <details key={item.q} className="group px-6 py-5">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
                      <span className="font-black text-slate-900">{item.q}</span>
                      <ChevronDown
                        size={18}
                        className="shrink-0 text-slate-400 transition-transform group-open:rotate-180"
                      />
                    </summary>
                    <p className="mt-3 text-sm leading-relaxed text-slate-600">{item.a}</p>
                  </details>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-14 rounded-3xl border border-slate-200 bg-slate-50 p-8 text-center">
          <p className="text-lg font-black text-slate-950">Masih ada pertanyaan?</p>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            Tim {site.name} siap membantu lewat email atau grup WhatsApp komunitas.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <a
              href={`mailto:${site.emailKontak}`}
              className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white hover:bg-slate-800"
            >
              Kirim email
            </a>
            <Link
              href={site.whatsappGroupUrl}
              target="_blank"
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 hover:bg-slate-50"
            >
              Grup WhatsApp
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
