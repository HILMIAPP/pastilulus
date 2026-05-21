"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock3,
  CreditCard,
  FileText,
  Info,
  LayoutDashboard,
  ListChecks,
  ShieldCheck,
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
    icon: <Zap size={20} />,
    label: "Mulai Tryout",
    sub: "Kerjakan paket soal",
    textColor: "text-blue-700",
    bg: "bg-blue-50",
  },
  {
    href: "/siswa/belajar",
    icon: <BookOpen size={20} />,
    label: "Buka Materi",
    sub: "Lanjutkan modul",
    textColor: "text-emerald-700",
    bg: "bg-emerald-50",
  },
  {
    href: "/siswa/transaksi",
    icon: <CreditCard size={20} />,
    label: "Transaksi",
    sub: "Cek pembayaran",
    textColor: "text-violet-700",
    bg: "bg-violet-50",
  },
  {
    href: "/siswa/info-ptn",
    icon: <Info size={20} />,
    label: "Info PTN",
    sub: "Jadwal seleksi",
    textColor: "text-amber-700",
    bg: "bg-amber-50",
  },
];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 11) return "Selamat pagi";
  if (h < 15) return "Selamat siang";
  if (h < 18) return "Selamat sore";
  return "Selamat malam";
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
  if (status === "pending") return "Menunggu pembayaran";
  if (status === "failed") return "Gagal";
  return "Kedaluwarsa";
}

function statusClass(status: StudentPaymentTransaction["status"]) {
  if (status === "paid") return "bg-emerald-100 text-emerald-700";
  if (status === "pending") return "bg-amber-100 text-amber-700";
  if (status === "failed") return "bg-rose-100 text-rose-700";
  return "bg-slate-100 text-slate-700";
}

function buildRunningItems() {
  const openDeadlines = ptnDeadlines
    .filter((ptn) => ptn.status !== "Pendaftaran Selesai")
    .slice(0, 4)
    .map((ptn) => `${ptn.shortName}: tutup ${ptn.closeAt}`);

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
    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-slate-500 shadow-sm">
        {icon}
      </div>
      <p className="mt-4 text-sm font-black text-slate-900">{title}</p>
      <p className="mt-1 text-sm leading-relaxed text-slate-500">{body}</p>
      <Link href={href} className="mt-4 inline-flex items-center gap-1 text-sm font-black text-blue-700 hover:underline">
        {action} <ArrowRight size={14} />
      </Link>
    </div>
  );
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
      if (raw) {
        window.setTimeout(() => {
          setLastResult(JSON.parse(raw) as TryoutResult);
        }, 0);
      }
    } catch {}
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => setSlide((current) => (current + 1) % promoSlides.length), 5000);
    return () => window.clearInterval(interval);
  }, []);

  const firstName = session?.name?.split(" ")[0] ?? "Pejuang";
  const paidTransaction = transactions.find((t) => t.status === "paid");
  const latestTransaction = transactions[0] ?? null;
  const hasPaid = Boolean(paidTransaction);
  const lastScore = lastResult?.skor ?? null;
  const lastTotal = lastResult?.total ?? 0;
  const lastMaxScore = lastTotal * 4;
  const lastPct = lastResult && lastMaxScore > 0 ? Math.round((lastResult.skor / lastMaxScore) * 100) : null;
  const upcomingDeadlines = ptnDeadlines.slice(0, 4);
  const runningItems = buildRunningItems();

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 md:px-8">
      <style>{`@keyframes dashboard-marquee{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}`}</style>

      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <LayoutDashboard size={15} className="text-blue-700" />
            <span className="text-xs font-bold uppercase tracking-wide text-blue-700">Dashboard</span>
          </div>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-900 md:text-3xl">
            {getGreeting()}, {firstName}
          </h1>
          <p className="mt-1 text-sm font-semibold text-slate-500">
            Ringkasan ini hanya menampilkan data yang sudah tercatat dari aktivitas akunmu.
          </p>
        </div>
        {!hasPaid && (
          <Link
            href="/harga"
            className="hidden shrink-0 items-center gap-1.5 rounded-2xl bg-blue-700 px-4 py-2.5 text-sm font-black text-white shadow-sm transition hover:bg-blue-800 sm:flex"
          >
            Lihat Paket <ArrowRight size={14} />
          </Link>
        )}
      </div>

      <div className="mb-5 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="shrink-0 rounded-lg bg-slate-950 px-2.5 py-1 text-[11px] font-black uppercase tracking-wide text-amber-300">
            Info
          </span>
          <div className="relative min-w-0 flex-1 overflow-hidden">
            <div
              className="flex w-max whitespace-nowrap text-xs font-bold text-slate-700"
              style={{ animation: "dashboard-marquee 28s linear infinite" }}
            >
              {[...runningItems, ...runningItems].map((item, index) => (
                <span key={`${item}-${index}`} className="px-5">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {QUICK_ACTIONS.map((a) => (
          <Link
            key={a.href}
            href={a.href}
            className="group flex min-h-28 flex-col justify-between rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition hover:border-slate-200 hover:shadow-md"
          >
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${a.bg} ${a.textColor}`}>
              {a.icon}
            </div>
            <div>
              <p className="text-sm font-black text-slate-900">{a.label}</p>
              <p className="mt-0.5 text-xs text-slate-500">{a.sub}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="relative mb-5 h-52 overflow-hidden rounded-2xl bg-slate-950 shadow-sm md:h-60">
        {promoSlides.map((item, index) => (
          <Link
            key={item.title}
            href="/siswa/info-ptn"
            className={`absolute inset-0 transition duration-700 ${
              index === slide ? "z-10 opacity-100" : "z-0 opacity-0"
            }`}
          >
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${item.image})` }} />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/55 to-slate-950/10" />
            <div className="absolute inset-y-0 left-0 flex max-w-xl flex-col justify-end p-5 text-white md:p-7">
              <p className="text-xl font-black leading-tight md:text-2xl">{item.title}</p>
              <p className="mt-2 max-w-md text-sm font-semibold leading-relaxed text-white/80">{item.desc}</p>
            </div>
          </Link>
        ))}
        <div className="absolute bottom-4 right-5 z-20 flex gap-1.5">
          {promoSlides.map((item, index) => (
            <button
              key={item.title}
              type="button"
              aria-label={`Slide ${index + 1}`}
              onClick={() => setSlide(index)}
              className={`h-2 rounded-full transition ${
                index === slide ? "w-7 bg-white" : "w-2 bg-white/50 hover:bg-white/80"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-wide text-slate-400">Status Paket</p>
              <h2 className="mt-1 text-lg font-black text-slate-950">
                {hasPaid ? `Paket ${paidTransaction?.plan}` : "Belum ada paket aktif"}
              </h2>
            </div>
            <span className={`rounded-xl px-2.5 py-1 text-xs font-black ${hasPaid ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
              {hasPaid ? "Aktif" : "Gratis"}
            </span>
          </div>

          {latestTransaction ? (
            <div className="mt-5 rounded-2xl border border-slate-100 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-black text-slate-900">{latestTransaction.order_id}</p>
                  <p className="mt-1 text-xs font-semibold text-slate-500">
                    {formatIdr(latestTransaction.amount)} - {formatTransactionDate(latestTransaction.created_at)}
                  </p>
                </div>
                <span className={`shrink-0 rounded-lg px-2 py-1 text-[11px] font-black ${statusClass(latestTransaction.status)}`}>
                  {statusCopy(latestTransaction.status)}
                </span>
              </div>
              <Link href="/siswa/transaksi" className="mt-4 inline-flex items-center gap-1 text-sm font-black text-blue-700 hover:underline">
                Lihat transaksi <ArrowRight size={14} />
              </Link>
            </div>
          ) : (
            <EmptyState
              icon={<ShieldCheck size={20} />}
              title="Belum ada transaksi"
              body="Riwayat pembayaran akan muncul setelah kamu membuat checkout."
              href="/harga"
              action="Pilih paket"
            />
          )}
        </section>

        <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <p className="text-xs font-black uppercase tracking-wide text-slate-400">Tryout Terakhir</p>
          <h2 className="mt-1 truncate text-lg font-black text-slate-950">
            {lastResult?.paketTitle ?? "Belum ada hasil tryout"}
          </h2>

          {lastResult && lastScore !== null ? (
            <div className="mt-5">
              <div className="flex items-end gap-3">
                <p className="text-4xl font-black text-slate-900">{lastScore}</p>
                <p className="mb-1 text-base font-bold text-slate-400">/ {lastMaxScore}</p>
                {lastPct !== null && (
                  <span className="mb-1 rounded-xl bg-blue-50 px-3 py-1 text-sm font-black text-blue-700">
                    {lastPct}%
                  </span>
                )}
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center text-sm font-semibold">
                <div className="rounded-xl bg-emerald-50 p-3 text-emerald-700">{lastResult.benar} benar</div>
                <div className="rounded-xl bg-rose-50 p-3 text-rose-700">{lastResult.salah} salah</div>
                <div className="rounded-xl bg-slate-50 p-3 text-slate-600">{lastResult.kosong} kosong</div>
              </div>
              <p className="mt-3 text-xs font-semibold text-slate-500">Dicatat {formatTryoutDate(lastResult.createdAt)}</p>
              <Link href="/siswa/rasionalisasi" className="mt-4 inline-flex items-center gap-1 text-sm font-black text-blue-700 hover:underline">
                Lihat analisis <ArrowRight size={14} />
              </Link>
            </div>
          ) : (
            <EmptyState
              icon={<FileText size={20} />}
              title="Belum ada skor"
              body="Skor, benar, salah, dan kosong baru muncul setelah kamu menyelesaikan tryout."
              href="/siswa/tryout"
              action="Mulai tryout"
            />
          )}
        </section>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm lg:col-span-2">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-wide text-slate-400">Langkah Berikutnya</p>
              <h2 className="mt-1 text-lg font-black text-slate-950">Mulai dari aktivitas nyata</h2>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Link href="/siswa/tryout" className="flex items-start gap-3 rounded-2xl border border-slate-100 p-4 transition hover:bg-slate-50">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                <ListChecks size={20} />
              </div>
              <div>
                <p className="text-sm font-black text-slate-900">Kerjakan tryout pertama</p>
                <p className="mt-1 text-sm leading-relaxed text-slate-500">Data progress dan rekomendasi topik akan lebih masuk akal setelah ada hasil.</p>
              </div>
            </Link>
            <Link href="/siswa/belajar" className="flex items-start gap-3 rounded-2xl border border-slate-100 p-4 transition hover:bg-slate-50">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                <BookOpen size={20} />
              </div>
              <div>
                <p className="text-sm font-black text-slate-900">Buka materi belajar</p>
                <p className="mt-1 text-sm leading-relaxed text-slate-500">Materi tersedia tanpa membuat angka progres palsu di dashboard.</p>
              </div>
            </Link>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm font-black text-slate-900">Deadline PTN</p>
            <Link href="/siswa/info-ptn" className="text-xs font-bold text-blue-700 hover:underline">
              Semua
            </Link>
          </div>
          <div className="space-y-2.5">
            {upcomingDeadlines.map((ptn) => (
              <Link
                key={ptn.id}
                href="/siswa/info-ptn"
                className="flex items-center justify-between gap-2 rounded-xl border border-slate-100 p-3 transition hover:bg-slate-50"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-slate-800">{ptn.shortName}</p>
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
                    <CalendarDays size={12} /> Tutup {ptn.closeAt}
                  </p>
                </div>
                <Clock3 size={15} className="shrink-0 text-slate-300" />
              </Link>
            ))}
          </div>
        </section>
      </div>

      {!hasPaid && (
        <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50 p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="flex items-center gap-2 font-black text-blue-950">
                <CheckCircle2 size={18} />
                Paket berbayar belum aktif
              </p>
              <p className="mt-1 text-sm font-semibold leading-relaxed text-blue-900">
                Upgrade hanya ditampilkan sebagai status akun, bukan klaim progres belajar.
              </p>
            </div>
            <Link
              href="/harga"
              className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-blue-700 px-5 py-3 text-sm font-black text-white transition hover:bg-blue-800"
            >
              Lihat Paket <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      )}

      <div className="h-8" />
    </main>
  );
}
