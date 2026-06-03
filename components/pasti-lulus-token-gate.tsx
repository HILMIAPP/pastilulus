"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, Loader2, Trophy, X } from "lucide-react";
import { redeemPastiLulusTokenAction } from "@/lib/pasti-lulus-actions";
import { PASTI_LULUS_ITEMS } from "@/lib/pasti-lulus-data";

const PASTI_LULUS_PACKAGE_COUNT = PASTI_LULUS_ITEMS.length;

export function PastiLulusCard({ hasAccess }: { hasAccess: boolean }) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const handleRedeem = async () => {
    if (!token.trim()) return;
    setLoading(true);
    setMessage(null);
    const result = await redeemPastiLulusTokenAction(token);
    setMessage({ ok: result.ok, text: result.message });
    setLoading(false);
    if (result.ok) {
      setTimeout(() => {
        setShowModal(false);
        router.push("/siswa/pasti-lulus");
        router.refresh();
      }, 1200);
    }
  };

  return (
    <>
      <div className="relative overflow-hidden rounded-2xl border-2 border-yellow-300 bg-gradient-to-br from-yellow-50 to-amber-50 p-6 shadow-sm">
        {/* Dekoratif */}
        <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-yellow-200 opacity-40" />
        <div className="absolute -bottom-4 -left-4 h-16 w-16 rounded-full bg-amber-200 opacity-30" />

        <div className="relative flex items-start gap-3">
          <div className="shrink-0 flex h-11 w-11 items-center justify-center rounded-xl bg-yellow-100 border border-yellow-200">
            <Trophy size={22} className="text-yellow-700" />
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-base font-black text-slate-900 leading-snug">PASTI LULUS 1</h3>
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-yellow-200 px-2 py-1 text-[10px] font-black uppercase text-yellow-900">
                Eksklusif
              </span>
            </div>
            <p className="mt-0.5 text-sm text-slate-600 leading-snug">
              {PASTI_LULUS_PACKAGE_COUNT} paket tryout spesifik universitas &amp; jurusan pilihan — dirancang agar kamu PASTI LULUS.
            </p>
          </div>
        </div>

        <dl className="relative mt-4 grid grid-cols-2 gap-3 text-xs text-slate-600">
          <div className="rounded-xl bg-white/70 p-3 border border-yellow-100">
            <dt className="font-bold text-slate-500">Paket tersedia</dt>
            <dd className="mt-1 font-semibold text-slate-900">{PASTI_LULUS_PACKAGE_COUNT} tryout</dd>
          </div>
          <div className="rounded-xl bg-white/70 p-3 border border-yellow-100">
            <dt className="font-bold text-slate-500">Format</dt>
            <dd className="mt-1 font-semibold text-slate-900">PDF interaktif</dd>
          </div>
        </dl>

        <p className="relative mt-3 text-xs text-slate-500">Khusus peserta yang mendapatkan kode token dari admin.</p>

        <div className="relative mt-5">
          {hasAccess ? (
            <a
              href="/siswa/pasti-lulus"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-yellow-500 px-4 py-3 text-sm font-black text-white hover:bg-yellow-600"
            >
              <Trophy size={16} /> Buka Materi PASTI LULUS 1
            </a>
          ) : (
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-yellow-500 px-4 py-3 text-sm font-black text-white hover:bg-yellow-600"
            >
              <KeyRound size={16} /> Masukkan Kode Token
            </button>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <button
              type="button"
              onClick={() => { setShowModal(false); setMessage(null); setToken(""); }}
              className="absolute right-4 top-4 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-100">
                <KeyRound size={20} className="text-yellow-700" />
              </div>
              <div>
                <h2 className="text-base font-black text-slate-900">Kode Token PASTI LULUS 1</h2>
                <p className="text-xs text-slate-500">Dapatkan kode dari admin untuk akses gratis</p>
              </div>
            </div>

            <label htmlFor="token-input" className="block text-xs font-bold text-slate-700 mb-1.5">
              Masukkan kode token
            </label>
            <input
              id="token-input"
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && !loading && handleRedeem()}
              placeholder="Contoh: PL1-ABCD1234"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-mono font-semibold text-slate-900 placeholder-slate-400 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-100"
              disabled={loading}
              autoComplete="off"
            />

            {message && (
              <p className={`mt-2 text-xs font-semibold ${message.ok ? "text-emerald-700" : "text-red-600"}`}>
                {message.text}
              </p>
            )}

            <button
              type="button"
              onClick={handleRedeem}
              disabled={loading || !token.trim()}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-yellow-500 px-4 py-3 text-sm font-black text-white hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <KeyRound size={16} />}
              {loading ? "Memverifikasi..." : "Aktifkan Token"}
            </button>

            <p className="mt-3 text-center text-[11px] text-slate-400">
              Token didapat dari admin Lolosujian secara langsung.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
