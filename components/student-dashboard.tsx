"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import {
  ArrowRight,
  BookOpen,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  FileText,
  Info,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react";
import type { AppSession } from "@/lib/session-codec";
import type { StudentPaymentTransaction } from "@/lib/student-transactions";
import { formatIdr, formatTransactionDate } from "@/lib/student-transactions";
import { storageKeys } from "@/lib/site-config";
import { promoSlides, ptnDeadlines } from "@/components/student-dashboard-data";

type TryoutResult = {
  paketTitle?: string;
  skor: number;
  benar: number;
  salah: number;
  kosong: number;
  total: number;
  createdAt?: string;
};

const QUICK_ACTIONS = [
  {
    href: "/siswa/tryout",
    icon: Zap,
    label: "Mulai Tryout",
    sub: "Kerjakan paket soal",
    gradient: "from-blue-500 to-blue-700",
    bg: "bg-blue-50 hover:bg-blue-100",
    text: "text-blue-700",
    ring: "ring-blue-200",
  },
  {
    href: "/siswa/belajar",
    icon: BookOpen,
    label: "Buka Materi",
    sub: "Lanjutkan modul",
    gradient: "from-emerald-500 to-emerald-700",
    bg: "bg-emerald-50 hover:bg-emerald-100",
    text: "text-emerald-700",
    ring: "ring-emerald-200",
  },
  {
    href: "/siswa/transaksi",
    icon: CreditCard,
    label: "Transaksi",
    sub: "Cek pembayaran",
    gradient: "from-violet-500 to-violet-700",
    bg: "bg-violet-50 hover:bg-violet-100",
    text: "text-violet-700",
    ring: "ring-violet-200",
  },
  {
    href: "/siswa/info-ptn",
    icon: Info,
    label: "Info PTN",
    sub: "Jadwal seleksi",
    gradient: "from-amber-500 to-orange-600",
    bg: "bg-amber-50 hover:bg-amber-100",
    text: "text-amber-700",
    ring: "ring-amber-200",
  },
];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 11) return "Selamat pagi";
  if (h < 15) return "Selamat siang";
  if (h < 18) return "Selamat sore";
  return "Selamat malam";
}

function getGreetingEmoji() {
  const h = new Date().getHours();
  if (h < 11) return "☀️";
  if (h < 15) return "🌤️";
  if (h < 18) return "🌇";
  return "🌙";
}

function formatTryoutDate(value?: string) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function statusCopy(status: StudentPaymentTransaction["status"]) {
  if (status === "paid") return "Aktif";
  if (status === "pending") return "Menunggu";
  if (status === "failed") return "Gagal";
  return "Kedaluwarsa";
}

function statusClass(status: StudentPaymentTransaction["status"]) {
  if (status === "paid") return "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200";
  if (status === "pending") return "bg-amber-100 text-amber-700 ring-1 ring-amber-200";
  if (status === "failed") return "bg-rose-100 text-rose-700 ring-1 ring-rose-200";
  return "bg-slate-100 text-slate-600";
}

function buildRunningItems() {
  const openDeadlines = ptnDeadlines
    .filter((p) => p.status !== "Pendaftaran Selesai")
    .slice(0, 4)
    .map((p) => `${p.shortName}: tutup ${p.closeAt}`);
  return ["Cek ulang jadwal resmi kampus sebelum daftar", ...openDeadlines];
}

function EmptyState({
  icon,
  title,
  body,
  href,
  action,
}: {
  icon: ReactNode;
  title: string;
  body: string;
  href: string;
  action: string;
}) {
  return (
    <div className="flex flex-col items-start rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 p-5">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-400 shadow-sm ring-1 ring-slate-100">
        {icon}
      </div>
      <p className="mt-4 text-sm font-bold text-slate-800">{title}</p>
      <p className="mt-1 text-sm leading-relaxed text-slate-400">{body}</p>
      <Link
        href={href}
        className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-sm font-bold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50 hover:text-blue-700 hover:ring-blue-200"
      >
        {action} <ArrowRight size={13} />
      </Link>
    </div>
  );
}

function DeadlineStatusDot({ status }: { status: string }) {
  if (status === "Pendaftaran Buka")
    return <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 ring-2 ring-emerald-200" />;
  if (status === "Pendaftaran Selesai")
    return <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />;
  return <span className="h-1.5 w-1.5 rounded-full bg-amber-400 ring-2 ring-amber-200" />;
}

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
    try {
      const raw = localStorage.getItem(storageKeys.latestTryoutResult);
      if (raw) window.setTimeout(() => setLastResult(JSON.parse(raw) as TryoutResult), 0);
    } catch {}
  }, []);

  useEffect(() => {
    const interval = window.setInterval(
      () => setSlide((c) => (c + 1) % promoSlides.length),
      5000,
    );
    return () => window.clearInterval(interval);
  }, []);

  const firstName = session?.name?.split(" ")[0] ?? "Pejuang";
  const paidTransaction = transactions.find((t) => t.status === "paid");
  const latestTransaction = transactions[0] ?? null;
  const hasPaid = Boolean(paidTransaction);
  const lastScore = lastResult?.skor ?? null;
  const lastTotal = lastResult?.total ?? 0;
  const lastMaxScore = lastTotal * 4;
  const lastPct =
    lastResult && lastMaxScore > 0
      ? Math.round((lastResult.skor / lastMaxScore) * 100)
      : null;
  const upcomingDeadlines = ptnDeadlines.slice(0, 5);
  const runningItems = buildRunningItems();

  /* score ring colour */
  const scoreColor =
    lastPct === null ? "text-slate-900"
    : lastPct >= 70 ? "text-emerald-600"
    : lastPct >= 45 ? "text-amber-600"
    : "text-rose-600";

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 md:px-8">
      {/* marquee keyframe */}
      <style>{`
        @keyframes db-marquee{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
        .db-marquee{animation:db-marquee 28s linear infinite}
      `}</style>

      {/* ── Greeting ─────────────────────────────────────────────── */}
      <div className="mb-7 flex items-start justify-between gap-4">
        <div>
          <p className="mb-1 text-sm font-semibold text-slate-400">
            {getGreetingEmoji()}&nbsp; {getGreeting()}
          </p>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 md:text-3xl">
            {firstName}
            <span className="ml-2 bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
              ,&nbsp;semangat!
            </span>
          </h1>
          <p className="mt-1.5 text-sm text-slate-500">
            Kamu sudah di jalur yang benar — satu latihan hari ini lebih berharga dari semua rencana.
          </p>
        </div>
        {!hasPaid && (
          <Link
            href="/harga"
            className="hidden shrink-0 items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800 sm:flex"
          >
            <Sparkles size={14} className="text-amber-300" />
            Upgrade Pro
          </Link>
        )}
      </div>

      {/* ── Ticker ───────────────────────────────────────────────── */}
      <div className="mb-6 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="flex items-center gap-0">
          <div className="shrink-0 rounded-l-2xl bg-slate-950 px-3.5 py-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-300">Live</span>
          </div>
          <div className="relative flex-1 overflow-hidden py-2.5 pl-4">
            <div className="db-marquee flex w-max whitespace-nowrap">
              {[...runningItems, ...runningItems].map((item, i) => (
                <span key={`${item}-${i}`} className="px-6 text-xs font-semibold text-slate-600">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Quick Actions ─────────────────────────────────────────── */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {QUICK_ACTIONS.map((a) => {
          const Icon = a.icon;
          return (
            <Link
              key={a.href}
              href={a.href}
              className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-transparent bg-white p-4 shadow-sm ring-1 ring-slate-100 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:ring-2 hover:${a.ring}`}
            >
              <div
                className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${a.gradient} text-white shadow-sm`}
              >
                <Icon size={18} />
              </div>
              <div>
                <p className="text-sm font-black text-slate-900">{a.label}</p>
                <p className="mt-0.5 text-xs text-slate-400">{a.sub}</p>
              </div>
              <ChevronRight
                size={14}
                className="absolute right-3.5 top-3.5 text-slate-200 transition group-hover:text-slate-400"
              />
            </Link>
          );
        })}
      </div>

      {/* ── Promo Carousel ───────────────────────────────────────── */}
      <div className="relative mb-6 h-52 overflow-hidden rounded-2xl shadow-sm md:h-60">
        {promoSlides.map((item, index) => (
          <Link
            key={item.title}
            href="/siswa/info-ptn"
            className={`absolute inset-0 transition-opacity duration-700 ${
              index === slide ? "z-10 opacity-100" : "z-0 opacity-0"
            }`}
          >
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${item.image})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/60 to-slate-950/10" />
            <div className="absolute inset-y-0 left-0 flex max-w-lg flex-col justify-end p-6 text-white md:p-8">
              <span className="mb-2 inline-flex w-fit items-center rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-bold backdrop-blur-sm">
                📢 Terbaru
              </span>
              <p className="text-xl font-black leading-snug md:text-2xl">{item.title}</p>
              <p className="mt-1.5 max-w-sm text-sm font-medium leading-relaxed text-white/75">
                {item.desc}
              </p>
            </div>
          </Link>
        ))}
        {/* dots */}
        <div className="absolute bottom-4 right-5 z-20 flex gap-1.5">
          {promoSlides.map((item, index) => (
            <button
              key={item.title}
              type="button"
              aria-label={`Slide ${index + 1}`}
              onClick={() => setSlide(index)}
              className={`h-1.5 rounded-full transition-all ${
                index === slide ? "w-6 bg-white" : "w-1.5 bg-white/40 hover:bg-white/70"
              }`}
            />
          ))}
        </div>
      </div>

      {/* ── Status cards ─────────────────────────────────────────── */}
      <div className="mb-6 grid gap-4 md:grid-cols-2">
        {/* Paket */}
        <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                Status Paket
              </p>
              <h2 className="mt-1.5 text-lg font-black text-slate-950">
                {hasPaid ? `Paket ${paidTransaction?.plan}` : "Belum ada paket aktif"}
              </h2>
            </div>
            <span
              className={`mt-0.5 shrink-0 rounded-full px-2.5 py-1 text-[11px] font-black ring-1 ${
                hasPaid
                  ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                  : "bg-slate-100 text-slate-500 ring-slate-200"
              }`}
            >
              {hasPaid ? "✓ Aktif" : "Gratis"}
            </span>
          </div>

          {latestTransaction ? (
            <div className="mt-5 rounded-xl bg-slate-50 p-4 ring-1 ring-slate-100">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-slate-800">
                    {latestTransaction.order_id}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-400">
                    {formatIdr(latestTransaction.amount)} ·{" "}
                    {formatTransactionDate(latestTransaction.created_at)}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-black ${statusClass(latestTransaction.status)}`}
                >
                  {statusCopy(latestTransaction.status)}
                </span>
              </div>
              <Link
                href="/siswa/transaksi"
                className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-blue-600 hover:underline"
              >
                Lihat transaksi <ArrowRight size={13} />
              </Link>
            </div>
          ) : (
            <div className="mt-5">
              <EmptyState
                icon={<ShieldCheck size={18} />}
                title="Belum ada transaksi"
                body="Riwayat pembayaran muncul setelah kamu checkout."
                href="/harga"
                action="Pilih paket"
              />
            </div>
          )}
        </section>

        {/* Tryout */}
        <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">
            Tryout Terakhir
          </p>
          <h2 className="mt-1.5 truncate text-lg font-black text-slate-950">
            {lastResult?.paketTitle ?? "Belum ada hasil tryout"}
          </h2>

          {lastResult && lastScore !== null ? (
            <div className="mt-5">
              {/* Score hero */}
              <div className="flex items-end gap-3">
                <p className={`text-5xl font-black tabular-nums leading-none ${scoreColor}`}>
                  {lastScore}
                </p>
                <div className="mb-1 flex flex-col items-start gap-1">
                  <span className="text-sm font-semibold text-slate-400">/ {lastMaxScore}</span>
                  {lastPct !== null && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-black ring-1 ${
                        lastPct >= 70
                          ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                          : lastPct >= 45
                          ? "bg-amber-50 text-amber-700 ring-amber-200"
                          : "bg-rose-50 text-rose-700 ring-rose-200"
                      }`}
                    >
                      {lastPct}%
                    </span>
                  )}
                </div>
              </div>

              {/* Progress bar */}
              {lastPct !== null && (
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      lastPct >= 70
                        ? "bg-emerald-500"
                        : lastPct >= 45
                        ? "bg-amber-500"
                        : "bg-rose-500"
                    }`}
                    style={{ width: `${lastPct}%` }}
                  />
                </div>
              )}

              {/* Benar/Salah/Kosong */}
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-xl bg-emerald-50 py-2.5 ring-1 ring-emerald-100">
                  <p className="text-lg font-black text-emerald-700">{lastResult.benar}</p>
                  <p className="text-[11px] font-semibold text-emerald-600">benar</p>
                </div>
                <div className="rounded-xl bg-rose-50 py-2.5 ring-1 ring-rose-100">
                  <p className="text-lg font-black text-rose-700">{lastResult.salah}</p>
                  <p className="text-[11px] font-semibold text-rose-600">salah</p>
                </div>
                <div className="rounded-xl bg-slate-50 py-2.5 ring-1 ring-slate-100">
                  <p className="text-lg font-black text-slate-600">{lastResult.kosong}</p>
                  <p className="text-[11px] font-semibold text-slate-500">kosong</p>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <p className="text-xs text-slate-400">
                  {formatTryoutDate(lastResult.createdAt)}
                </p>
                <Link
                  href="/siswa/rasionalisasi"
                  className="inline-flex items-center gap-1 text-sm font-bold text-blue-600 hover:underline"
                >
                  Lihat analisis <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          ) : (
            <div className="mt-5">
              <EmptyState
                icon={<FileText size={18} />}
                title="Belum ada skor"
                body="Skor, benar, salah, dan kosong muncul setelah tryout selesai."
                href="/siswa/tryout"
                action="Mulai tryout"
              />
            </div>
          )}
        </section>
      </div>

      {/* ── Next Steps + Deadlines ───────────────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Next steps */}
        <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm lg:col-span-2">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                Langkah Berikutnya
              </p>
              <h2 className="mt-1 text-base font-black text-slate-950">Mulai dari aktivitas nyata</h2>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Link
              href="/siswa/tryout"
              className="group flex items-start gap-3 rounded-xl border border-slate-100 p-4 transition hover:border-blue-100 hover:bg-blue-50/40"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 ring-1 ring-blue-100 transition group-hover:bg-blue-100">
                <TrendingUp size={17} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-900">Kerjakan tryout pertama</p>
                <p className="mt-0.5 text-xs leading-relaxed text-slate-400">
                  Data progress dan rekomendasi topik baru masuk akal setelah ada hasil tryout.
                </p>
              </div>
            </Link>
            <Link
              href="/siswa/belajar"
              className="group flex items-start gap-3 rounded-xl border border-slate-100 p-4 transition hover:border-emerald-100 hover:bg-emerald-50/40"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100 transition group-hover:bg-emerald-100">
                <BookOpen size={17} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-900">Buka materi belajar</p>
                <p className="mt-0.5 text-xs leading-relaxed text-slate-400">
                  12 modul lengkap tersedia — mulai dari mana saja tanpa urutan yang kaku.
                </p>
              </div>
            </Link>
            <Link
              href="/siswa/onboarding"
              className="group flex items-start gap-3 rounded-xl border border-slate-100 p-4 transition hover:border-violet-100 hover:bg-violet-50/40"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600 ring-1 ring-violet-100 transition group-hover:bg-violet-100">
                <CheckCircle2 size={17} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-900">Atur target kampus</p>
                <p className="mt-0.5 text-xs leading-relaxed text-slate-400">
                  Tetapkan target PTN dan prodi agar rekomendasi soal lebih relevan.
                </p>
              </div>
            </Link>
            <Link
              href="/siswa/jadwal"
              className="group flex items-start gap-3 rounded-xl border border-slate-100 p-4 transition hover:border-amber-100 hover:bg-amber-50/40"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 ring-1 ring-amber-100 transition group-hover:bg-amber-100">
                <CalendarClock size={17} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-900">Pantau jadwal seleksi</p>
                <p className="mt-0.5 text-xs leading-relaxed text-slate-400">
                  Semua deadline pendaftaran PTN ada di satu halaman — jangan sampai terlewat.
                </p>
              </div>
            </Link>
          </div>
        </section>

        {/* Deadlines */}
        <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <p className="font-black text-slate-900">Deadline PTN</p>
            <Link
              href="/siswa/info-ptn"
              className="text-xs font-bold text-blue-600 hover:underline"
            >
              Semua →
            </Link>
          </div>
          <div className="space-y-2">
            {upcomingDeadlines.map((ptn) => (
              <Link
                key={ptn.id}
                href="/siswa/info-ptn"
                className="group flex items-center gap-3 rounded-xl border border-slate-100 p-3 transition hover:border-slate-200 hover:bg-slate-50"
              >
                <DeadlineStatusDot status={ptn.status} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-slate-800">{ptn.shortName}</p>
                  <p className="text-xs text-slate-400">Tutup {ptn.closeAt}</p>
                </div>
                <ChevronRight
                  size={14}
                  className="shrink-0 text-slate-200 transition group-hover:text-slate-400"
                />
              </Link>
            ))}
          </div>
        </section>
      </div>

      {/* ── Upgrade CTA (free) ───────────────────────────────────── */}
      {!hasPaid && (
        <div className="mt-6 overflow-hidden rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 p-6 shadow-sm">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <Sparkles size={16} className="text-amber-400" />
                <span className="text-sm font-black text-amber-400">Belajar Pro</span>
              </div>
              <p className="text-lg font-black text-white">
                Buka semua paket soal &amp; 12 modul materi
              </p>
              <p className="mt-1 text-sm font-medium text-slate-400">
                Akses penuh mulai dari Rp 25.000 — harga early bird terbatas.
              </p>
            </div>
            <Link
              href="/harga"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-slate-100"
            >
              Lihat Paket <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      )}

      <div className="h-10" />
    </main>
  );
}
