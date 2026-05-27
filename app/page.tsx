import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  GraduationCap,
  Target,
  TrendingUp,
  Zap,
} from "lucide-react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { site } from "@/lib/site-config";
import { getHomeContent } from "@/lib/public-content";

const PTN_BADGES = [
  "SIMAK UI", "SM-ITB", "UM UGM", "SMUP UNPAD",
  "UM UNDIP", "SM ITS", "UTM IPB", "SMUB UB",
  "UM PTKIN", "UIN Jakarta", "UIN Bandung", "+31 lainnya",
];

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Daftar gratis",
    body: "Buat akun dalam 30 detik dengan Google atau email. Langsung masuk ke dashboard.",
  },
  {
    step: "02",
    title: "Pilih target PTN",
    body: "Tentukan kampus tujuan. Platform akan menyesuaikan tryout dan materi untuk kamu.",
  },
  {
    step: "03",
    title: "Latihan & pantau progres",
    body: "Kerjakan soal mirip ujian asli, baca pembahasan, dan lihat nilai naik setiap sesi.",
  },
];

const FEATURES = [
  {
    icon: <GraduationCap size={20} />,
    title: "12 PTN + 39 UIN",
    body: "Soal dan strategi spesifik per kampus: SIMAK UI, SM-ITB, UM UGM, UM PTKIN, dan banyak lagi.",
  },
  {
    icon: <BookOpen size={20} />,
    title: "Materi lengkap A-Z",
    body: "Masterbook, rangkuman, dan logbook error untuk setiap sub-tes. Belajar dari yang paling lemah.",
  },
  {
    icon: <Target size={20} />,
    title: "Rasionalisasi nilai",
    body: "Setelah tryout, lihat probabilitas lolos ke tiap kampus berdasarkan skor terakhir kamu.",
  },
  {
    icon: <CalendarDays size={20} />,
    title: "Deadline tracker",
    body: "Jadwal buka–tutup pendaftaran semua PTN dan PTKIN target dalam satu tampilan.",
  },
  {
    icon: <TrendingUp size={20} />,
    title: "Analitik kelemahan",
    body: "Identifikasi pola kesalahan dan bagian yang butuh diperkuat berdasarkan riwayat jawaban.",
  },
  {
    icon: <Zap size={20} />,
    title: "Harga early bird",
    body: "Mulai Rp 25.000 untuk 500 pendaftar pertama. Harga naik otomatis setelah kuota habis.",
  },
];

const TESTIMONIALS = [
  {
    text: "Berkat Pastilulus, skor tryout SIMAK UI saya naik dari 620 ke 710 dalam 3 minggu. Pembahasannya detail banget!",
    name: "Farhan A.", school: "SMAN 5 Jakarta · SIMAK UI · 710",
    initials: "F", color: "bg-[#0A66FF]",
  },
  {
    text: "Modul UM-PTKIN A-Z-nya sangat membantu. Sub tes Penalaran Akademik dan Agama Islam jadi lebih mudah dipahami.",
    name: "Nadia R.", school: "MAN 2 Bandung · UM PTKIN · 680",
    initials: "N", color: "bg-emerald-600",
  },
  {
    text: "Deadline tracker PTN-nya bikin saya nggak ketinggalan satu pun jadwal. Lolos UM UGM akhirnya!",
    name: "Rizky P.", school: "SMAN 1 Surabaya · UM UGM · 732",
    initials: "R", color: "bg-violet-600",
  },
];

const FAQS = [
  {
    q: "Apakah bisa dicoba gratis dulu?",
    a: "Bisa. Paket Gratis memberikan akses ke 1 paket tryout UM PTN, 1 paket tryout UM PTKIN, dan modul materi pertama dari tiap jalur — tanpa batas waktu dan tanpa kartu kredit.",
  },
  {
    q: "Apakah mendukung jalur UM PTN dan UM PTKIN sekaligus?",
    a: "Ya, keduanya. Kami menyediakan soal, materi, dan tryout untuk Ujian Mandiri PTN (SIMAK UI, SM-ITB, UM UGM, dan 9 PTN lain) sekaligus UM-PTKIN 2026 — semua dalam satu platform.",
  },
  {
    q: "Berapa lama akses paket berlaku?",
    a: "Paket Belajar berlaku 6 bulan. Paket Belajar Full berlaku selamanya — tidak perlu perpanjangan. Keduanya memberikan akses penuh ke semua tryout dan modul.",
  },
  {
    q: "Apa itu harga Early Bird?",
    a: "Harga early bird berlaku untuk pendaftar pertama: 500 slot untuk Belajar (Rp 25.000) dan 100 slot untuk Belajar Full (Rp 75.000). Setelah kuota habis, harga naik otomatis 5% setiap kelompok pembeli hingga harga normal.",
  },
  {
    q: "Bagaimana cara kerja AI tutor-nya?",
    a: "AI tutor aktif 24/7. Kamu bisa tanya soal, minta pembahasan ulang, atau diskusi strategi belajar kapanpun langsung dari dalam platform.",
  },
];

export default async function HomePage() {
  const homeContent = await getHomeContent({
    badge: "Untuk pejuang Ujian Mandiri PTN & UM PTKIN 2026",
    headline: "Belajar pasti lulus,\nmasa depan pasti cerah.",
    subheadline: `${site.name} bantu kamu latihan dengan pola soal mandiri PTN dan UM-PTKIN, paham pembahasan lebih cepat, dan tidak ketinggalan deadline kampus impian.`,
    cta: "Mulai gratis sekarang",
  });

  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-900">
      <SiteHeader />

      <main className="flex-1">

        {/* ── Hero ─────────────────────────────────────────────── */}
        <section className="border-b border-slate-100 bg-white px-5 pb-20 pt-16 text-center sm:px-8 sm:pb-24 sm:pt-20">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-4 py-1.5 text-xs font-bold text-slate-600">
            {homeContent.badge}
          </span>

          <h1 className="mx-auto mt-6 max-w-3xl whitespace-pre-line text-5xl font-black leading-[1.1] tracking-tight text-slate-950 sm:text-6xl lg:text-7xl">
            {homeContent.headline}
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-slate-500">
            {homeContent.subheadline}
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/daftar"
              className="inline-flex min-h-12 items-center gap-2 rounded-2xl bg-slate-950 px-7 text-sm font-black text-white transition hover:bg-slate-800"
            >
              {homeContent.cta} <ArrowRight size={16} />
            </Link>
            <Link
              href="/siswa/tryout"
              className="inline-flex min-h-12 items-center gap-2 rounded-2xl border border-slate-200 px-7 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
            >
              Coba tryout gratis
            </Link>
          </div>

          {/* Stats */}
          <div className="mx-auto mt-12 flex max-w-lg flex-wrap items-center justify-center gap-x-10 gap-y-4">
            <Stat value="1.800+" label="soal latihan" />
            <div className="hidden h-8 w-px bg-slate-200 sm:block" />
            <Stat value="12 PTN" label="& 39 UIN" />
            <div className="hidden h-8 w-px bg-slate-200 sm:block" />
            <Stat value="24/7" label="AI tutor aktif" />
            <div className="hidden h-8 w-px bg-slate-200 sm:block" />
            <Stat value="Gratis" label="untuk mulai" />
          </div>
        </section>

        {/* ── Cara kerja ───────────────────────────────────────── */}
        <section className="bg-slate-950 px-5 py-20 text-white sm:px-8 lg:py-24">
          <div className="mx-auto max-w-7xl">
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">Cara kerja</p>
            <h2 className="mt-3 max-w-md text-3xl font-black leading-tight sm:text-4xl">
              Tiga langkah menuju nilai lebih tinggi.
            </h2>

            <div className="mt-12 grid gap-8 sm:grid-cols-3">
              {HOW_IT_WORKS.map((item) => (
                <div key={item.step} className="flex gap-5">
                  <span className="mt-0.5 shrink-0 text-2xl font-black text-slate-600">{item.step}</span>
                  <div>
                    <p className="text-lg font-black text-white">{item.title}</p>
                    <p className="mt-2 text-sm leading-7 text-slate-400">{item.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Kampus strip ─────────────────────────────────────── */}
        <div className="border-b border-slate-100 bg-white px-5 py-6 sm:px-8">
          <div className="mx-auto max-w-7xl">
            <p className="mb-4 text-center text-[10px] font-black uppercase tracking-widest text-slate-400">
              Kampus yang didukung
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {PTN_BADGES.map((name) => (
                <span
                  key={name}
                  className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600"
                >
                  {name}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ── Fitur ────────────────────────────────────────────── */}
        <section className="border-b border-slate-100 bg-white px-5 py-20 sm:px-8 lg:py-24">
          <div className="mx-auto max-w-7xl">
            <div className="mb-12 max-w-xl">
              <p className="text-xs font-black uppercase tracking-widest text-[#0A66FF]">Fitur</p>
              <h2 className="mt-3 text-3xl font-black leading-tight text-slate-950 sm:text-4xl">
                Semua yang kamu butuhkan,<br className="hidden sm:block" /> di satu tempat.
              </h2>
            </div>

            <div className="grid gap-px bg-slate-100 border border-slate-100 rounded-3xl overflow-hidden sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((f) => (
                <div key={f.title} className="bg-white p-8">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                    {f.icon}
                  </div>
                  <h3 className="mt-4 text-base font-black text-slate-950">{f.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-slate-500">{f.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Harga ────────────────────────────────────────────── */}
        <section className="border-b border-slate-100 bg-slate-50 px-5 py-20 sm:px-8 lg:py-24">
          <div className="mx-auto max-w-7xl">
            <div className="mb-10 text-center">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-800">
                <Zap size={11} /> Harga Early Bird
              </span>
              <h2 className="mt-4 text-3xl font-black text-slate-950 sm:text-4xl">3 paket. Mulai dari Rp 0.</h2>
              <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-slate-500">
                Paket Gratis untuk merasakan platformnya. Belajar dan Belajar Full untuk akses penuh.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <PricingCard
                name="Gratis"
                price="Rp 0"
                cadence="selamanya"
                features={["1 tryout UM PTN", "1 tryout UM PTKIN", "Modul materi pertama"]}
                cta={{ href: "/daftar", label: "Mulai gratis" }}
                highlight={false}
              />
              <PricingCard
                name="Belajar"
                price="Rp 25.000"
                cadence="6 bulan"
                earlyBird="500 slot tersisa"
                features={["Semua tryout UM PTN", "Semua tryout UM PTKIN", "Semua modul materi"]}
                cta={{ href: "/pembayaran?paket=belajar", label: "Mulai Belajar" }}
                highlight={true}
              />
              <PricingCard
                name="Belajar Full"
                price="Rp 75.000"
                cadence="selamanya"
                earlyBird="100 slot tersisa"
                features={["Semua fitur Belajar", "Masa aktif selamanya", "Prioritas support"]}
                cta={{ href: "/pembayaran?paket=pro", label: "Pilih Full" }}
                highlight={false}
              />
            </div>

            <p className="mt-6 text-center text-xs text-slate-400">
              Harga naik otomatis setelah kuota habis.{" "}
              <Link href="/harga" className="font-bold text-slate-700 underline underline-offset-2">
                Lihat detail →
              </Link>
            </p>
          </div>
        </section>

        {/* ── Testimoni ────────────────────────────────────────── */}
        <section className="border-b border-slate-100 bg-white px-5 py-20 sm:px-8 lg:py-24">
          <div className="mx-auto max-w-7xl">
            <div className="mb-12 text-center">
              <p className="text-xs font-black uppercase tracking-widest text-slate-400">Testimoni</p>
              <h2 className="mt-3 text-3xl font-black text-slate-950 sm:text-4xl">Mereka sudah membuktikan.</h2>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              {TESTIMONIALS.map((t) => (
                <div key={t.name} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-7">
                  <p className="flex-1 text-sm leading-8 text-slate-600">&ldquo;{t.text}&rdquo;</p>
                  <div className="mt-6 flex items-center gap-3 border-t border-slate-100 pt-5">
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-black text-white ${t.color}`}>
                      {t.initials}
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-900">{t.name}</p>
                      <p className="text-xs text-slate-400">{t.school}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ──────────────────────────────────────────────── */}
        <section className="border-b border-slate-100 bg-slate-950 px-5 py-20 text-white sm:px-8 lg:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-4xl font-black leading-tight sm:text-5xl">
              Mulai dulu.<br />Bayar nanti kalau cocok.
            </h2>
            <p className="mx-auto mt-5 max-w-md text-base leading-8 text-slate-400">
              Coba gratis, rasakan tryout UM PTN dan UM PTKIN. Kalau butuh akses penuh,
              paket Belajar mulai <strong className="text-white">Rp 25.000</strong>.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/daftar"
                className="inline-flex min-h-12 items-center gap-2 rounded-2xl bg-white px-7 text-sm font-black text-slate-950 transition hover:bg-slate-100"
              >
                Daftar gratis <ArrowRight size={16} />
              </Link>
              <Link
                href="/harga"
                className="inline-flex min-h-12 items-center gap-2 rounded-2xl border border-white/20 px-7 text-sm font-bold text-white transition hover:bg-white/10"
              >
                Lihat paket berbayar
              </Link>
            </div>
          </div>
        </section>

        {/* ── FAQ ──────────────────────────────────────────────── */}
        <section className="bg-white px-5 py-20 sm:px-8 lg:py-24">
          <div className="mx-auto max-w-2xl">
            <div className="mb-10 text-center">
              <p className="text-xs font-black uppercase tracking-widest text-slate-400">FAQ</p>
              <h2 className="mt-3 text-3xl font-black text-slate-950">Pertanyaan umum</h2>
            </div>

            <div className="divide-y divide-slate-100">
              {FAQS.map((faq, i) => (
                <details key={i} className="group py-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
                    <span className="text-sm font-bold text-slate-900">{faq.q}</span>
                    <ChevronDown size={16} className="shrink-0 text-slate-400 transition-transform group-open:rotate-180" />
                  </summary>
                  <p className="mt-3 text-sm leading-7 text-slate-500">{faq.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

      </main>

      <SiteFooter />
    </div>
  );
}

/* ── Sub-components ─────────────────────────────────────────────────── */

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <p className="text-2xl font-black text-slate-950">{value}</p>
      <p className="mt-0.5 text-xs font-semibold text-slate-400">{label}</p>
    </div>
  );
}

function PricingCard({
  name, price, cadence, earlyBird, features, cta, highlight,
}: {
  name: string; price: string; cadence: string; earlyBird?: string;
  features: string[]; cta: { href: string; label: string }; highlight: boolean;
}) {
  return (
    <div className={`relative flex flex-col rounded-2xl border bg-white p-6 ${
      highlight ? "border-slate-950 shadow-lg" : "border-slate-200"
    }`}>
      {highlight && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-slate-950 px-3 py-1 text-[11px] font-bold text-white">
          Populer
        </span>
      )}
      {earlyBird && (
        <span className="mb-3 inline-flex w-fit items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-1 text-[10px] font-bold text-amber-700">
          <Zap size={9} /> {earlyBird}
        </span>
      )}
      <p className="text-sm font-black text-slate-900">{name}</p>
      <p className="mt-1.5 text-2xl font-black text-slate-950">
        {price} <span className="text-xs font-semibold text-slate-400">/ {cadence}</span>
      </p>
      <ul className="mt-4 flex flex-1 flex-col gap-2.5">
        {features.map((f) => (
          <li key={f} className="flex items-center gap-2 text-xs font-semibold text-slate-600">
            <CheckCircle2 size={14} className="shrink-0 text-emerald-500" />
            {f}
          </li>
        ))}
      </ul>
      <Link
        href={cta.href}
        className={`mt-5 block rounded-xl py-2.5 text-center text-sm font-black transition ${
          highlight
            ? "bg-slate-950 text-white hover:bg-slate-800"
            : "border border-slate-200 text-slate-700 hover:bg-slate-50"
        }`}
      >
        {cta.label}
      </Link>
    </div>
  );
}
