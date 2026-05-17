"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  ChevronRight,
  Flame,
  LayoutDashboard,
  Target,
  TrendingUp,
  Zap,
  FileText,
  Info,
} from "lucide-react";
import type { AppSession } from "@/lib/session-codec";
import type { StudentPaymentTransaction } from "@/lib/student-transactions";
import { storageKeys } from "@/lib/site-config";
import { ptnDeadlines, promoSlides } from "@/components/student-dashboard-data";

// ─── types ────────────────────────────────────────────────────────────────────

type TryoutResult = {
  paketTitle?: string;
  skor: number;
  benar: number;
  salah: number;
  kosong: number;
  total: number;
  createdAt?: string;
};

// ─── helpers ──────────────────────────────────────────────────────────────────

function CircularProgress({ pct, size = 96 }: { pct: number; size?: number }) {
  const r = (size - 12) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} stroke="#E6F0FF" strokeWidth={10} fill="none" />
      <circle
        cx={size / 2} cy={size / 2} r={r}
        stroke="#0A66FF" strokeWidth={10} fill="none"
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        className="transition-all duration-700"
      />
    </svg>
  );
}

function BarProgress({ pct, color = "bg-[#0A66FF]" }: { pct: number; color?: string }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
      <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

const DAYS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

function StreakDots({ streak }: { streak: number }) {
  return (
    <div className="mt-3 flex gap-1.5">
      {DAYS.map((d, i) => (
        <div key={d} className="flex flex-col items-center gap-1">
          <div className={`flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold ${
            i < streak % 7 ? "bg-[#0A66FF] text-white" : "bg-slate-100 text-slate-300"
          }`}>
            {i < streak % 7 ? "✓" : ""}
          </div>
          <span className="text-[9px] font-semibold text-slate-400">{d}</span>
        </div>
      ))}
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 11) return "Selamat pagi";
  if (h < 15) return "Selamat siang";
  if (h < 18) return "Selamat sore";
  return "Selamat malam";
}

// ─── quick actions ────────────────────────────────────────────────────────────

const QUICK_ACTIONS = [
  {
    href: "/siswa/tryout",
    icon: <Zap size={20} />,
    label: "Mulai Tryout",
    sub: "Latihan soal",
    color: "bg-[#0A66FF]",
    textColor: "text-[#0A66FF]",
    bg: "bg-blue-50",
  },
  {
    href: "/siswa/belajar",
    icon: <BookOpen size={20} />,
    label: "Buka Materi",
    sub: "Modul belajar",
    color: "bg-emerald-500",
    textColor: "text-emerald-700",
    bg: "bg-emerald-50",
  },
  {
    href: "/siswa/jadwal",
    icon: <CalendarDays size={20} />,
    label: "Jadwal Hari Ini",
    sub: "Rencana belajar",
    color: "bg-violet-500",
    textColor: "text-violet-700",
    bg: "bg-violet-50",
  },
  {
    href: "/siswa/info-ptn",
    icon: <Info size={20} />,
    label: "Info PTN",
    sub: "Deadline & jadwal",
    color: "bg-amber-500",
    textColor: "text-amber-700",
    bg: "bg-amber-50",
  },
];

// ─── main component ───────────────────────────────────────────────────────────

export function StudentDashboard({
  session,
  transactions,
}: {
  session: AppSession | null;
  transactions: StudentPaymentTransaction[];
}) {
  const [lastResult, setLastResult] = useState<TryoutResult | null>(null);
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    const t = window.setInterval(() => setSlide((p) => (p + 1) % promoSlides.length), 4500);
    return () => window.clearInterval(t);
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKeys.latestTryoutResult);
      if (raw) setLastResult(JSON.parse(raw) as TryoutResult);
    } catch {}
  }, []);

  const firstName = session?.name?.split(" ")[0] ?? "Pejuang";
  const lastScore = lastResult ? lastResult.skor : null;
  const lastTotal = lastResult?.total ?? 100;
  const lastPct = lastScore !== null ? Math.round((lastScore / (lastTotal * 4)) * 100) : null;
  const hasPaid = transactions.some((t) => t.status === "paid");

  const progress = { materi: 68, tryout: 75, pembahasan: 60 };
  const overall = Math.round((progress.materi + progress.tryout + progress.pembahasan) / 3);
  const streak = 12;

  const topics = [
    { label: "Matematika", pct: 40, color: "bg-red-400" },
    { label: "Fisika", pct: 55, color: "bg-orange-400" },
    { label: "Kimia", pct: 60, color: "bg-yellow-400" },
  ];

  const recentActivities = [
    {
      id: 1,
      icon: <TrendingUp size={15} className="text-[#0A66FF]" />,
      label: lastResult?.paketTitle ?? "Tryout Mandiri #5",
      sub: lastScore !== null ? `Skor ${lastScore}` : "Belum ada hasil",
      date: lastResult?.createdAt
        ? new Date(lastResult.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
        : "–",
      href: "/siswa/tryout",
    },
    {
      id: 2,
      icon: <BookOpen size={15} className="text-emerald-600" />,
      label: "Pembahasan Termodinamika",
      sub: "Materi Fisika",
      date: "11 Mei 2026",
      href: "/siswa/belajar",
    },
  ];

  const todaySchedule = [
    { time: "19:00 – 21:00", label: "Tryout TPS Kuantitatif", href: "/siswa/tryout" },
    { time: "21:00 – 22:00", label: "Pembahasan Kimia Organik", href: "/siswa/belajar" },
  ];

  const upcomingDeadlines = ptnDeadlines.slice(0, 3);

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 md:px-8">
      <style>{`@keyframes marquee{0%{transform:translateX(100vw)}100%{transform:translateX(-100%)}}`}</style>

      {/* ── Header ── */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <LayoutDashboard size={15} className="text-[#0A66FF]" />
            <span className="text-xs font-bold uppercase tracking-wide text-[#0A66FF]">Dashboard</span>
          </div>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-900 md:text-3xl">
            {getGreeting()}, {firstName}! 👋
          </h1>
          <p className="mt-0.5 text-sm font-semibold text-slate-500">
            Semangat hari ini — satu langkah lebih dekat ke kampus impian.
          </p>
        </div>
        {!hasPaid && (
          <Link
            href="/harga"
            className="hidden shrink-0 items-center gap-1.5 rounded-2xl bg-[#0A66FF] px-4 py-2.5 text-sm font-black text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-[#0052D6] sm:flex"
          >
            Upgrade Paket <ArrowRight size={14} />
          </Link>
        )}
      </div>

      {/* ── Running text ── */}
      <div className="mb-5 overflow-hidden rounded-2xl bg-[#0D1B2A] px-4 py-3 text-xs text-white">
        <div className="flex items-center gap-3">
          <span className="shrink-0 text-amber-300">📢</span>
          <div className="relative flex-1 overflow-hidden">
            <div
              className="inline-block whitespace-nowrap font-semibold tracking-wide"
              style={{ animation: "marquee 28s linear infinite" }}
            >
              INFO PENTING: Pendaftaran SM-ITB ditutup dalam 7 hari.&nbsp;&nbsp;|&nbsp;&nbsp;
              Promo terbatas: gunakan kode LOLOSPTN26.&nbsp;&nbsp;|&nbsp;&nbsp;
              Tryout Akbar Nasional serentak tanggal 25 Mei 2026.&nbsp;&nbsp;|&nbsp;&nbsp;
              SIMAK UI dibuka 8 Mei — daftarkan dirimu sekarang!
            </div>
          </div>
        </div>
      </div>

      {/* ── Quick actions ── */}
      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {QUICK_ACTIONS.map((a) => (
          <Link
            key={a.href}
            href={a.href}
            className="group flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${a.bg} ${a.textColor}`}>
              {a.icon}
            </div>
            <div>
              <p className="text-sm font-black text-slate-900">{a.label}</p>
              <p className="text-xs text-slate-400">{a.sub}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* ── Promo slider ── */}
      <div className="relative mb-5 h-48 overflow-hidden rounded-2xl bg-slate-900 shadow-sm md:h-56">
        {promoSlides.map((s, i) => (
          <div
            key={s.title}
            className={`absolute inset-0 transition-all duration-700 ${
              i === slide ? "z-10 opacity-100" : "z-0 opacity-0"
            }`}
          >
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${s.image})` }} />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-5 text-white md:p-6">
              <p className="text-base font-black leading-tight md:text-lg">{s.title}</p>
              <p className="mt-1 text-sm font-semibold text-white/80">{s.desc}</p>
            </div>
          </div>
        ))}
        <div className="absolute bottom-3 right-4 z-20 flex gap-1.5">
          {promoSlides.map((s, i) => (
            <button
              key={s.title}
              type="button"
              aria-label={`Slide ${i + 1}`}
              onClick={() => setSlide(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === slide ? "w-5 bg-white" : "w-1.5 bg-white/50 hover:bg-white/80"
              }`}
            />
          ))}
        </div>
      </div>

      {/* ── Top grid: Progress + Streak ── */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Progress Belajar */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-wide text-slate-400">Progress Belajar</p>
              <p className="mt-0.5 text-sm font-semibold text-slate-500">Minggu ini</p>
            </div>
            <span className="rounded-xl bg-blue-50 px-2.5 py-1 text-xs font-black text-[#0A66FF]">{overall}%</span>
          </div>

          <div className="mt-5 flex items-center gap-6">
            <div className="relative shrink-0">
              <CircularProgress pct={overall} size={88} />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-black text-slate-900">{overall}%</span>
              </div>
            </div>

            <div className="flex-1 space-y-3.5">
              {[
                { label: "Materi", pct: progress.materi, color: "bg-[#0A66FF]" },
                { label: "Tryout", pct: progress.tryout, color: "bg-emerald-500" },
                { label: "Pembahasan", pct: progress.pembahasan, color: "bg-violet-500" },
              ].map((item) => (
                <div key={item.label}>
                  <div className="mb-1.5 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className={`h-2 w-2 rounded-full ${item.color}`} />
                      <span className="text-xs font-bold text-slate-600">{item.label}</span>
                    </div>
                    <span className="text-xs font-black text-slate-700">{item.pct}%</span>
                  </div>
                  <BarProgress pct={item.pct} color={item.color} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Streak Belajar */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <p className="text-xs font-black uppercase tracking-wide text-slate-400">Streak Belajar</p>
          <p className="mt-0.5 text-sm font-semibold text-slate-500">Konsisten itu kunci!</p>

          <div className="mt-5 flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 shadow-lg shadow-orange-200">
              <Flame size={30} className="text-white" />
            </div>
            <div>
              <p className="text-4xl font-black text-slate-900">{streak}</p>
              <p className="text-sm font-bold text-slate-500">Hari berturut-turut 🔥</p>
            </div>
          </div>

          <StreakDots streak={streak} />
        </div>
      </div>

      {/* ── Middle grid: Tryout + Topik ── */}
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {/* Tryout Terakhir */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <p className="text-xs font-black uppercase tracking-wide text-slate-400">Tryout Terakhir</p>
          <p className="mt-0.5 text-sm font-semibold text-slate-500 truncate">
            {lastResult?.paketTitle ?? "Belum ada tryout"}
          </p>

          {lastScore !== null ? (
            <>
              <div className="mt-4 flex items-end gap-3">
                <p className="text-4xl font-black text-slate-900">{lastScore}</p>
                <p className="mb-1 text-base font-bold text-slate-400">/ {lastTotal * 4}</p>
                <span className="mb-1 rounded-xl bg-emerald-100 px-3 py-1 text-sm font-black text-emerald-700">
                  {lastPct}%
                </span>
              </div>
              <div className="mt-3 flex gap-5 text-sm font-semibold">
                <span className="text-emerald-600">✓ {lastResult?.benar ?? 0} Benar</span>
                <span className="text-red-500">✗ {lastResult?.salah ?? 0} Salah</span>
                <span className="text-slate-400">– {lastResult?.kosong ?? 0} Kosong</span>
              </div>
              <Link
                href="/siswa/rasionalisasi"
                className="mt-4 inline-flex items-center gap-1 text-sm font-black text-[#0A66FF] hover:underline"
              >
                Lihat Analisis <ArrowRight size={14} />
              </Link>
            </>
          ) : (
            <div className="mt-5">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50">
                <FileText size={26} className="text-[#0A66FF]" />
              </div>
              <p className="mt-3 text-sm text-slate-500">Kamu belum mengerjakan tryout apapun.</p>
              <Link
                href="/siswa/tryout"
                className="mt-3 inline-flex items-center gap-1 text-sm font-black text-[#0A66FF] hover:underline"
              >
                Mulai Tryout <ArrowRight size={14} />
              </Link>
            </div>
          )}
        </div>

        {/* Topik Perlu Ditingkatkan */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <p className="text-xs font-black uppercase tracking-wide text-slate-400">Topik Perlu Ditingkatkan</p>
          <p className="mt-0.5 text-sm font-semibold text-slate-500">Berdasarkan hasil tryout</p>

          <div className="mt-5 space-y-4">
            {topics.map((t) => (
              <div key={t.label}>
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-700">{t.label}</span>
                  <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-xs font-black text-slate-600">{t.pct}%</span>
                </div>
                <BarProgress pct={t.pct} color={t.color} />
              </div>
            ))}
          </div>

          <Link
            href="/siswa/belajar"
            className="mt-6 inline-flex items-center gap-1 text-sm font-black text-[#0A66FF] hover:underline"
          >
            Buka Materi <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* ── Bottom grid: Aktivitas + Jadwal + Deadline ── */}
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        {/* Aktivitas Terbaru */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <p className="mb-4 text-sm font-black text-slate-900">Aktivitas Terbaru</p>
          <div className="space-y-2.5">
            {recentActivities.map((act) => (
              <Link
                key={act.id}
                href={act.href}
                className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 transition hover:bg-slate-50"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-100">
                  {act.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-slate-800">{act.label}</p>
                  <p className="text-xs text-slate-400">{act.sub} · {act.date}</p>
                </div>
                <ChevronRight size={13} className="shrink-0 text-slate-300" />
              </Link>
            ))}
          </div>
        </div>

        {/* Jadwal Hari Ini */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm font-black text-slate-900">Jadwal Hari Ini</p>
            <Link href="/siswa/jadwal" className="text-xs font-bold text-[#0A66FF] hover:underline">
              Semua →
            </Link>
          </div>
          <div className="space-y-2.5">
            {todaySchedule.map((s) => (
              <Link
                key={s.time}
                href={s.href}
                className="flex items-start gap-3 rounded-xl border border-slate-100 p-3 transition hover:bg-slate-50"
              >
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-50">
                  <CalendarDays size={14} className="text-[#0A66FF]" />
                </div>
                <div>
                  <p className="text-xs font-black text-[#0A66FF]">{s.time}</p>
                  <p className="mt-0.5 text-sm font-bold text-slate-800">{s.label}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Deadline PTN */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm font-black text-slate-900">Deadline Terdekat</p>
            <Link href="/siswa/info-ptn" className="text-xs font-bold text-[#0A66FF] hover:underline">
              Semua →
            </Link>
          </div>
          <div className="space-y-2.5">
            {upcomingDeadlines.map((ptn) => (
              <div
                key={ptn.id}
                className="flex items-center justify-between gap-2 rounded-xl border border-slate-100 p-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-slate-800">{ptn.shortName}</p>
                  <p className="mt-0.5 text-xs text-slate-400">Tutup {ptn.closeAt}</p>
                </div>
                <span className={`shrink-0 rounded-lg px-2 py-1 text-[10px] font-black ${ptn.color}`}>
                  {ptn.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CTA upgrade jika belum bayar ── */}
      {!hasPaid && (
        <div className="mt-5 overflow-hidden rounded-2xl bg-gradient-to-r from-[#0A66FF] to-[#0052D6] p-6 text-white shadow-lg shadow-blue-600/20">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-black text-lg">Unlock fitur lengkap</p>
              <p className="mt-1 text-sm font-semibold text-blue-100">
                1.250+ soal, materi premium, jadwal personal, dan analitik mendalam.
              </p>
            </div>
            <Link
              href="/harga"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-white px-5 py-3 text-sm font-black text-[#0A66FF] transition hover:bg-blue-50"
            >
              Lihat Paket <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      )}

      {/* target padding bottom */}
      <div className="h-8" />
    </main>
  );
}
