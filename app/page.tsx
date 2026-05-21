import type { ReactNode } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Bell,
  BookOpen,
  Bot,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  GraduationCap,
  LineChart,
  PlayCircle,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  Zap,
} from "lucide-react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { site } from "@/lib/site-config";
import { getHomeContent } from "@/lib/public-content";

const PTN_LIST = [
  "SIMAK UI", "SM-ITB", "UM UGM", "SMUP UNPAD",
  "UM UNDIP", "UM UNAIR", "UM IPB", "UM UNHAS", "UM UB",
];

const PTKIN_LIST = [
  "UM PTKIN", "UIN Jakarta", "UIN Bandung", "UIN Yogyakarta",
  "UIN Malang", "UIN Surabaya", "UIN Medan", "UIN Makassar",
];

const TESTIMONIALS = [
  {
    name: "Farhan A.",
    school: "SMAN 5 Jakarta",
    jalur: "SIMAK UI",
    text: "Berkat Pastilulus, skor tryout SIMAK UI saya naik dari 620 ke 710 dalam 3 minggu. Pembahasannya detail banget!",
    score: "710",
    avatar: "F",
    color: "bg-[#0A66FF]",
  },
  {
    name: "Nadia R.",
    school: "MAN 2 Bandung",
    jalur: "UM PTKIN",
    text: "Modul UM-PTKIN A-Z-nya sangat membantu. Sub tes Penalaran Akademik dan Agama Islam jadi lebih mudah dipahami.",
    score: "680",
    avatar: "N",
    color: "bg-emerald-600",
  },
  {
    name: "Rizky P.",
    school: "SMAN 1 Surabaya",
    jalur: "UM UGM",
    text: "Deadline tracker PTN-nya bikin saya nggak ketinggalan satu pun jadwal. Lolos UM UGM akhirnya!",
    score: "732",
    avatar: "R",
    color: "bg-violet-600",
  },
];

const FAQS = [
  {
    q: "Apakah Pastilulus mendukung jalur UM PTN dan UM PTKIN?",
    a: "Ya, keduanya. Kami menyediakan soal, materi, dan tryout untuk Ujian Mandiri PTN (SIMAK UI, SM-ITB, UM UGM, dan 9 PTN lain) sekaligus UM-PTKIN 2026 (39 UIN di seluruh Indonesia) — semua dalam satu platform.",
  },
  {
    q: "Berapa lama akses paket berlaku setelah pembayaran?",
    a: "Paket Belajar berlaku 6 bulan sejak tanggal aktivasi. Paket Belajar Full berlaku selamanya — tidak perlu perpanjangan. Keduanya memberikan akses penuh ke semua tryout dan modul materi.",
  },
  {
    q: "Apa itu harga Early Bird dan bagaimana cara kerjanya?",
    a: "Harga early bird adalah harga spesial yang berlaku untuk pendaftar pertama: 500 slot untuk paket Belajar (Rp 25.000) dan 100 slot untuk Belajar Full (Rp 75.000). Setelah slot habis, harga naik otomatis 5% setiap kelompok pembeli sampai harga normal. Semakin cepat daftar, semakin hemat.",
  },
  {
    q: "Apakah bisa dicoba gratis dulu?",
    a: "Bisa. Paket Gratis memberikan akses ke 1 paket tryout UM PTN, 1 paket tryout UM PTKIN, dan modul materi pertama dari tiap jalur — tanpa batas waktu dan tanpa kartu kredit.",
  },
  {
    q: "Bagaimana cara kerja AI tutor-nya?",
    a: "AI tutor berbasis Groq AI (model Llama 3) yang terlatih memahami konteks soal ujian mandiri PTN dan UM-PTKIN. Kamu bisa tanya soal, minta pembahasan ulang, atau diskusi strategi belajar kapanpun.",
  },
];

export default async function HomePage() {
  const homeContent = await getHomeContent({
    badge: "Khusus pejuang Ujian Mandiri PTN & UM PTKIN 2026",
    headline: `${site.promise.split(",")[0]}, masa depan pasti cerah.`,
    subheadline: `${site.name} bantu kamu latihan dengan pola soal mandiri PTN dan UM-PTKIN, paham pembahasan lebih cepat, dan tidak ketinggalan deadline kampus impian.`,
    cta: "Mulai gratis sekarang",
  });

  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-900">
      <SiteHeader />

      <main className="flex-1">
        {/* ── Hero ── */}
        <section className="relative overflow-hidden bg-[#F8FBFF]">
          <div className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,#0A66FF,#10B981,#F59E0B,#EF4444,#0A66FF)]" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(15,23,42,0.035)_1px,transparent_1px),linear-gradient(180deg,rgba(15,23,42,0.035)_1px,transparent_1px)] bg-[size:56px_56px]" />
          <div className="pointer-events-none absolute -top-40 right-0 h-[600px] w-[600px] rounded-full bg-blue-100/60 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 left-0 h-[400px] w-[400px] rounded-full bg-emerald-100/50 blur-3xl" />

          <div className="relative mx-auto max-w-7xl px-5 pb-20 pt-16 sm:px-8 sm:pb-24 sm:pt-20 lg:pb-28 lg:pt-24">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-4 py-2 text-sm font-black text-[#0A66FF] shadow-sm">
              <Sparkles size={15} /> {homeContent.badge}
            </div>

            <div className="mt-7 flex flex-col gap-14 lg:flex-row lg:items-center">
              <div className="flex-1">
                <h1 className="max-w-3xl text-5xl font-black leading-[1.05] tracking-tight text-slate-950 sm:text-6xl lg:text-[5.2rem]">
                  {homeContent.headline}
                </h1>

                <p className="mt-6 max-w-2xl text-xl leading-9 text-slate-600">
                  {homeContent.subheadline}
                </p>

                <div className="mt-6 flex flex-wrap gap-2.5">
                  <TrustPoint>Try out mirip ujian asli</TrustPoint>
                  <TrustPoint>Jalur UM PTN & UM PTKIN</TrustPoint>
                  <TrustPoint>Mulai dari Rp 0</TrustPoint>
                </div>

                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    href="/daftar"
                    className="inline-flex min-h-14 items-center gap-2 rounded-2xl bg-[#0A66FF] px-8 text-base font-black text-white shadow-xl shadow-blue-600/25 transition hover:-translate-y-0.5 hover:bg-[#0052D6] hover:shadow-blue-600/30"
                  >
                    {homeContent.cta} <ArrowRight size={18} />
                  </Link>
                  <Link
                    href="/siswa/tryout"
                    className="inline-flex min-h-14 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-8 text-base font-black text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50"
                  >
                    <PlayCircle size={18} className="text-[#0A66FF]" /> Coba tryout gratis
                  </Link>
                </div>

                <div className="mt-10 flex flex-wrap gap-6">
                  <Metric value="1.800+" label="soal latihan" />
                  <div className="w-px bg-slate-200" />
                  <Metric value="2 Jalur" label="UM PTN & UM PTKIN" />
                  <div className="w-px bg-slate-200" />
                  <Metric value="39" label="UIN terdaftar" />
                  <div className="w-px bg-slate-200" />
                  <Metric value="24/7" label="AI tutor aktif" />
                </div>
              </div>

              {/* dashboard preview card */}
              <div className="w-full max-w-md lg:max-w-[420px]">
                <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-300/50 ring-1 ring-slate-100">
                  <div className="bg-slate-950 px-6 py-5 text-white">
                    <p className="text-xs font-black uppercase tracking-widest text-blue-300">Dashboard</p>
                    <p className="mt-1 text-2xl font-black">Target: SIMAK UI + UIN 2026</p>
                    <div className="mt-3 flex items-center justify-between rounded-2xl bg-white/10 px-4 py-3">
                      <span className="text-sm text-slate-300">Skor simulasi terakhir</span>
                      <span className="text-3xl font-black">682</span>
                    </div>
                  </div>

                  <div className="space-y-4 p-6">
                    <ProgressRow label="Try out UM PTN" pct={82} color="bg-[#0A66FF]" />
                    <ProgressRow label="Try out UM PTKIN" pct={74} color="bg-emerald-500" />
                    <ProgressRow label="Materi & Logbook" pct={63} color="bg-amber-500" />
                  </div>

                  <div className="space-y-2.5 border-t border-slate-100 px-6 pb-6 pt-4">
                    <PlanItem icon={<LineChart size={16} />} title="Try out SIMAK UI — 100 soal" tone="blue" />
                    <PlanItem icon={<Target size={16} />} title="Try out UM PTKIN HOTS — 121 soal" tone="emerald" />
                    <PlanItem icon={<Bell size={16} />} title="Cek deadline UI, ITB, UGM, UIN" tone="amber" />
                  </div>

                  <div className="px-6 pb-6">
                    <Link
                      href="/harga"
                      className="flex min-h-12 items-center justify-center rounded-2xl bg-[#0A66FF] text-sm font-black text-white transition hover:bg-[#0052D6]"
                    >
                      Lihat paket belajar <ArrowRight size={15} className="ml-1.5" />
                    </Link>
                  </div>
                </div>

                <div className="absolute right-6 top-6 hidden rounded-2xl border border-emerald-200 bg-white px-4 py-3 shadow-xl lg:block">
                  <p className="text-xs font-bold text-slate-400">Status paket</p>
                  <p className="mt-0.5 flex items-center gap-1.5 text-sm font-black text-emerald-700">
                    <ShieldCheck size={15} /> Aktif belajar
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Jalur strip ── */}
        <div className="border-y border-slate-100 bg-slate-50 py-5">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <div className="flex flex-col items-center gap-5 md:flex-row md:gap-8">
              {/* PTN */}
              <div className="flex-1">
                <p className="mb-3 text-center text-[10px] font-black uppercase tracking-widest text-[#0A66FF]">
                  Jalur 1 — Ujian Mandiri PTN
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {PTN_LIST.map((ptn) => (
                    <span key={ptn} className="rounded-full border border-blue-100 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 shadow-sm">
                      {ptn}
                    </span>
                  ))}
                </div>
              </div>

              <div className="hidden h-16 w-px bg-slate-200 md:block" />
              <div className="block h-px w-full bg-slate-200 md:hidden" />

              {/* PTKIN */}
              <div className="flex-1">
                <p className="mb-3 text-center text-[10px] font-black uppercase tracking-widest text-emerald-600">
                  Jalur 2 — UM PTKIN (39 UIN)
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {PTKIN_LIST.map((ptn) => (
                    <span key={ptn} className="rounded-full border border-emerald-100 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 shadow-sm">
                      {ptn}
                    </span>
                  ))}
                  <span className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 shadow-sm">
                    +31 UIN lainnya
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Features ── */}
        <section id="fitur" className="mx-auto max-w-7xl scroll-mt-28 px-5 py-20 sm:px-8 lg:py-24">
          <div className="text-center">
            <p className="text-sm font-black uppercase tracking-widest text-[#0A66FF]">Kenapa {site.name}?</p>
            <h2 className="mt-3 text-4xl font-black leading-tight text-slate-950 sm:text-5xl">
              Satu platform, dua jalur ujian.
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-9 text-slate-600">
              Ujian mandiri PTN dan UM-PTKIN punya pola, jadwal, dan strategi yang beda dari SNBT. Kamu butuh sistem yang langsung mengarah ke kampus target.
            </p>
          </div>

          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={<GraduationCap size={22} />}
              badge="Soal UM PTN"
              title="12 kampus PTN terkover"
              body="Soal dan strategi untuk SIMAK UI, SM-ITB, UM UGM, SMUP UNPAD, UM UNDIP, dan 7 PTN lain. Lebih dari 1.200 soal siap pakai."
              color="blue"
            />
            <FeatureCard
              icon={<Target size={22} />}
              badge="UM PTKIN"
              title="39 UIN dalam satu platform"
              body="5 paket tryout HOTS + 5 modul materi A-Z khusus UM-PTKIN 2026. Sub tes Penalaran Akademik, Matematika, Literasi, dan Agama Islam."
              color="emerald"
            />
            <FeatureCard
              icon={<BookOpen size={22} />}
              badge="Materi"
              title="Masterbook & logbook progres"
              body="Belajar dari masterbook, rangkuman, diagram, dan latihan soal. Catat error log di logbook agar setiap kesalahan jadi remedial."
              color="violet"
            />
            <FeatureCard
              icon={<Bot size={22} />}
              badge="AI Tutor"
              title="Tanya AI saat stuck"
              body="AI tutor berbasis Groq AI aktif 24/7. Minta pembahasan ulang, strategi soal, atau diskusi materi kapanpun."
              color="cyan"
            />
            <FeatureCard
              icon={<CalendarDays size={22} />}
              badge="Deadline"
              title="Tracker PTN & PTKIN terintegrasi"
              body="Pantau jadwal buka dan tutup pendaftaran PTN dan PTKIN target secara bersamaan. Tidak ada lagi yang ketinggalan."
              color="amber"
            />
            <FeatureCard
              icon={<TrendingUp size={22} />}
              badge="Harga"
              title="Early bird — terbatas"
              body="Belajar Rp 25.000 (500 slot) dan Belajar Full Rp 75.000 (100 slot). Harga naik otomatis setelah kuota habis. Daftar sekarang lebih hemat."
              color="rose"
            />
          </div>
        </section>

        {/* ── Pricing teaser ── */}
        <section className="border-y border-slate-100 bg-slate-50 py-16">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <div className="text-center">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1.5 text-xs font-black uppercase tracking-wide text-amber-800">
                <Zap size={12} /> Harga Early Bird
              </span>
              <h2 className="mt-4 text-3xl font-black text-slate-950 sm:text-4xl">3 paket. Mulai dari Rp 0.</h2>
              <p className="mx-auto mt-3 max-w-xl text-slate-600">
                Paket Gratis untuk merasakan platformnya. Belajar dan Belajar Full untuk akses penuh — harga spesial selama kuota early bird masih ada.
              </p>
            </div>

            <div className="mt-10 grid gap-5 sm:grid-cols-3">
              <PricingTeaser name="Gratis" price="Rp 0" cadence="selamanya" highlight={false} features={["1 tryout UM PTN", "1 tryout UM PTKIN", "Modul materi pertama"]} cta={{ href: "/daftar", label: "Daftar gratis" }} />
              <PricingTeaser name="Belajar" price="Rp 25.000" cadence="6 bulan" highlight={true} earlyBird="500 slot early bird" features={["Semua tryout UM PTN", "Semua tryout UM PTKIN", "Semua modul materi"]} cta={{ href: "/pembayaran?paket=belajar", label: "Mulai Belajar" }} />
              <PricingTeaser name="Belajar Full" price="Rp 75.000" cadence="selamanya" highlight={false} earlyBird="100 slot early bird" features={["Semua fitur Belajar", "Masa aktif selamanya", "Prioritas support"]} cta={{ href: "/pembayaran?paket=pro", label: "Upgrade Full" }} />
            </div>

            <p className="mt-6 text-center text-sm font-semibold text-slate-500">
              Harga naik setelah slot early bird habis.{" "}
              <Link href="/harga" className="font-black text-[#0A66FF] hover:underline">
                Lihat detail harga →
              </Link>
            </p>
          </div>
        </section>

        {/* ── Testimonials ── */}
        <section className="py-20">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <div className="text-center">
              <p className="text-sm font-black uppercase tracking-widest text-[#0A66FF]">Testimonial</p>
              <h2 className="mt-3 text-4xl font-black text-slate-950">Mereka sudah membuktikan.</h2>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {TESTIMONIALS.map((t) => (
                <div key={t.name} className="flex flex-col rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                  <div className="flex items-center gap-1 text-amber-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={14} fill="currentColor" />
                    ))}
                  </div>
                  <p className="mt-4 flex-1 text-base leading-8 text-slate-600">&ldquo;{t.text}&rdquo;</p>
                  <div className="mt-6 flex items-center gap-3 border-t border-slate-100 pt-5">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${t.color} text-sm font-black text-white`}>
                      {t.avatar}
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-900">{t.name}</p>
                      <p className="text-xs text-slate-400">{t.school} · {t.jalur} · Skor {t.score}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA Banner ── */}
        <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-[#0D1B2A] px-8 py-12 text-white shadow-2xl sm:px-12 sm:py-16">
            <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-[#0A66FF]/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-10 -left-10 h-48 w-48 rounded-full bg-emerald-500/15 blur-2xl" />

            <div className="relative flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
              <div className="max-w-xl">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/20 px-3 py-1.5 text-xs font-black uppercase tracking-wide text-amber-300">
                  <Zap size={11} /> Harga early bird masih tersedia
                </span>
                <h2 className="mt-4 text-3xl font-black leading-tight sm:text-4xl">
                  Mulai dulu. Bayar nanti kalau cocok.
                </h2>
                <p className="mt-4 text-lg leading-8 text-slate-300">
                  Coba gratis untuk rasakan alur try out UM PTN dan UM PTKIN. Kalau butuh akses penuh,
                  paket Belajar mulai <strong className="text-white">Rp 25.000</strong> — harga naik setelah 500 slot habis.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/daftar"
                  className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-[#0A66FF] px-8 text-base font-black text-white shadow-lg shadow-blue-900/40 transition hover:bg-[#0052D6]"
                >
                  Daftar gratis <ArrowRight size={18} />
                </Link>
                <Link
                  href="/harga"
                  className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-8 text-base font-black text-white backdrop-blur transition hover:bg-white/20"
                >
                  Lihat harga early bird
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="border-t border-slate-100 bg-slate-50 py-20">
          <div className="mx-auto max-w-3xl px-5 sm:px-8">
            <div className="text-center">
              <p className="text-sm font-black uppercase tracking-widest text-[#0A66FF]">FAQ</p>
              <h2 className="mt-3 text-4xl font-black text-slate-950">Pertanyaan umum</h2>
            </div>

            <div className="mt-10 divide-y divide-slate-200 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              {FAQS.map((faq, i) => (
                <details key={i} className="group px-6 py-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
                    <span className="text-base font-bold text-slate-900">{faq.q}</span>
                    <ChevronDown size={18} className="shrink-0 text-slate-400 transition group-open:rotate-180" />
                  </summary>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{faq.a}</p>
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

/* ── helpers ── */

function TrustPoint({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm">
      <CheckCircle2 size={15} className="shrink-0 text-emerald-500" />
      {children}
    </div>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="text-3xl font-black text-slate-950">{value}</p>
      <p className="mt-1 text-sm font-semibold text-slate-500">{label}</p>
    </div>
  );
}

function ProgressRow({ label, pct, color = "bg-[#0A66FF]" }: { label: string; pct: number; color?: string }) {
  return (
    <div>
      <div className="mb-2 flex justify-between text-sm font-semibold text-slate-600">
        <span>{label}</span>
        <span className="font-black text-slate-800">{pct}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function PlanItem({ icon, title, tone }: { icon: ReactNode; title: string; tone: "blue" | "emerald" | "amber" }) {
  const toneClass = {
    blue: "bg-blue-50 text-[#0A66FF]",
    emerald: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
  }[tone];
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-100 p-3">
      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${toneClass}`}>{icon}</div>
      <p className="text-sm font-semibold text-slate-700">{title}</p>
    </div>
  );
}

const featureColorMap = {
  blue: { bg: "bg-blue-50", text: "text-[#0A66FF]", badge: "bg-blue-100 text-[#0A66FF]" },
  emerald: { bg: "bg-emerald-50", text: "text-emerald-700", badge: "bg-emerald-100 text-emerald-700" },
  violet: { bg: "bg-violet-50", text: "text-violet-700", badge: "bg-violet-100 text-violet-700" },
  amber: { bg: "bg-amber-50", text: "text-amber-700", badge: "bg-amber-100 text-amber-700" },
  rose: { bg: "bg-rose-50", text: "text-rose-700", badge: "bg-rose-100 text-rose-700" },
  cyan: { bg: "bg-cyan-50", text: "text-cyan-700", badge: "bg-cyan-100 text-cyan-700" },
} as const;

function FeatureCard({
  icon, badge, title, body, color,
}: {
  icon: ReactNode; badge: string; title: string; body: string; color: keyof typeof featureColorMap;
}) {
  const c = featureColorMap[color];
  return (
    <div className="group rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${c.bg} ${c.text}`}>{icon}</div>
      <span className={`mt-4 inline-block rounded-full px-2.5 py-1 text-[11px] font-black uppercase tracking-wide ${c.badge}`}>
        {badge}
      </span>
      <h3 className="mt-2 text-xl font-black text-slate-950">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-slate-600">{body}</p>
    </div>
  );
}

function PricingTeaser({
  name, price, cadence, highlight, earlyBird, features, cta,
}: {
  name: string; price: string; cadence: string; highlight: boolean;
  earlyBird?: string; features: string[]; cta: { href: string; label: string };
}) {
  return (
    <div className={`relative flex flex-col rounded-3xl border bg-white p-6 shadow-sm ${highlight ? "border-blue-500 ring-2 ring-blue-500/20" : "border-slate-200"}`}>
      {highlight && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
          Populer
        </span>
      )}
      {earlyBird && (
        <span className="mb-3 inline-flex w-fit items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-black uppercase text-amber-800">
          <Zap size={9} /> {earlyBird}
        </span>
      )}
      <h3 className="text-base font-black text-slate-900">{name}</h3>
      <p className="mt-2 text-2xl font-black text-slate-950">
        {price} <span className="text-sm font-semibold text-slate-500">/ {cadence}</span>
      </p>
      <ul className="mt-4 flex flex-1 flex-col gap-2 text-sm text-slate-600">
        {features.map((f) => (
          <li key={f} className="flex gap-2">
            <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-emerald-500" />
            {f}
          </li>
        ))}
      </ul>
      <Link
        href={cta.href}
        className={`mt-5 block rounded-2xl py-2.5 text-center text-sm font-black transition ${highlight ? "bg-blue-600 text-white hover:bg-blue-700" : "border border-slate-200 hover:bg-slate-50"}`}
      >
        {cta.label}
      </Link>
    </div>
  );
}
