import Link from "next/link";
import { ArrowRight, BookOpen, GraduationCap, Target, Users, Zap } from "lucide-react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { site } from "@/lib/site-config";

export const metadata = {
  title: "Tentang Kami",
  description: `${site.name} adalah platform persiapan ujian mandiri PTN dan UM-PTKIN yang dibuat oleh ${site.fullName}. Soal, simulasi, materi, dan rasionalisasi dalam satu tempat.`,
  alternates: { canonical: `${site.url}/tentang` },
};

const STATS = [
  { value: "1.800+", label: "Soal mirip ujian asli" },
  { value: "12", label: "Paket tryout UM PTN" },
  { value: "39", label: "UIN PTKIN tercakup" },
  { value: "17", label: "Modul materi tersedia" },
];

const VALUES = [
  {
    icon: Target,
    title: "Tepat sasaran",
    body: "Kami tidak menyediakan semua materi di dunia. Kami menyediakan materi yang paling sering muncul di ujian mandiri PTN, disusun dalam urutan yang logis.",
  },
  {
    icon: BookOpen,
    title: "Jujur soal keterbatasan",
    body: "Tidak ada platform yang bisa menjamin kelulusan. Yang bisa kami janjikan: soal yang relevan, pembahasan yang jelas, dan data untuk membantu kamu membuat keputusan realistis.",
  },
  {
    icon: Zap,
    title: "Ringan dan cepat",
    body: "Platform berbasis web yang bisa dibuka dari HP tanpa instal aplikasi. Tryout, materi, dan rasionalisasi bisa diakses kapan saja dan di perangkat apa saja.",
  },
  {
    icon: Users,
    title: "Untuk pelajar Indonesia",
    body: "Harga kami dibuat dengan mempertimbangkan kondisi keuangan pelajar. Versi gratis benar-benar gratis, bukan trial berbatas waktu yang memaksa upgrade.",
  },
];

const TIMELINE = [
  {
    year: "2024",
    title: "Ide awal",
    body: "Berangkat dari frustrasi: bimbel mahal, buku latihan tidak sesuai pola soal kampus, dan tidak ada cara mudah tahu peluang lolos secara realistis.",
  },
  {
    year: "2025",
    title: "Bank soal pertama",
    body: "Bank soal UM PTN pertama dibuat — 120 soal dengan pembahasan. Fitur tryout CBT berbasis web mulai bisa diakses.",
  },
  {
    year: "2026",
    title: "Sekarang",
    body: "1.800+ soal, 12 paket kampus, 5 paket UM-PTKIN, 17 modul materi PDF, rasionalisasi otomatis, dan sistem onboarding personal.",
  },
];

export default function TentangPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <SiteHeader />

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-14 sm:px-6">

        {/* Hero */}
        <section className="max-w-3xl">
          <p className="text-sm font-black uppercase tracking-wide text-[#0A66FF]">Tentang Kami</p>
          <h1 className="mt-3 text-3xl font-black leading-tight text-slate-950 sm:text-5xl">
            Belajar pasti lulus,<br />masa depan pasti cerah.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-600">
            {site.name} adalah platform persiapan ujian mandiri PTN dan UM-PTKIN yang dibuat oleh{" "}
            <span className="font-bold text-slate-900">{site.fullName}</span>. Kami menyediakan tryout
            berbasis CBT, materi ringkas, rasionalisasi kampus otomatis, dan jadwal belajar personal — semuanya
            dalam satu platform yang bisa diakses dari HP tanpa instal aplikasi.
          </p>
        </section>

        {/* Stats */}
        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-center">
              <p className="text-3xl font-black text-slate-950">{s.value}</p>
              <p className="mt-2 text-sm font-semibold text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Misi */}
        <section className="mt-16">
          <h2 className="text-2xl font-black text-slate-950">Kenapa {site.name} dibuat?</h2>
          <p className="mt-4 max-w-2xl leading-relaxed text-slate-600">
            Persiapan ujian mandiri PTN selama ini terpecah: buku latihan di satu tempat, soal online di tempat
            lain, info kampus harus dicari sendiri, dan tidak ada cara mudah untuk tahu apakah skor kamu sudah
            cukup atau belum. Kami menyatukan semua itu di satu tempat — dengan harga yang masuk akal untuk pelajar.
          </p>
          <p className="mt-4 max-w-2xl leading-relaxed text-slate-600">
            Kami percaya bahwa persiapan yang baik bukan soal berapa banyak yang kamu pelajari, tapi seberapa
            tepat kamu memahami di mana titik lemahmu dan apa yang harus diperbaiki sebelum hari ujian.
          </p>
        </section>

        {/* Values */}
        <section className="mt-16">
          <h2 className="text-2xl font-black text-slate-950">Nilai yang kami pegang</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            {VALUES.map((v) => (
              <div key={v.title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                  <v.icon size={22} />
                </div>
                <h3 className="mt-4 text-lg font-black text-slate-950">{v.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{v.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Timeline */}
        <section className="mt-16">
          <h2 className="text-2xl font-black text-slate-950">Perjalanan kami</h2>
          <div className="mt-6 space-y-0">
            {TIMELINE.map((item, i) => (
              <div key={item.year} className="flex gap-6">
                <div className="flex flex-col items-center">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-950 text-xs font-black text-white">
                    {item.year.slice(2)}
                  </div>
                  {i < TIMELINE.length - 1 && <div className="w-px flex-1 bg-slate-200" />}
                </div>
                <div className="pb-10">
                  <p className="text-xs font-black uppercase tracking-wide text-slate-400">{item.year}</p>
                  <h3 className="mt-1 font-black text-slate-950">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Kontak CTA */}
        <section className="mt-10 overflow-hidden rounded-3xl bg-slate-950 p-10">
          <p className="text-sm font-black uppercase tracking-wide text-white/50">Hubungi kami</p>
          <h2 className="mt-3 text-2xl font-black text-white sm:text-3xl">
            Punya pertanyaan atau ingin kerja sama?
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/70">
            Kami terbuka untuk diskusi: kerja sama sekolah, bimbel, komunitas belajar, atau laporan bug.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/kontak"
              className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-slate-100"
            >
              Hubungi kami <ArrowRight size={16} />
            </Link>
            <Link
              href="/faq"
              className="inline-flex items-center gap-2 rounded-2xl border border-white/20 px-5 py-3 text-sm font-black text-white transition hover:bg-white/10"
            >
              Lihat FAQ
            </Link>
          </div>
        </section>

        {/* Info kampus */}
        <section className="mt-12 rounded-3xl border border-slate-200 bg-slate-50 p-8">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#0A66FF]/10 text-[#0A66FF]">
              <GraduationCap size={24} />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-950">Cakupan kampus 2026</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Platform ini mencakup 12 PTN (UI, ITB, UGM, UNPAD, ITS, UNDIP, IPB, UB, UNHAS, UNAIR, dan
                lainnya) dan 39 UIN/IAIN/STAIN yang menggunakan sistem UM-PTKIN. Info jadwal dan skema seleksi
                tersedia di halaman Info PTN.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link
                  href="/info-ptn"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-700 hover:bg-slate-50"
                >
                  Info PTN Mandiri
                </Link>
                <Link
                  href="/info-ptn#umptkin"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-700 hover:bg-slate-50"
                >
                  Daftar UIN-PTKIN
                </Link>
              </div>
            </div>
          </div>
        </section>

      </main>
      <SiteFooter />
    </div>
  );
}
