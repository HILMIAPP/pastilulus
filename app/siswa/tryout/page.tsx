import Image from "next/image";
import Link from "next/link";
import { GraduationCap, Lock, PlayCircle, Target, Trophy } from "lucide-react";
import { tryoutPaket, tryoutUmptkinPaket } from "@/lib/app-data";
import type { TryoutPaket } from "@/lib/app-data";
import { canAccessTier, getCurrentSession } from "@/lib/session";
import { TryoutFreeGateButton } from "@/components/tryout-free-gate";
import { checkPastiLulusAccessAction } from "@/lib/pasti-lulus-actions";
import { PastiLulusCard } from "@/components/pasti-lulus-token-gate";

function PaketCard({ p, session }: { p: TryoutPaket; session: Awaited<ReturnType<typeof getCurrentSession>> }) {
  const hasAccess = canAccessTier(session?.tier ?? "free", p.akses);

  return (
    <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-slate-300 hover:shadow-md">
      {/* Header: logo + title + badge akses */}
      <div className="flex items-start gap-3">
        {p.logoUrl ? (
          <div className="shrink-0 flex h-11 w-11 items-center justify-center rounded-xl border border-slate-100 bg-slate-50 p-1.5">
            <Image
              src={p.logoUrl}
              alt={p.title}
              width={36}
              height={36}
              className="h-full w-full object-contain"
            />
          </div>
        ) : (
          <div className="shrink-0 flex h-11 w-11 items-center justify-center rounded-xl border border-slate-100 bg-slate-50 text-slate-400">
            <GraduationCap size={20} />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-base font-bold text-slate-900 leading-snug">{p.title}</h3>
            {p.akses === "belajar_pro" ? (
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-100 px-2 py-1 text-[10px] font-bold uppercase text-amber-900">
                <Lock size={11} /> Pro
              </span>
            ) : (
              <span className="inline-flex shrink-0 rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-bold uppercase text-emerald-800">
                Gratis
              </span>
            )}
          </div>
          <p className="mt-0.5 text-sm text-slate-500 leading-snug">{p.subtitle}</p>
        </div>
      </div>

      {/* Stats */}
      <dl className="mt-4 grid grid-cols-2 gap-3 text-xs text-slate-600">
        <div className="rounded-xl bg-slate-50 p-3">
          <dt className="font-bold text-slate-500">Soal</dt>
          <dd className="mt-1 font-semibold text-slate-900">{p.soalCount}</dd>
        </div>
        <div className="rounded-xl bg-slate-50 p-3">
          <dt className="font-bold text-slate-500">Durasi</dt>
          <dd className="mt-1 font-semibold text-slate-900">{p.durasiMenit} menit</dd>
        </div>
      </dl>

      <p className="mt-3 text-xs text-slate-500">{p.pola}</p>
      <p className="mt-2 text-xs font-semibold text-blue-800">{p.scoring}</p>

      <div className="mt-5 flex flex-wrap gap-3">
        {hasAccess ? (
          p.akses === "gratis" ? (
            <TryoutFreeGateButton
              href={`/siswa/tryout/${p.slug}`}
              userName={session?.name}
            />
          ) : (
            <Link
              href={`/siswa/tryout/${p.slug}`}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white hover:bg-blue-700 min-[420px]:flex-none"
            >
              <PlayCircle size={17} /> Mulai simulasi
            </Link>
          )
        ) : (
          <Link
            href="/siswa/langganan"
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 min-[420px]:flex-none"
          >
            <Lock size={17} /> Upgrade untuk akses
          </Link>
        )}
      </div>
    </div>
  );
}

export default async function TryoutIndexPage() {
  const session = await getCurrentSession();
  const hasPastiLulusAccess = await checkPastiLulusAccessAction();

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">

      {/* ── SECTION 1: Ujian Mandiri Umum ── */}
      <div className="flex items-center gap-3 mb-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
          <GraduationCap size={18} />
        </div>
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-blue-600">Jalur 1</p>
          <h1 className="text-xl font-black text-slate-900">Try Out — Ujian Mandiri PTN</h1>
        </div>
      </div>
      <p className="mt-1 mb-6 max-w-2xl text-sm text-slate-500">
        Simulasi CBT berbasis pola ujian mandiri PTN. Dilengkapi timer, navigasi soal, scoring, pembahasan, dan rasionalisasi nilai.
      </p>

      {tryoutPaket.length ? (
        <div className="grid gap-5 md:grid-cols-2">
          {tryoutPaket.map((p) => <PaketCard key={p.id} p={p} session={session} />)}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-10 text-center">
          <p className="font-black text-slate-700">Paket sedang disiapkan</p>
        </div>
      )}

      {/* ── DIVIDER ── */}
      <div className="relative my-10">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-slate-50 px-4 text-xs font-black uppercase tracking-widest text-slate-400">atau</span>
        </div>
      </div>

      {/* ── SECTION 2: UM PTKIN ── */}
      <div className="flex items-center gap-3 mb-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
          <Target size={18} />
        </div>
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-emerald-600">Jalur 2</p>
          <h2 className="text-xl font-black text-slate-900">Try Out — UM PTKIN 2026</h2>
        </div>
      </div>
      <p className="mt-1 mb-6 max-w-2xl text-sm text-slate-500">
        5 paket soal HOTS UM-PTKIN 2026 — Penalaran Akademik, Matematika, Literasi Bahasa Indonesia &amp; Inggris, dan Pengetahuan Agama Islam.
      </p>

      <div className="grid gap-5 md:grid-cols-2">
        {tryoutUmptkinPaket.map((p) => <PaketCard key={p.id} p={p} session={session} />)}
      </div>

      {/* ── DIVIDER ── */}
      <div className="relative my-10">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-slate-50 px-4 text-xs font-black uppercase tracking-widest text-slate-400">atau</span>
        </div>
      </div>

      {/* ── SECTION 3: PASTI LULUS 1 ── */}
      <div className="flex items-center gap-3 mb-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-yellow-100 text-yellow-700">
          <Trophy size={18} />
        </div>
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-yellow-600">Jalur 3 · Eksklusif</p>
          <h2 className="text-xl font-black text-slate-900">PASTI LULUS 1 — Gratis dengan Token</h2>
        </div>
      </div>
      <p className="mt-1 mb-6 max-w-2xl text-sm text-slate-500">
        27 paket tryout spesifik universitas &amp; jurusan. Akses gratis — masukkan kode token yang diberikan admin untuk membuka semua materi.
      </p>

      <div className="max-w-md">
        <PastiLulusCard hasAccess={hasPastiLulusAccess} />
      </div>

    </main>
  );
}
