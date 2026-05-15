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
  PlayCircle,
  ShieldCheck,
  Sparkles,
  Target,
} from "lucide-react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { billingPlans } from "@/lib/billing";
import { site } from "@/lib/site-config";
import { getHomeContent } from "@/lib/public-content";

export default async function HomePage() {
  const belajarPlan = billingPlans[0];
  const homeContent = await getHomeContent({
    badge: "Khusus pejuang Ujian Mandiri PTN 2026",
    headline: `${site.promise.split(",")[0]}, masa depan pasti cerah.`,
    subheadline: `${site.name} bantu kamu latihan dengan pola soal mandiri PTN, paham pembahasan lebih cepat, dan tidak ketinggalan deadline kampus impian.`,
    cta: "Mulai gratis sekarang",
  });

  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-900">
      <SiteHeader />

      <main className="flex-1">
        <section className="relative overflow-hidden border-b border-slate-200 bg-[#F8FBFF]">
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(15,23,42,0.04)_1px,transparent_1px),linear-gradient(180deg,rgba(15,23,42,0.04)_1px,transparent_1px)] bg-[size:56px_56px]" />
          <div className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,#0A66FF,#10B981,#F59E0B)]" />

          <div className="relative mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24 lg:py-28">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-4 py-2 text-sm font-black text-[#0A66FF] shadow-sm">
                <Sparkles size={16} /> {homeContent.badge}
              </p>

              <h1 className="mt-8 max-w-5xl text-5xl font-black tracking-tight text-slate-950 sm:text-6xl lg:text-[5rem] lg:leading-[0.98]">
                {homeContent.headline}
              </h1>

              <p className="mt-7 max-w-3xl text-xl leading-9 text-slate-700">
                {homeContent.subheadline}
              </p>

              <div className="mt-8 flex flex-wrap gap-3 text-base font-bold text-slate-700">
                <TrustPoint>Try out mirip ujian asli</TrustPoint>
                <TrustPoint>AI tutor saat stuck</TrustPoint>
                <TrustPoint>Mulai dari Rp 0</TrustPoint>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/daftar"
                  className="inline-flex min-h-14 items-center gap-2 rounded-xl bg-[#0A66FF] px-8 text-lg font-black text-white shadow-xl shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-[#0052D6]"
                >
                  {homeContent.cta} <ArrowRight size={20} />
                </Link>
                <Link
                  href="/siswa/tryout"
                  className="inline-flex min-h-14 items-center gap-2 rounded-xl border border-slate-300 bg-white px-8 text-lg font-black text-slate-900 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50"
                >
                  <PlayCircle size={20} /> Coba try out gratis
                </Link>
              </div>

              <div className="mt-12 grid max-w-3xl grid-cols-3 divide-x divide-slate-200 rounded-2xl border border-slate-200 bg-white shadow-sm">
                <Metric value="1.250+" label="soal latihan" />
                <Metric value="12" label="PTN target" />
                <Metric value="7 hari" label="rencana belajar" />
              </div>
            </div>

            <div className="relative mt-14">
              <div className="absolute right-8 top-8 z-10 hidden rounded-2xl border border-emerald-200 bg-white px-5 py-4 shadow-xl shadow-slate-300/60 lg:block">
                <p className="text-sm font-bold text-slate-500">Status paket</p>
                <p className="mt-1 flex items-center gap-2 text-base font-black text-emerald-700">
                  <ShieldCheck size={18} /> Aktif belajar
                </p>
              </div>

              <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-300/60">
                <div className="flex flex-col gap-5 border-b border-slate-200 bg-slate-950 px-7 py-7 text-white sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-black uppercase tracking-wider text-blue-200">Dashboard persiapan</p>
                    <p className="mt-2 text-3xl font-black">Target SIMAK UI 2026</p>
                  </div>
                  <div className="rounded-2xl bg-white/10 px-5 py-4 sm:text-right">
                    <p className="text-sm text-slate-300">Skor simulasi</p>
                    <p className="text-4xl font-black">682</p>
                  </div>
                </div>

                <div className="grid gap-0 lg:grid-cols-[1.2fr_0.8fr]">
                  <div className="p-7 lg:p-8">
                    <div className="flex items-start justify-between gap-6">
                      <div>
                        <p className="text-sm font-black uppercase tracking-wider text-[#0A66FF]">Rencana 7 hari</p>
                        <p className="mt-2 max-w-xl text-3xl font-black leading-tight text-slate-950">
                          Mulai simulasi, lalu perbaiki kelemahan.
                        </p>
                      </div>
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-[#0A66FF]">
                        <Target size={28} />
                      </div>
                    </div>

                    <div className="mt-8 space-y-7">
                      <ProgressRow label="Latihan pola SIMAK / SM-ITB / UM UGM" pct={82} color="bg-[#0A66FF]" />
                      <ProgressRow label="Bahas soal yang salah" pct={68} color="bg-emerald-500" />
                      <ProgressRow label="Pantau deadline PTN target" pct={91} color="bg-amber-500" />
                    </div>

                    <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-6">
                      <p className="text-lg font-black text-slate-950">Target minggu ini</p>
                      <p className="mt-2 text-base leading-8 text-slate-600">
                        Naikkan skor try out pertama dan kunci 3 materi paling lemah.
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-slate-200 bg-slate-50 p-7 lg:border-l lg:border-t-0 lg:p-8">
                    <p className="text-lg font-black text-slate-950">Agenda hari ini</p>
                    <div className="mt-5 space-y-4">
                      <PlanItem icon={<LineChart size={20} />} title="Try out mini" desc="25 soal campuran" tone="blue" />
                      <PlanItem icon={<Bot size={20} />} title="Bahas 8 soal salah" desc="Dibantu AI tutor" tone="emerald" />
                      <PlanItem icon={<Bell size={20} />} title="Cek deadline" desc="UI, ITB, UGM" tone="amber" />
                    </div>
                  </div>
                </div>

                <Link
                  href="/harga"
                  className="m-7 mt-0 flex min-h-14 items-center justify-center rounded-xl bg-[#0A66FF] text-base font-black text-white transition hover:bg-[#0052D6]"
                >
                  Lihat paket belajar
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section id="fitur" className="mx-auto max-w-7xl scroll-mt-28 px-5 py-20 sm:px-8">
          <h2 className="mx-auto max-w-4xl text-center text-4xl font-black leading-tight text-slate-950 sm:text-5xl">
            Kenapa {site.name} lebih pas untuk Ujian Mandiri?
          </h2>
          <p className="mx-auto mt-5 max-w-3xl text-center text-lg leading-9 text-slate-600">
            Karena ujian mandiri punya pola, jadwal, dan strategi yang beda dari SNBT. Kamu butuh latihan yang
            langsung mengarah ke kampus target, bukan materi umum yang terlalu melebar.
          </p>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            <FeatureCard
              icon={<GraduationCap />}
              title="Fokus kampus target"
              body="Latihan diarahkan ke pola SIMAK UI, SM-ITB, UM UGM, SMUP UNPAD, dan jalur mandiri populer lain. Siswa tidak perlu menebak mulai dari mana."
            />
            <FeatureCard
              icon={<BookOpen />}
              title="Soal + pembahasan rapi"
              body="Tidak cuma jawab benar-salah. Setiap hasil diarahkan ke materi yang perlu diperbaiki agar waktu belajar tidak habis untuk hal yang sudah dikuasai."
            />
            <FeatureCard
              icon={<CalendarDays />}
              title="Deadline tidak kelewat"
              body="Pantau jadwal buka dan tutup pendaftaran PTN supaya persiapan belajar, pilihan kampus, dan administrasi tetap aman."
            />
          </div>
        </section>

        <section className="border-y border-slate-100 bg-slate-50">
          <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
            <div className="flex flex-col items-start justify-between gap-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm lg:flex-row lg:items-center lg:p-10">
              <div>
                <h2 className="text-3xl font-black text-slate-950">Mulai dulu. Bayar nanti kalau cocok.</h2>
                <p className="mt-3 max-w-2xl text-lg leading-9 text-slate-600">
                  Coba gratis untuk rasakan alur try out. Kalau butuh latihan lebih intens, paket Belajar mulai{" "}
                  <strong className="text-slate-950">{belajarPlan.priceLabel}/bulan</strong>.
                </p>
              </div>
              <Link
                href="/daftar"
                className="inline-flex min-h-14 shrink-0 items-center gap-2 rounded-xl bg-[#0A66FF] px-8 text-lg font-black text-white transition hover:-translate-y-0.5 hover:bg-[#0052D6]"
              >
                Daftar gratis <ArrowRight size={20} />
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
    <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 shadow-sm">
      <CheckCircle2 size={18} className="shrink-0 text-emerald-600" />
      <span>{children}</span>
    </div>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div className="px-6 py-5">
      <p className="text-3xl font-black text-slate-950">{value}</p>
      <p className="mt-2 text-sm font-bold text-slate-500">{label}</p>
    </div>
  );
}

function ProgressRow({ label, pct, color = "bg-[#0A66FF]" }: { label: string; pct: number; color?: string }) {
  return (
    <div>
      <div className="flex justify-between gap-4 text-base font-bold text-slate-700">
        <span>{label}</span>
        <span>{pct}%</span>
      </div>
      <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function PlanItem({
  icon,
  title,
  desc,
  tone,
}: {
  icon: ReactNode;
  title: string;
  desc: string;
  tone: "blue" | "emerald" | "amber";
}) {
  const toneClass = {
    blue: "bg-blue-50 text-[#0A66FF]",
    emerald: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
  }[tone];

  return (
    <div className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-5">
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${toneClass}`}>{icon}</div>
      <div>
        <p className="text-lg font-black text-slate-950">{title}</p>
        <p className="mt-1 text-sm leading-relaxed text-slate-500">{desc}</p>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, body }: { icon: ReactNode; title: string; body: string }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0A66FF] text-white">{icon}</div>
      <h3 className="mt-6 text-2xl font-black text-slate-950">{title}</h3>
      <p className="mt-4 text-base leading-8 text-slate-600">{body}</p>
    </div>
  );
}
