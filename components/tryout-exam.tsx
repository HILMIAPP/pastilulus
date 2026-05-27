"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { TryoutPaket, TryoutQuestion } from "@/lib/app-data";
import { soalPaket1, soalPaketById } from "@/lib/app-data";
import { computeScore, readAttempts, incrementAttempts, MAX_ATTEMPTS } from "@/lib/tryout-scoring";
import type { ScoreResult } from "@/lib/tryout-scoring";
import { calculateRationalization } from "@/lib/um-rationalization";
import { site, storageKeys } from "@/lib/site-config";
import {
  AlertTriangle,
  Ban,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Download,
  FileCheck2,
  FileText,
  Flag,
  ListChecks,
  Send,
  ShieldCheck,
  Target,
  TrendingUp,
  X,
} from "lucide-react";

// ─── PDF generators (client-side print) ──────────────────────────────────────

function printInNewWindow(html: string) {
  const win = window.open("", "_blank");
  if (!win) return;
  // Tulis ke srcdoc via Blob URL — menghindari document.write deprecation
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  win.location.href = url;
  // Bersihkan Blob URL setelah tab terbuka + jendela cetak muncul
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

function buildLaporanHtml(
  paket: TryoutPaket,
  score: ScoreResult,
  answers: Record<string, string | null>,
  rationalization: ReturnType<typeof calculateRationalization> | null,
  markedCount: number,
): string {
  const tanggal = new Intl.DateTimeFormat("id-ID", { dateStyle: "full", timeStyle: "short" }).format(new Date());
  const akurasi = score.total > 0 ? Math.round((score.benar / score.total) * 100) : 0;
  const isIrt = score.scoringType === "irt";

  const bagianRows = Object.entries(score.bagianStats).map(([bagian, stat]) => {
    const pct = stat.total > 0 ? Math.round((stat.benar / stat.total) * 100) : 0;
    const irtCell = isIrt ? `<td>${stat.irtScore ?? "-"}</td>` : "";
    return `<tr>
      <td>${bagian}</td>
      <td>${stat.total}</td>
      <td class="ok">${stat.benar}</td>
      <td class="err">${stat.salah}</td>
      <td>${stat.kosong}</td>
      <td>${pct}%</td>
      ${irtCell}
    </tr>`;
  }).join("");

  const rationRows = (!isIrt && rationalization)
    ? rationalization.targets.map((t) => `<tr>
        <td>${t.kampus}</td>
        <td>${t.jalur}</td>
        <td>${t.benchmark}</td>
        <td class="${t.gap >= 0 ? "ok" : "err"}">${t.gap >= 0 ? "+" : ""}${t.gap}</td>
        <td>${t.probability}%</td>
        <td>${t.status}</td>
      </tr>`).join("")
    : "";

  const rationSection = (!isIrt && rationalization) ? `
    <h2>Rasionalisasi Ujian Mandiri</h2>
    <p><strong>Skor estimasi:</strong> ${rationalization.normalizedScore}/1000 &nbsp;|&nbsp;
       <strong>Akurasi:</strong> ${rationalization.accuracy} &nbsp;|&nbsp;
       <strong>Jawab terisi:</strong> ${rationalization.answeredRate}</p>
    <p style="margin-bottom:8px">${rationalization.summary}</p>
    <table>
      <thead><tr><th>Kampus</th><th>Jalur</th><th>Benchmark</th><th>Gap</th><th>Peluang</th><th>Status</th></tr></thead>
      <tbody>${rationRows}</tbody>
    </table>
    <h3 style="margin-top:16px">Rekomendasi selanjutnya</h3>
    <ul>${rationalization.nextActions.map((a) => `<li>${a}</li>`).join("")}</ul>
  ` : "";

  const irtHeader = isIrt ? "<th>Skor IRT</th>" : "";
  const irtNote = isIrt
    ? `<p><em>Skor dihitung menggunakan model IRT 3-PL. Skala sub-skor: 200–800. Skor total: 0–1000.</em></p>`
    : "";

  return `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<title>Laporan Tryout — ${paket.title}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 12px; color: #111; padding: 32px; max-width: 780px; margin: 0 auto; }
  h1 { font-size: 20px; font-weight: 900; margin-bottom: 4px; }
  h2 { font-size: 14px; font-weight: 800; margin: 24px 0 8px; border-bottom: 2px solid #111; padding-bottom: 4px; }
  h3 { font-size: 13px; font-weight: 700; margin-top: 12px; }
  p { margin-bottom: 6px; line-height: 1.6; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; border-bottom: 3px solid #111; padding-bottom: 16px; }
  .brand { font-size: 10px; text-transform: uppercase; letter-spacing: .1em; color: #555; margin-bottom: 4px; }
  .score-box { background: #111; color: #fff; padding: 12px 20px; border-radius: 8px; text-align: center; }
  .score-box .label { font-size: 9px; text-transform: uppercase; letter-spacing:.1em; color:#aaa; }
  .score-box .value { font-size: 36px; font-weight: 900; line-height: 1; }
  .score-box .sub { font-size: 10px; color: #aaa; margin-top: 2px; }
  .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin: 12px 0; }
  .card { border: 1px solid #ddd; border-radius: 6px; padding: 10px 12px; }
  .card .lbl { font-size: 10px; font-weight: 700; color: #666; text-transform: uppercase; }
  .card .val { font-size: 20px; font-weight: 900; margin-top: 2px; }
  table { width: 100%; border-collapse: collapse; margin: 8px 0; font-size: 11px; }
  th { background: #f3f4f6; font-weight: 800; text-align: left; padding: 6px 8px; border: 1px solid #e5e7eb; }
  td { padding: 5px 8px; border: 1px solid #e5e7eb; }
  tr:nth-child(even) td { background: #fafafa; }
  .ok { color: #059669; font-weight: 700; }
  .err { color: #dc2626; font-weight: 700; }
  ul { padding-left: 18px; margin-top: 4px; }
  li { margin-bottom: 4px; }
  .footer { margin-top: 32px; font-size: 10px; color: #888; border-top: 1px solid #e5e7eb; padding-top: 12px; }
  @media print { body { padding: 16px; } @page { margin: 1.5cm; } }
</style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand">${site.name} · Laporan Hasil Tryout</div>
      <h1>${paket.title}</h1>
      <p style="color:#555;font-size:11px">${paket.subtitle}</p>
      <p style="color:#888;font-size:10px;margin-top:4px">${tanggal}</p>
    </div>
    <div class="score-box">
      <div class="label">${isIrt ? "Skor IRT" : "Skor Akhir"}</div>
      <div class="value">${score.skor}</div>
      ${isIrt ? '<div class="sub">skala 0–1000</div>' : ""}
    </div>
  </div>

  <h2>Ringkasan Hasil</h2>
  <div class="grid">
    <div class="card"><div class="lbl">Benar</div><div class="val ok">${score.benar}</div></div>
    <div class="card"><div class="lbl">Salah</div><div class="val err">${score.salah}</div></div>
    <div class="card"><div class="lbl">Kosong</div><div class="val">${score.kosong}</div></div>
    <div class="card"><div class="lbl">Ditandai</div><div class="val">${markedCount}</div></div>
  </div>
  <p><strong>Total soal:</strong> ${score.total} &nbsp;|&nbsp; <strong>Akurasi:</strong> ${akurasi}% &nbsp;|&nbsp; <strong>Sistem:</strong> ${paket.scoring}</p>
  ${irtNote}

  <h2>Analisis Per Bagian</h2>
  <table>
    <thead><tr><th>Bagian / Sub-Tes</th><th>Total</th><th>Benar</th><th>Salah</th><th>Kosong</th><th>Akurasi</th>${irtHeader}</tr></thead>
    <tbody>${bagianRows}</tbody>
  </table>

  ${rationSection}

  <div class="footer">
    Laporan ini dibuat otomatis oleh ${site.name} (${site.url}) pada ${tanggal}.<br>
    Rasionalisasi adalah estimasi internal — bukan jaminan kelulusan resmi dari kampus.
  </div>
</body>
</html>`;
}

function buildPembahasanHtml(
  paket: TryoutPaket,
  soalList: TryoutQuestion[],
  answers: Record<string, string | null>,
  marked: Record<string, boolean>,
): string {
  const tanggal = new Intl.DateTimeFormat("id-ID", { dateStyle: "long" }).format(new Date());

  const soalHtml = soalList.map((q) => {
    const ans = answers[q.id];
    const ok = ans === q.kunci;
    const isEmpty = ans == null;
    const statusClass = ok ? "ok" : isEmpty ? "kosong" : "err";
    const statusLabel = ok ? "✓ Benar" : isEmpty ? "○ Kosong" : "✗ Salah";
    const markedTag = marked[q.id] ? `<span class="tag ragu">Ragu-ragu</span>` : "";

    const opsiHtml = Object.entries(q.opsi).map(([key, val]) => {
      const isKunci = key === q.kunci;
      const isUser = key === ans;
      let cls = "opsi";
      if (isKunci) cls += " kunci";
      else if (isUser && !ok) cls += " salah-user";
      return `<div class="${cls}">${isKunci ? "✓" : isUser && !ok ? "✗" : "○"} <strong>${key}.</strong> ${val}</div>`;
    }).join("");

    return `<div class="soal-card">
      <div class="soal-head">
        <span class="tag">No. ${q.nomor}</span>
        <span class="tag blue">${q.bagian}</span>
        <span class="tag amber">${q.tingkat}</span>
        <span class="tag ${statusClass}">${statusLabel}</span>
        ${markedTag}
      </div>
      <p class="pertanyaan">${q.pertanyaan}</p>
      <div class="opsi-list">${opsiHtml}</div>
      <div class="pembahasan">
        <strong>Kunci:</strong> ${q.kunci}
        ${ans && !ok ? `&nbsp;·&nbsp; <strong>Jawabanmu:</strong> ${ans}` : ""}
        <p class="bahas-text">${q.pembahasan}</p>
      </div>
    </div>`;
  }).join("");

  return `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<title>Pembahasan — ${paket.title}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 12px; color: #111; padding: 32px; max-width: 780px; margin: 0 auto; }
  h1 { font-size: 18px; font-weight: 900; margin-bottom: 2px; }
  .header { margin-bottom: 24px; border-bottom: 3px solid #111; padding-bottom: 14px; }
  .brand { font-size: 10px; text-transform: uppercase; letter-spacing:.1em; color:#555; margin-bottom: 4px; }
  .soal-card { border: 1px solid #e5e7eb; border-radius: 8px; padding: 14px 16px; margin-bottom: 14px; page-break-inside: avoid; }
  .soal-head { display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 10px; }
  .tag { background: #f3f4f6; border-radius: 20px; padding: 2px 8px; font-size: 10px; font-weight: 700; color: #374151; }
  .tag.blue { background: #eff6ff; color: #1d4ed8; }
  .tag.amber { background: #fffbeb; color: #92400e; }
  .tag.ok { background: #d1fae5; color: #065f46; }
  .tag.err { background: #fee2e2; color: #991b1b; }
  .tag.kosong { background: #f1f5f9; color: #475569; }
  .tag.ragu { background: #fff7ed; color: #9a3412; }
  .pertanyaan { font-size: 12px; font-weight: 600; line-height: 1.6; margin-bottom: 10px; color: #1e293b; }
  .opsi-list { margin-bottom: 10px; }
  .opsi { padding: 4px 0; font-size: 11px; color: #374151; line-height: 1.5; }
  .opsi.kunci { color: #065f46; font-weight: 700; background: #d1fae5; padding: 3px 8px; border-radius: 4px; margin: 2px 0; }
  .opsi.salah-user { color: #991b1b; background: #fee2e2; padding: 3px 8px; border-radius: 4px; margin: 2px 0; }
  .pembahasan { background: #f8fafc; border-left: 3px solid #3b82f6; padding: 8px 12px; border-radius: 0 6px 6px 0; font-size: 11px; }
  .bahas-text { margin-top: 6px; line-height: 1.6; color: #374151; }
  .footer { margin-top: 28px; font-size: 10px; color: #888; border-top: 1px solid #e5e7eb; padding-top: 10px; }
  @media print { body { padding: 16px; } @page { margin: 1.2cm; size: A4; } .soal-card { page-break-inside: avoid; } }
</style>
</head>
<body>
  <div class="header">
    <div class="brand">${site.name} · Pembahasan Tryout</div>
    <h1>${paket.title}</h1>
    <p style="color:#555;font-size:11px">${paket.subtitle} &nbsp;·&nbsp; ${soalList.length} soal &nbsp;·&nbsp; ${tanggal}</p>
  </div>
  ${soalHtml}
  <div class="footer">
    Pembahasan ini dibuat oleh ${site.name} (${site.url}). Gunakan sebagai bahan review mandiri.
  </div>
</body>
</html>`;
}

type Props = { paket: TryoutPaket };
type Choice = "A" | "B" | "C" | "D" | "E";
const choiceKeys: Choice[] = ["A", "B", "C", "D", "E"];

// ─── Attempt tracking ─────────────────────────────────────────────────────────

function AttemptsBlocked({ paket }: { paket: TryoutPaket }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md rounded-3xl border border-rose-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
          <Ban size={26} />
        </div>
        <h1 className="mt-5 text-xl font-black text-slate-950">Batas percobaan tercapai</h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          Paket <span className="font-bold">{paket.title}</span> sudah dikerjakan{" "}
          <span className="font-black text-rose-600">{MAX_ATTEMPTS}×</span>. Setiap paket hanya bisa
          diakses maksimal {MAX_ATTEMPTS} kali agar tryout tetap bermakna sebagai simulasi nyata.
        </p>
        <div className="mt-6 flex flex-col gap-3">
          <Link
            href="/siswa/tryout"
            className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white hover:bg-slate-800"
          >
            Pilih paket lain
          </Link>
          <Link
            href="/siswa/rasionalisasi"
            className="inline-flex w-full items-center justify-center rounded-2xl border border-slate-200 px-5 py-3 text-sm font-black text-slate-700 hover:bg-slate-50"
          >
            Lihat rasionalisasi
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function TryoutExam({ paket }: Props) {
  const soalList = useMemo(() => soalPaketById[paket.id] ?? soalPaket1, [paket.id]);

  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, Choice | null>>({});
  const [marked, setMarked] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [hasAgreed, setHasAgreed] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [timeLeft, setTimeLeft] = useState(paket.durasiMenit * 60);
  const [attemptCount, setAttemptCount] = useState(0);
  const [attemptLoaded, setAttemptLoaded] = useState(false);

  // Baca jumlah percobaan dari localStorage (client-only)
  useEffect(() => {
    setAttemptCount(readAttempts(storageKeys.tryoutAttempts, paket.id));
    setAttemptLoaded(true);
  }, [paket.id]);

  const current = soalList[idx];
  const selected = current ? (answers[current.id] ?? null) : null;

  const answeredCount = soalList.filter((q) => answers[q.id] != null).length;
  const markedCount = soalList.filter((q) => marked[q.id]).length;
  const emptyCount = soalList.length - answeredCount;
  const progress = soalList.length > 0 ? Math.round((answeredCount / soalList.length) * 100) : 0;
  const attemptsLeft = MAX_ATTEMPTS - attemptCount;

  // Timer
  useEffect(() => {
    if (!hasStarted || submitted) return;
    const timer = window.setInterval(() => {
      setTimeLeft((v) => {
        if (v <= 1) {
          window.clearInterval(timer);
          window.setTimeout(() => { setShowSubmitConfirm(false); setSubmitted(true); }, 0);
          return 0;
        }
        return v - 1;
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

  const handleStart = () => {
    // Catat percobaan saat siswa mulai (bukan saat submit)
    const next = incrementAttempts(storageKeys.tryoutAttempts, paket.id);
    setAttemptCount(next);
    setHasStarted(true);
  };

  const submitExam = () => { setShowSubmitConfirm(false); setSubmitted(true); };

  const resetExam = () => {
    setSubmitted(false);
    setHasStarted(false);
    setHasAgreed(false);
    setAnswers({});
    setMarked({});
    setIdx(0);
    setTimeLeft(paket.durasiMenit * 60);
  };

  const score: ScoreResult | null = useMemo(
    () => (submitted ? computeScore(soalList, answers, paket.scoringType) : null),
    [submitted, soalList, answers, paket.scoringType],
  );

  // Simpan hasil & kirim ke server setelah submit
  useEffect(() => {
    if (!submitted || !score) return;
    window.localStorage.setItem(
      storageKeys.latestTryoutResult,
      JSON.stringify({ ...score, paketTitle: paket.title, createdAt: new Date().toISOString() }),
    );
    void fetch("/api/tryout/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paket: { slug: paket.slug, title: paket.title, subtitle: paket.subtitle, durasiMenit: paket.durasiMenit, akses: paket.akses }, result: score, questions: soalList, answers }),
    });
  }, [submitted, score, paket, soalList, answers]);

  const rationalization = useMemo(
    () => (score ? calculateRationalization(score) : null),
    [score],
  );

  // ── Guard: soal kosong ──────────────────────────────────────────────────────
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

  // ── Guard: batas percobaan ──────────────────────────────────────────────────
  if (attemptLoaded && attemptCount >= MAX_ATTEMPTS && !hasStarted) {
    return <AttemptsBlocked paket={paket} />;
  }

  // ── Layar persiapan ─────────────────────────────────────────────────────────
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
                    <p className="text-xl font-black">{paket.scoringType === "irt" ? "IRT" : "CBT"}</p>
                    <p className="text-[10px] font-bold uppercase text-slate-300">Scoring</p>
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
                    `Setiap paket hanya bisa dikerjakan maksimal ${MAX_ATTEMPTS}× — sisa percobaan paket ini: ${attemptsLeft}×.`,
                  ].map((rule, index) => (
                    <div key={rule} className="flex gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-black text-white ${index === 5 ? "bg-amber-500" : "bg-blue-600"}`}>
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

                <div className={`mt-6 rounded-2xl border p-4 ${paket.scoringType === "irt" ? "border-emerald-100 bg-emerald-50" : "border-blue-100 bg-blue-50"}`}>
                  <h3 className={`text-sm font-black ${paket.scoringType === "irt" ? "text-emerald-950" : "text-blue-950"}`}>
                    Sistem penilaian {paket.scoringType === "irt" ? "— IRT" : ""}
                  </h3>
                  <p className={`mt-1 text-sm font-medium leading-relaxed ${paket.scoringType === "irt" ? "text-emerald-900" : "text-blue-900"}`}>
                    {paket.scoring}
                  </p>
                  {paket.scoringType === "irt" && (
                    <p className="mt-2 text-xs font-semibold leading-relaxed text-emerald-800">
                      Soal HOTS lebih berpengaruh ke skor. Kosong tidak dipotong — lebih baik kosong daripada menebak asal.
                    </p>
                  )}
                </div>

                {/* Attempt indicator */}
                <div className={`mt-4 rounded-2xl border p-4 ${attemptsLeft <= 1 ? "border-rose-200 bg-rose-50" : "border-amber-100 bg-amber-50"}`}>
                  <p className={`text-sm font-black ${attemptsLeft <= 1 ? "text-rose-800" : "text-amber-800"}`}>
                    Percobaan tersisa: {attemptsLeft} dari {MAX_ATTEMPTS}
                  </p>
                  <div className="mt-2 flex gap-1">
                    {Array.from({ length: MAX_ATTEMPTS }).map((_, i) => (
                      <div key={i} className={`h-2 flex-1 rounded-full ${i < attemptCount ? "bg-slate-400" : attemptsLeft <= 1 ? "bg-rose-400" : "bg-amber-400"}`} />
                    ))}
                  </div>
                </div>

                <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4">
                  <input
                    type="checkbox"
                    checked={hasAgreed}
                    onChange={(e) => setHasAgreed(e.target.checked)}
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
                    onClick={handleStart}
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

  // ── Layar hasil ──────────────────────────────────────────────────────────────
  if (submitted && score) {
    const isIrt = score.scoringType === "irt";
    const canRetry = attemptCount < MAX_ATTEMPTS;

    return (
      <div className="mx-auto max-w-5xl space-y-8 px-4 py-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
                Hasil {isIrt ? "IRT" : "CBT"}
              </p>
              <h1 className="mt-2 text-2xl font-black text-slate-950">{paket.title}</h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
                {isIrt
                  ? "Skor dihitung menggunakan model IRT 3-PL per sub-tes. Setiap sub-tes menghasilkan estimasi kemampuan (θ) yang dikonversi ke skala 0–1000."
                  : "Skor dihitung otomatis setelah sesi dikumpulkan. Pembahasan dibuka agar siswa bisa evaluasi nomor yang salah, kosong, dan ragu-ragu."}
              </p>
            </div>
            <div className="rounded-2xl bg-slate-950 px-7 py-5 text-white">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-300">
                {isIrt ? "Skor IRT" : "Skor akhir"}
              </p>
              <p className="mt-1 text-4xl font-black">{score.skor}</p>
              {isIrt && <p className="mt-1 text-xs text-slate-400">skala 0–1000</p>}
            </div>
          </div>

          <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Benar" value={String(score.benar)} tone="emerald" />
            <Stat label="Salah" value={String(score.salah)} tone="rose" />
            <Stat label="Kosong" value={String(score.kosong)} tone="slate" />
            <Stat label="Ditandai" value={String(markedCount)} tone="amber" />
          </div>

          {/* IRT Sub-tes scores */}
          {isIrt && Object.keys(score.bagianStats).length > 0 && (
            <div className="mt-7 rounded-3xl border border-emerald-100 bg-emerald-50 p-5">
              <p className="text-sm font-black text-emerald-900">Skor IRT per Sub-Tes (200–800)</p>
              <div className="mt-4 space-y-3">
                {Object.entries(score.bagianStats).map(([bagian, stat]) => {
                  const subScore = stat.irtScore ?? 500;
                  const pct = Math.round(((subScore - 200) / 600) * 100);
                  const barColor = subScore >= 600 ? "bg-emerald-500" : subScore >= 450 ? "bg-amber-400" : "bg-rose-500";
                  return (
                    <div key={bagian}>
                      <div className="flex items-center justify-between gap-3 text-sm">
                        <span className="font-black text-emerald-900">{bagian}</span>
                        <div className="flex items-center gap-3 text-xs font-bold text-emerald-700">
                          <span>{stat.benar}✓ {stat.salah}✗ {stat.kosong}○</span>
                          <span className="w-12 text-right font-black text-emerald-950">{subScore}</span>
                        </div>
                      </div>
                      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-emerald-200">
                        <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="mt-3 text-xs font-semibold text-emerald-700">
                Sub-skor &lt;450 → perlu penguatan · 450–599 → bisa dioptimalkan · ≥600 → sudah kuat
              </p>
            </div>
          )}

          {/* Rasionalisasi (classical only) */}
          {!isIrt && rationalization && (
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

          {/* Download buttons */}
          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="mb-3 text-xs font-black uppercase tracking-wide text-slate-500">Unduh dokumen</p>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() =>
                  printInNewWindow(
                    buildLaporanHtml(paket, score, answers, rationalization, markedCount),
                  )
                }
                className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white hover:bg-slate-800"
              >
                <Download size={15} /> Unduh Laporan
              </button>
              <button
                type="button"
                onClick={() =>
                  printInNewWindow(
                    buildPembahasanHtml(paket, soalList, answers, marked),
                  )
                }
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-800 hover:bg-slate-50"
              >
                <FileText size={15} /> Unduh Pembahasan
              </button>
            </div>
            <p className="mt-2 text-[11px] text-slate-400">
              Klik → dialog print muncul → pilih <strong>Simpan sebagai PDF</strong> di tujuan printer.
            </p>
          </div>

          {/* Attempt counter + action buttons */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-semibold text-slate-500">
              Percobaan terpakai: <span className="font-black text-slate-900">{attemptCount}/{MAX_ATTEMPTS}</span>
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/siswa/tryout"
                className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-800 hover:bg-slate-50"
              >
                Kembali ke paket
              </Link>
              {canRetry ? (
                <button
                  type="button"
                  onClick={resetExam}
                  className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700"
                >
                  Ulangi ({MAX_ATTEMPTS - attemptCount}× tersisa)
                </button>
              ) : (
                <span className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-5 py-3 text-sm font-bold text-slate-500">
                  <Ban size={16} /> Batas percobaan tercapai
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Pembahasan per nomor */}
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
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-700">No. {q.nomor}</span>
                  <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-700">{q.bagian}</span>
                  <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-800">{q.tingkat}</span>
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${ok ? "bg-emerald-100 text-emerald-800" : isEmpty ? "bg-slate-100 text-slate-700" : "bg-rose-100 text-rose-800"}`}>
                    {ok ? "Benar" : isEmpty ? "Kosong" : "Salah"}
                  </span>
                  {marked[q.id] && (
                    <span className="rounded-full bg-orange-100 px-2.5 py-1 text-[11px] font-bold text-orange-800">Ragu-ragu</span>
                  )}
                </div>
                <p className="mt-4 text-sm font-semibold leading-relaxed text-slate-900">{q.pertanyaan}</p>
                <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                  <p>
                    <span className="font-bold text-emerald-700">Kunci: {q.kunci}</span>
                    <span className="px-2 text-slate-300">|</span>
                    Jawaban kamu: {answer ?? "-"}
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

  // ── Layar ujian aktif ────────────────────────────────────────────────────────
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-100">
      <div className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
              Mode {paket.scoringType === "irt" ? "IRT" : "CBT"}
            </p>
            <h1 className="mt-1 text-xl font-black text-slate-950">{paket.title}</h1>
            <p className="mt-1 text-sm text-slate-600">{soalList.length} soal · {paket.scoring}</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className={`inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-black ${timeLeft <= 300 ? "bg-rose-600 text-white" : "bg-slate-950 text-white"}`}>
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
                <span className={`rounded-xl px-3 py-1.5 text-xs font-bold ring-1 ${
                  current.tingkat === "HOTS"
                    ? "bg-rose-50 text-rose-700 ring-rose-200"
                    : current.tingkat === "SEDANG"
                      ? "bg-amber-50 text-amber-700 ring-amber-200"
                      : "bg-emerald-50 text-emerald-700 ring-emerald-200"
                }`}>
                  {current.tingkat}
                  {paket.scoringType === "irt" && current.tingkat === "HOTS" && " ★"}
                </span>
              </div>
              <button
                type="button"
                onClick={toggleMark}
                className={`inline-flex w-fit items-center gap-2 rounded-xl px-3 py-2 text-xs font-black transition ${marked[current.id] ? "bg-orange-100 text-orange-800 ring-1 ring-orange-200" : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100"}`}
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
                    className={`flex w-full items-start gap-4 rounded-2xl border px-4 py-4 text-left text-sm transition ${active ? "border-blue-500 bg-blue-50 text-blue-950 shadow-sm ring-2 ring-blue-100" : "border-slate-200 bg-white text-slate-800 hover:border-blue-200 hover:bg-slate-50"}`}
                  >
                    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-sm font-black ${active ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-700"}`}>
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
                      className={`relative h-10 rounded-xl text-xs font-black transition ${active ? "bg-blue-600 text-white ring-2 ring-blue-200" : isMarked ? "bg-orange-100 text-orange-900 hover:bg-orange-200" : filled ? "bg-emerald-100 text-emerald-900 hover:bg-emerald-200" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}
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

      {/* Bottom nav */}
      <div className="sticky bottom-0 z-20 border-t border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
          <button
            type="button"
            disabled={idx === 0}
            onClick={() => setIdx((i) => Math.max(0, i - 1))}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-800 shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft size={18} /> Sebelumnya
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
              Berikutnya <ChevronRight size={18} />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setShowSubmitConfirm(true)}
              className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-black text-white shadow-sm hover:bg-emerald-700"
            >
              <FileCheck2 size={18} /> Selesai
            </button>
          )}
        </div>
      </div>

      {/* Konfirmasi submit */}
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

// ─── Utility components ───────────────────────────────────────────────────────

function formatTime(totalSeconds: number) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

function Stat({ label, value, tone }: { label: string; value: string; tone: "emerald" | "rose" | "slate" | "amber" }) {
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

function MiniStat({ label, value, tone }: { label: string; value: number; tone: "emerald" | "slate" | "amber" }) {
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
