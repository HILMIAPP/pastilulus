import Link from "next/link";
import { Lock, PlayCircle } from "lucide-react";
import { tryoutPaket } from "@/lib/app-data";
import { canAccessTier, getCurrentSession } from "@/lib/session";
import { site } from "@/lib/site-config";

export default async function TryoutIndexPage() {
  const session = await getCurrentSession();

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-black text-slate-900">Try Out - Paket Ujian Mandiri PTN</h1>
      <p className="mt-2 max-w-2xl text-sm text-slate-600">
        Pilih paket simulasi CBT berbasis pola ujian mandiri PTN. Setiap paket sudah dilengkapi timer, navigasi soal,
        scoring, pembahasan, dan rasionalisasi nilai.
      </p>

      {tryoutPaket.length ? (
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {tryoutPaket.map((p) => {
          const hasAccess = canAccessTier(session?.tier ?? "free", p.akses);

          return (
            <div key={p.id} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">{p.title}</h2>
                  <p className="mt-1 text-sm text-slate-600">{p.subtitle}</p>
                </div>
                {p.akses === "belajar_pro" ? (
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-100 px-2 py-1 text-[10px] font-bold uppercase text-amber-900">
                    <Lock size={12} /> Belajar+
                  </span>
                ) : (
                  <span className="inline-flex shrink-0 rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-bold uppercase text-emerald-800">
                    Gratis
                  </span>
                )}
              </div>

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

              <div className="mt-6 flex flex-wrap gap-3">
                {hasAccess ? (
                  <Link
                    href={`/siswa/tryout/${p.slug}`}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white hover:bg-blue-700 min-[420px]:flex-none"
                  >
                    <PlayCircle size={18} /> Mulai simulasi
                  </Link>
                ) : (
                  <Link
                    href="/harga"
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-800 hover:bg-slate-50 min-[420px]:flex-none"
                  >
                    <Lock size={18} /> Upgrade untuk akses
                  </Link>
                )}
              </div>
            </div>
          );
          })}
        </div>
      ) : (
        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-xl font-black text-slate-950">Paket tryout sedang disiapkan.</h2>
          <p className="mt-2 max-w-xl leading-relaxed text-slate-600">
            Tim {site.name} sedang menyiapkan paket simulasi baru. Cek blog atau info PTN sambil menunggu.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/blog" className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-black text-white">
              Baca blog
            </Link>
            <Link href="/siswa/info-ptn" className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-black text-slate-800">
              Info PTN
            </Link>
          </div>
        </section>
      )}
    </main>
  );
}

