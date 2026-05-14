"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { TryoutPaket } from "@/lib/app-data";
import { soalPaket1, soalPaketById } from "@/lib/app-data";
import { calculateRationalization } from "@/lib/um-rationalization";
import { site, storageKeys } from "@/lib/site-config";
import {
  AlertTriangle,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Clock3,
  FileCheck2,
  Flag,
  ListChecks,
  Send,
  ShieldCheck,
  Target,
  TrendingUp,
  X,
} from "lucide-react";

type Props = {
  paket: TryoutPaket;
};

type Choice = "A" | "B" | "C" | "D" | "E";

const choiceKeys: Choice[] = ["A", "B", "C", "D", "E"];

export function TryoutExam({ paket }: Props) {
  const soalList = useMemo(() => {
    return soalPaketById[paket.id] ?? soalPaket1;
  }, [paket.id]);

  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, Choice | null>>({});
  const [marked, setMarked] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [hasAgreed, setHasAgreed] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [timeLeft, setTimeLeft] = useState(paket.durasiMenit * 60);

  const current = soalList[idx];
  const selected = current ? (answers[current.id] ?? null) : null;

  const answeredCount = soalList.filter((q) => answers[q.id] != null).length;
  const markedCount = soalList.filter((q) => marked[q.id]).length;
  const emptyCount = soalList.length - answeredCount;
  const progress = soalList.length > 0 ? Math.round((answeredCount / soalList.length) * 100) : 0;

  useEffect(() => {
    if (!hasStarted || submitted) return;

    const timer = window.setInterval(() => {
      setTimeLeft((value) => {
        if (value <= 1) {
          window.clearInterval(timer);
          window.setTimeout(() => {
            setShowSubmitConfirm(false);
            setSubmitted(true);
          }, 0);
          return 0;
        }

        return value - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [hasStarted, submitted]);

  const setAnswer = (key: Choice) => {
    if (!current) return;
    setAnswers((prev) => ({ ...prev, [current.id]: prev[current.id] === key ? null : key }));
  };

  const toggleMark = () => {
    if (!current) return;
    setMarked((prev) => ({ ...prev, [current.id]: !prev[current.id] }));
  };

  const submitExam = () => {
    setShowSubmitConfirm(false);
    setSubmitted(true);
  };

  const resetExam = () => {
    setSubmitted(false);
    setHasStarted(false);
    setHasAgreed(false);
    setAnswers({});
    setMarked({});
    setIdx(0);
    setTimeLeft(paket.durasiMenit * 60);
  };

  const computeScore = useCallback(() => {
    let benar = 0;
    let salah = 0;
    let kosong = 0;

    for (const q of soalList) {
      const answer = answers[q.id];
      if (answer == null) kosong++;
      else if (answer === q.kunci) benar++;
      else salah++;
    }

    const skor = benar * 4 + salah * -1;
    return { benar, salah, kosong, skor, total: soalList.length };
  }, [answers, soalList]);

  useEffect(() => {
    if (!submitted) return;

    const latest = computeScore();
    window.localStorage.setItem(
      storageKeys.latestTryoutResult,
      JSON.stringify({
        ...latest,
        paketTitle: paket.title,
        createdAt: new Date().toISOString(),
      }),
    );
  }, [computeScore, paket.title, submitted]);

  const result = submitted ? computeScore() : null;
  const rationalization = result ? calculateRationalization(result) : null;

  if (!current) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-950">
          <h1 className="text-lg font-bold">Soal belum tersedia</h1>
          <p className="mt-2 text-sm">Paket ini belum memiliki data soal yang bisa dikerjakan.</p>
        </div>
      </div>
    );
  }

  if (!hasStarted) {
    return (
      <div className="min-h-screen bg-slate-100 px-4 py-6">
        <div className="mx-auto max-w-6xl space-y-5">
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="bg-slate-950 px-6 py-7 text-white sm:px-8">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-300">Ruang persiapan CBT</p>
              <div className="mt-3 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <h1 className="text-2xl font-black sm:text-3xl">{paket.title}</h1>
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-300">
                    Baca aturan dan tata cara pengerjaan sebelum masuk ke ruang ujian. Timer baru berjalan setelah
                    kamu menekan tombol mulai.
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-2xl bg-white/10 px-4 py-3">
                    <p className="text-xl font-black">{soalList.length}</p>
                    <p className="text-[10px] font-bold uppercase text-slate-300">Soal</p>
                  </div>
                  <div className="rounded-2xl bg-white/10 px-4 py-3">
                    <p className="text-xl font-black">{paket.durasiMenit}</p>
                    <p className="text-[10px] font-bold uppercase text-slate-300">Menit</p>
                  </div>
                  <div className="rounded-2xl bg-white/10 px-4 py-3">
                    <p className="text-xl font-black">CBT</p>
                    <p className="text-[10px] font-bold uppercase text-slate-300">Mode</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
              <section className="border-b border-slate-200 p-6 sm:p-8 lg:border-b-0 lg:border-r">
                <h2 className="text-lg font-black text-slate-950">Peraturan ujian</h2>
                <div className="mt-4 space-y-3">
                  {[
                    "Kerjakan soal secara mandiri sesuai waktu yang tersedia.",
                    "Jawaban dapat diubah selama ujian belum dikumpulkan.",
                    "Gunakan fitur ragu-ragu untuk menandai nomor yang ingin dicek ulang.",
                    "Saat waktu habis, sistem akan otomatis mengumpulkan jawaban.",
                    "Setelah dikumpulkan, jawaban dikunci dan pembahasan akan terbuka.",
                  ].map((rule, index) => (
                    <div key={rule} className="flex gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-black text-white">
                        {index + 1}
                      </span>
                      <p className="text-sm font-medium leading-relaxed text-slate-700">{rule}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="p-6 sm:p-8">
                <h2 className="text-lg font-black text-slate-950">Tata cara penggunaan</h2>
                <div className="mt-4 space-y-4">
                  <Step title="Pilih jawaban" body="Klik opsi A sampai E. Klik opsi yang sama sekali lagi untuk mengosongkan jawaban." />
                  <Step title="Pindah nomor" body="Gunakan tombol berikutnya, sebelumnya, atau panel navigasi nomor di kanan layar." />
                  <Step title="Tandai ragu-ragu" body="Klik tombol tandai ragu jika soal perlu dicek ulang sebelum submit." />
                  <Step title="Kumpulkan" body="Tekan kumpulkan saat yakin. Sistem akan meminta konfirmasi terlebih dahulu." />
                </div>

                <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-4">
                  <h3 className="text-sm font-black text-blue-950">Sistem penilaian</h3>
                  <p className="mt-1 text-sm font-medium leading-relaxed text-blue-900">{paket.scoring}</p>
                </div>

                <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4">
                  <input
                    type="checkbox"
                    checked={hasAgreed}
                    onChange={(event) => setHasAgreed(event.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
                  />
                  <span className="text-sm font-semibold leading-relaxed text-slate-700">
                    Saya sudah membaca peraturan dan siap memulai simulasi CBT.
                  </span>
                </label>

                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href="/siswa/tryout"
                    className="inline-flex justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-800 hover:bg-slate-50"
                  >
                    Kembali ke paket
                  </Link>
                  <button
                    type="button"
                    disabled={!hasAgreed}
                    onClick={() => setHasStarted(true)}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                  >
                    Mulai ujian
                    <ChevronRight size={18} />
                  </button>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (submitted && result) {
    return (
      <div className="mx-auto max-w-5xl space-y-8 px-4 py-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">Hasil CBT</p>
              <h1 className="mt-2 text-2xl font-black text-slate-950">{paket.title}</h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
                Skor dihitung otomatis setelah sesi dikumpulkan. Pembahasan dibuka agar siswa bisa evaluasi
                nomor yang salah, kosong, dan ragu-ragu.
              </p>
            </div>
            <div className="rounded-2xl bg-slate-950 px-7 py-5 text-white">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-300">Skor akhir</p>
              <p className="mt-1 text-4xl font-black">{result.skor}</p>
            </div>
          </div>

          <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Benar" value={String(result.benar)} tone="emerald" />
            <Stat label="Salah" value={String(result.salah)} tone="rose" />
            <Stat label="Kosong" value={String(result.kosong)} tone="slate" />
            <Stat label="Ditandai" value={String(markedCount)} tone="amber" />
          </div>

          {rationalization && (
            <div className="mt-7 rounded-3xl border border-blue-100 bg-blue-50 p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="inline-flex items-center gap-2 text-sm font-black text-blue-800">
                    <TrendingUp size={18} />
                    Rasionalisasi ujian mandiri
                  </p>
                  <h2 className="mt-2 text-2xl font-black text-blue-950">
                    Skor estimasi {rationalization.normalizedScore}/1000
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm font-semibold leading-relaxed text-blue-950">
                    {rationalization.summary}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <MiniStat label="Akurasi" value={rationalization.accuracy} tone="emerald" />
                  <MiniStat label="Terisi" value={rationalization.answeredRate} tone="slate" />
                </div>
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-2">
                {rationalization.targets.slice(0, 6).map((target) => (
                  <div key={target.id} className="rounded-2xl bg-white p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-black text-slate-950">{target.jalur}</p>
                        <p className="mt-0.5 text-xs font-semibold text-slate-500">{target.kampus}</p>
                      </div>
                      <span className={`rounded-full px-2.5 py-1 text-[11px] font-black ${getRationalTone(target.tone)}`}>
                        {target.status}
                      </span>
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full bg-blue-600" style={{ width: `${target.probability}%` }} />
                    </div>
                    <div className="mt-2 flex justify-between text-xs font-bold text-slate-500">
                      <span>Peluang {target.probability}%</span>
                      <span>{target.gap >= 0 ? "+" : ""}{target.gap} dari benchmark</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-2xl bg-white p-4">
                <p className="flex items-center gap-2 text-sm font-black text-slate-950">
                  <ShieldCheck size={17} className="text-blue-700" />
                  Rekomendasi berikutnya
                </p>
                <div className="mt-3 grid gap-2">
                  {rationalization.nextActions.map((action) => (
                    <div key={action} className="flex gap-2 text-sm font-semibold leading-relaxed text-slate-700">
                      <Target size={15} className="mt-0.5 shrink-0 text-blue-700" />
                      {action}
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-xs font-medium leading-relaxed text-slate-500">
                  Catatan: rasionalisasi ini adalah estimasi internal {site.name}, bukan jaminan kelulusan resmi kampus.
                </p>
              </div>
            </div>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/siswa/tryout"
              className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-800 hover:bg-slate-50"
            >
              Kembali ke paket
            </Link>
            <button
              type="button"
              onClick={resetExam}
              className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700"
            >
              Ulangi simulasi
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-black text-slate-950">Pembahasan per nomor</h2>
            <p className="mt-1 text-sm text-slate-600">Gunakan ini sebagai bahan review setelah ujian.</p>
          </div>

          {soalList.map((q) => {
            const answer = answers[q.id];
            const ok = answer === q.kunci;
            const isEmpty = answer == null;

            return (
              <div key={q.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-700">
                    No. {q.nomor}
                  </span>
                  <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-700">
                    {q.bagian}
                  </span>
                  <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-800">
                    {q.tingkat}
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                      ok
                        ? "bg-emerald-100 text-emerald-800"
                        : isEmpty
                          ? "bg-slate-100 text-slate-700"
                          : "bg-rose-100 text-rose-800"
                    }`}
                  >
                    {ok ? "Benar" : isEmpty ? "Kosong" : "Salah"}
                  </span>
                  {marked[q.id] && (
                    <span className="rounded-full bg-orange-100 px-2.5 py-1 text-[11px] font-bold text-orange-800">
                      Ragu-ragu
                    </span>
                  )}
                </div>
                <p className="mt-4 text-sm font-semibold leading-relaxed text-slate-900">{q.pertanyaan}</p>
                <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                  <p>
                    <span className="font-bold text-emerald-700">Kunci: {q.kunci}</span>
                    <span className="px-2 text-slate-300">|</span>
                    Jawaban Anda: {answer ?? "-"}
                  </p>
                  <p className="mt-2 leading-relaxed">{q.pembahasan}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-100">
      <div className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">Mode CBT</p>
            <h1 className="mt-1 text-xl font-black text-slate-950">{paket.title}</h1>
            <p className="mt-1 text-sm text-slate-600">
              {soalList.length} soal - {paket.scoring}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div
              className={`inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-black ${
                timeLeft <= 300 ? "bg-rose-600 text-white" : "bg-slate-950 text-white"
              }`}
            >
              <Clock3 size={18} />
              {formatTime(timeLeft)}
            </div>
            <button
              type="button"
              onClick={() => setShowSubmitConfirm(true)}
              className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black text-white shadow-sm hover:bg-blue-700"
            >
              <Send size={17} />
              Kumpulkan
            </button>
          </div>
        </div>
      </div>

      <main className="mx-auto grid max-w-7xl gap-5 px-4 py-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 bg-slate-50 px-5 py-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-black text-white">
                  Soal {idx + 1} / {soalList.length}
                </span>
                <span className="rounded-xl bg-white px-3 py-1.5 text-xs font-bold text-slate-600 ring-1 ring-slate-200">
                  {current.bagian}
                </span>
                <span className="rounded-xl bg-white px-3 py-1.5 text-xs font-bold text-slate-600 ring-1 ring-slate-200">
                  {current.tingkat}
                </span>
              </div>
              <button
                type="button"
                onClick={toggleMark}
                className={`inline-flex w-fit items-center gap-2 rounded-xl px-3 py-2 text-xs font-black transition ${
                  marked[current.id]
                    ? "bg-orange-100 text-orange-800 ring-1 ring-orange-200"
                    : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100"
                }`}
              >
                <Flag size={15} />
                {marked[current.id] ? "Ragu-ragu" : "Tandai ragu"}
              </button>
            </div>
          </div>

          <div className="min-h-[520px] px-5 py-6 sm:px-7">
            <p className="text-base font-bold leading-8 text-slate-950">{current.pertanyaan}</p>

            <div className="mt-7 space-y-3">
              {choiceKeys.map((key) => {
                const active = selected === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setAnswer(key)}
                    className={`flex w-full items-start gap-4 rounded-2xl border px-4 py-4 text-left text-sm transition ${
                      active
                        ? "border-blue-500 bg-blue-50 text-blue-950 shadow-sm ring-2 ring-blue-100"
                        : "border-slate-200 bg-white text-slate-800 hover:border-blue-200 hover:bg-slate-50"
                    }`}
                  >
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-sm font-black ${
                        active ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {key}
                    </span>
                    <span className="pt-1 leading-relaxed">{current.opsi[key]}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <aside className="space-y-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-wide text-slate-500">Ringkasan</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">Progres pengerjaan</p>
              </div>
              <div className="rounded-2xl bg-blue-50 p-3 text-blue-700">
                <ListChecks size={20} />
              </div>
            </div>

            <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-blue-600" style={{ width: `${progress}%` }} />
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2">
              <MiniStat label="Terisi" value={answeredCount} tone="emerald" />
              <MiniStat label="Kosong" value={emptyCount} tone="slate" />
              <MiniStat label="Ragu" value={markedCount} tone="amber" />
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs font-black uppercase tracking-wide text-slate-500">Navigasi soal</p>
              <span className="text-xs font-bold text-slate-500">{idx + 1}/{soalList.length}</span>
            </div>

            <div className="mt-4 max-h-[490px] overflow-y-auto pr-1">
              <div className="grid grid-cols-5 gap-2">
                {soalList.map((q, i) => {
                  const filled = answers[q.id] != null;
                  const isMarked = marked[q.id];
                  const active = i === idx;

                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => setIdx(i)}
                      className={`relative h-10 rounded-xl text-xs font-black transition ${
                        active
                          ? "bg-blue-600 text-white ring-2 ring-blue-200"
                          : isMarked
                            ? "bg-orange-100 text-orange-900 hover:bg-orange-200"
                            : filled
                              ? "bg-emerald-100 text-emerald-900 hover:bg-emerald-200"
                              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                      aria-label={`Soal ${q.nomor}`}
                    >
                      {q.nomor}
                      {isMarked && <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-orange-500" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 text-[11px] font-bold text-slate-600">
              <Legend color="bg-blue-600" label="Aktif" />
              <Legend color="bg-emerald-400" label="Terjawab" />
              <Legend color="bg-orange-400" label="Ragu-ragu" />
              <Legend color="bg-slate-200" label="Kosong" />
            </div>
          </div>
        </aside>
      </main>

      <div className="sticky bottom-0 z-20 border-t border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
          <button
            type="button"
            disabled={idx === 0}
            onClick={() => setIdx((i) => Math.max(0, i - 1))}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-800 shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft size={18} />
            Sebelumnya
          </button>

          <div className="hidden items-center gap-2 text-xs font-bold text-slate-500 sm:flex">
            <Bookmark size={15} />
            Jawaban tersimpan otomatis selama sesi ini
          </div>

          {idx < soalList.length - 1 ? (
            <button
              type="button"
              onClick={() => setIdx((i) => Math.min(soalList.length - 1, i + 1))}
              className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black text-white shadow-sm hover:bg-blue-700"
            >
              Berikutnya
              <ChevronRight size={18} />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setShowSubmitConfirm(true)}
              className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-black text-white shadow-sm hover:bg-emerald-700"
            >
              <FileCheck2 size={18} />
              Selesai
            </button>
          )}
        </div>
      </div>

      {showSubmitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="mb-4 inline-flex rounded-2xl bg-amber-50 p-3 text-amber-700">
                  <AlertTriangle size={22} />
                </div>
                <h2 className="text-xl font-black text-slate-950">Kumpulkan jawaban?</h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  Setelah dikumpulkan, sesi akan dikunci dan pembahasan langsung ditampilkan.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowSubmitConfirm(false)}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                aria-label="Tutup"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-2">
              <MiniStat label="Terisi" value={answeredCount} tone="emerald" />
              <MiniStat label="Kosong" value={emptyCount} tone="slate" />
              <MiniStat label="Ragu" value={markedCount} tone="amber" />
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setShowSubmitConfirm(false)}
                className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-800 hover:bg-slate-50"
              >
                Cek lagi
              </button>
              <button
                type="button"
                onClick={submitExam}
                className="flex-1 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-black text-white hover:bg-blue-700"
              >
                Ya, kumpulkan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function formatTime(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "emerald" | "rose" | "slate" | "amber";
}) {
  const styles = {
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-800",
    rose: "border-rose-200 bg-rose-50 text-rose-800",
    slate: "border-slate-200 bg-slate-50 text-slate-800",
    amber: "border-amber-200 bg-amber-50 text-amber-800",
  };

  return (
    <div className={`rounded-2xl border p-4 ${styles[tone]}`}>
      <p className="text-[11px] font-bold uppercase tracking-wide opacity-70">{label}</p>
      <p className="mt-1 text-2xl font-black">{value}</p>
    </div>
  );
}

function getRationalTone(tone: "emerald" | "blue" | "amber" | "rose") {
  const styles = {
    emerald: "bg-emerald-100 text-emerald-800",
    blue: "bg-blue-100 text-blue-800",
    amber: "bg-amber-100 text-amber-800",
    rose: "bg-rose-100 text-rose-800",
  };

  return styles[tone];
}

function MiniStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "emerald" | "slate" | "amber";
}) {
  const styles = {
    emerald: "bg-emerald-50 text-emerald-800",
    slate: "bg-slate-100 text-slate-700",
    amber: "bg-orange-50 text-orange-800",
  };

  return (
    <div className={`rounded-2xl px-3 py-3 text-center ${styles[tone]}`}>
      <p className="text-lg font-black">{value}</p>
      <p className="text-[10px] font-bold uppercase tracking-wide">{label}</p>
    </div>
  );
}

function Step({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <p className="text-sm font-black text-slate-950">{title}</p>
      <p className="mt-1 text-sm leading-relaxed text-slate-600">{body}</p>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
      {label}
    </div>
  );
}

