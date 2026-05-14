import type { ReactNode } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Bell,
  BookOpen,
  Bot,
  CalendarDays,
  CheckCircle2,
  GraduationCap,
  LineChart,
  Sparkles,
} from "lucide-react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { billingPlans } from "@/lib/billing";
import { site } from "@/lib/site-config";

export default function HomePage() {
  const belajarPlan = billingPlans[0];

  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-900">
      <SiteHeader />

      <main className="flex-1">
        <section className="relative overflow-hidden border-b border-slate-100 bg-gradient-to-b from-[#E6F0FF] via-white to-white">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(ellipse_at_top,_rgba(10,102,255,0.16),_transparent_58%)]" />
          <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:flex lg:items-center lg:gap-12 lg:py-28">
            <div className="flex-1">
              <p className="inline-flex items-center gap-2 rounded-full border border-[#BFD7FF] bg-white px-3 py-1 text-xs font-black text-[#0A66FF] shadow-sm">
                <Sparkles size={14} /> Khusus pejuang Ujian Mandiri PTN 2026
              </p>

              <h1 className="mt-6 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl lg:text-[3.35rem] lg:leading-[1.05]">
                {site.promise.split(",")[0]},{" "}
                <span className="text-[#0A66FF]">masa depan pasti cerah.</span>
              </h1>

              <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-700">
                {site.name} bantu kamu latihan dengan pola soal mandiri PTN, paham pembahasan lebih cepat,
                dan tidak ketinggalan deadline kampus impian.
              </p>

              <div className="mt-6 grid gap-2 text-sm font-bold text-slate-700 sm:grid-cols-3">
                <TrustPoint>Try out mirip ujian asli</TrustPoint>
                <TrustPoint>AI tutor saat stuck</TrustPoint>
                <TrustPoint>Mulai dari Rp 0</TrustPoint>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/daftar"
                  className="inline-flex items-center gap-2 rounded-2xl bg-[#0A66FF] px-6 py-3.5 text-base font-black text-white shadow-lg shadow-blue-600/25 transition hover:-translate-y-0.5 hover:bg-[#0052D6]"
                >
                  Mulai gratis sekarang <ArrowRight size={18} />
                </Link>
                <Link
                  href="/siswa/tryout"
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-3.5 text-base font-black text-slate-900 transition hover:-translate-y-0.5 hover:bg-slate-50"
                >
                  Coba try out gratis
                </Link>
              </div>

              <ul className="mt-10 grid gap-4 sm:grid-cols-3">
                <MiniProof
                  icon={<LineChart className="text-[#0A66FF]" size={20} />}
                  title="Tahu titik lemah"
                  desc="Lihat materi mana yang perlu dikejar dulu."
                />
                <MiniProof
                  icon={<Bot className="text-[#0A66FF]" size={20} />}
                  title="Belajar tidak stuck"
                  desc="Tanya AI tutor saat pembahasan belum nyantol."
                />
                <MiniProof
                  icon={<Bell className="text-[#0A66FF]" size={20} />}
                  title="Deadline aman"
                  desc="Pantau jadwal PTN target sebelum terlambat."
                />
              </ul>
            </div>

            <div className="mt-12 flex-1 lg:mt-0">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/70">
                <p className="text-xs font-black uppercase tracking-wider text-[#0A66FF]">Rencana belajar 7 hari</p>
                <p className="mt-2 text-xl font-black text-slate-950">Mulai dari simulasi, lanjut perbaiki kelemahan</p>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  Cocok untuk siswa yang waktunya mepet, tapi masih ingin belajar dengan arah yang jelas.
                </p>

                <div className="mt-6 space-y-4">
                  <ProgressRow label="Latihan pola SIMAK / SM-ITB / UM UGM" pct={82} />
                  <ProgressRow label="Bahas soal yang salah" pct={68} />
                  <ProgressRow label="Pantau deadline PTN target" pct={91} />
                </div>

                <div className="mt-6 rounded-2xl bg-[#0D1B2A] p-4 text-white">
                  <p className="text-sm font-bold">Target minggu ini</p>
                  <p className="mt-1 text-2xl font-black">Naikkan skor try out pertamamu</p>
                </div>

                <Link
                  href="/harga"
                  className="mt-5 flex w-full items-center justify-center rounded-2xl bg-[#0A66FF] py-3 text-sm font-black text-white transition hover:bg-[#0052D6]"
                >
                  Lihat paket belajar
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section id="fitur" className="mx-auto max-w-6xl scroll-mt-28 px-4 py-16 sm:px-6">
          <h2 className="text-center text-2xl font-black text-slate-950 sm:text-3xl">
            Kenapa {site.name} lebih pas untuk Ujian Mandiri?
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center leading-relaxed text-slate-600">
            Karena ujian mandiri punya pola, jadwal, dan strategi yang beda dari SNBT. Kamu butuh latihan yang
            langsung mengarah ke kampus target, bukan materi umum yang terlalu melebar.
          </p>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <FeatureCard
              icon={<GraduationCap />}
              title="Fokus kampus target"
              body="Latihan diarahkan ke pola SIMAK UI, SM-ITB, UM UGM, SMUP UNPAD, dan jalur mandiri populer lain."
            />
            <FeatureCard
              icon={<BookOpen />}
              title="Soal + pembahasan rapi"
              body="Tidak cuma jawab benar-salah. Kamu dibantu memahami kenapa salah dan materi apa yang harus diperbaiki."
            />
            <FeatureCard
              icon={<CalendarDays />}
              title="Deadline tidak kelewat"
              body="Pantau jadwal buka dan tutup pendaftaran PTN supaya persiapan belajar dan administrasi tetap aman."
            />
          </div>
        </section>

        <section className="border-y border-slate-100 bg-slate-50">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
            <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
              <div>
                <h2 className="text-2xl font-black text-slate-950">Mulai dulu. Bayar nanti kalau cocok.</h2>
                <p className="mt-2 max-w-xl leading-relaxed text-slate-600">
                  Coba gratis untuk rasakan alur try out. Kalau butuh latihan lebih intens, paket Belajar mulai{" "}
                  <strong className="text-slate-950">{belajarPlan.priceLabel}/bulan</strong>.
                </p>
              </div>
              <Link
                href="/daftar"
                className="inline-flex shrink-0 items-center gap-2 rounded-2xl bg-[#0A66FF] px-6 py-3 font-black text-white transition hover:-translate-y-0.5 hover:bg-[#0052D6]"
              >
                Daftar gratis <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

function TrustPoint({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <CheckCircle2 size={17} className="shrink-0 text-emerald-600" />
      <span>{children}</span>
    </div>
  );
}

function MiniProof({
  icon,
  title,
  desc,
}: {
  icon: ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <li className="flex gap-3 rounded-2xl border border-slate-100 bg-white/90 p-4 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E6F0FF]">{icon}</div>
      <div>
        <p className="font-black text-slate-950">{title}</p>
        <p className="text-sm leading-relaxed text-slate-600">{desc}</p>
      </div>
    </li>
  );
}

function ProgressRow({ label, pct }: { label: string; pct: number }) {
  return (
    <div>
      <div className="flex justify-between gap-4 text-xs font-bold text-slate-700">
        <span>{label}</span>
        <span>{pct}%</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-[#0A66FF] transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, body }: { icon: ReactNode; title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0A66FF] text-white">{icon}</div>
      <h3 className="mt-4 text-lg font-black text-slate-950">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">{body}</p>
    </div>
  );
}
