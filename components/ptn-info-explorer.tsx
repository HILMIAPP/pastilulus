"use client";

import { useEffect, useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Bell,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Clock3,
  ExternalLink,
  FileText,
  GraduationCap,
  MapPin,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Star,
  Target,
  X,
} from "lucide-react";
import { ptnDeadlines } from "@/components/student-dashboard-data";
import { uinData } from "@/components/uin-data";
import { storageKeys } from "@/lib/site-config";

type PtnItem = (typeof ptnDeadlines)[number];
type StatusFilter = "semua" | "buka" | "bertahap" | "cek";
type PriorityFilter = "semua" | "tinggi" | "menengah";
type ChecklistState = Record<string, Record<string, boolean>>;

const statusFilters: { id: StatusFilter; label: string }[] = [
  { id: "semua", label: "Semua" },
  { id: "buka", label: "Buka" },
  { id: "bertahap", label: "Bertahap" },
  { id: "cek", label: "Perlu cek" },
];

const priorityFilters: { id: PriorityFilter; label: string }[] = [
  { id: "semua", label: "Semua" },
  { id: "tinggi", label: "Prioritas tinggi" },
  { id: "menengah", label: "Menengah" },
];

const preparationChecklist = [
  { key: "account", label: "Akun pendaftaran kampus sudah dibuat" },
  { key: "documents", label: "Dokumen utama sudah siap dan rapi" },
  { key: "fee", label: "Biaya dan metode pembayaran sudah dicek" },
  { key: "practice", label: "Minimal 1 simulasi CBT penuh sudah dikerjakan" },
  { key: "source", label: "Jadwal sudah diverifikasi dari portal resmi" },
];

// UIN data loaded from uin-data.ts (real PDDikti 2025/2 data)

// ── main ──────────────────────────────────────────────────────────────────────

export function PtnInfoExplorer() {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("semua");
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>("semua");
  const [selectedId, setSelectedId] = useState(ptnDeadlines[0]?.id ?? "");
  const [targetIds, setTargetIds] = useState<string[]>(() => readStorage(storageKeys.ptnTargets, []));
  const [checklist, setChecklist] = useState<ChecklistState>(() => readStorage(storageKeys.ptnChecklist, {}));
  const [selectedUin, setSelectedUin] = useState(uinData[0]?.singkat ?? "");
  const [activeTab, setActiveTab] = useState<"um" | "umptkin">("um");

  useEffect(() => {
    window.localStorage.setItem(storageKeys.ptnTargets, JSON.stringify(targetIds));
  }, [targetIds]);

  useEffect(() => {
    window.localStorage.setItem(storageKeys.ptnChecklist, JSON.stringify(checklist));
  }, [checklist]);

  const filteredPtn = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return ptnDeadlines.filter((ptn) => {
      const searchable = [ptn.name, ptn.shortName, ptn.selectionName, ptn.city, ptn.status].join(" ").toLowerCase();
      const matchesQuery = keyword.length === 0 || searchable.includes(keyword);
      const matchesStatus =
        statusFilter === "semua" ||
        (statusFilter === "buka" && ptn.status.toLowerCase().includes("buka")) ||
        (statusFilter === "bertahap" && ptn.status.toLowerCase().includes("bertahap")) ||
        (statusFilter === "cek" && ptn.status.toLowerCase().includes("cek"));
      const matchesPriority =
        priorityFilter === "semua" ||
        (priorityFilter === "tinggi" && ptn.priority.toLowerCase().includes("tinggi")) ||
        (priorityFilter === "menengah" && ptn.priority.toLowerCase().includes("menengah"));
      return matchesQuery && matchesStatus && matchesPriority;
    });
  }, [priorityFilter, query, statusFilter]);

  const selectedPtn = ptnDeadlines.find((p) => p.id === selectedId) ?? filteredPtn[0] ?? ptnDeadlines[0];
  const openCount = ptnDeadlines.filter((p) => p.status.toLowerCase().includes("buka")).length;
  const urgentCount = ptnDeadlines.filter((p) => p.priority.toLowerCase().includes("tinggi")).length;
  const cbtCount = ptnDeadlines.filter((p) => p.examAt.toLowerCase().includes("cbt")).length;
  const targetPtn = ptnDeadlines.filter((p) => targetIds.includes(p.id));

  const resetFilters = () => { setQuery(""); setStatusFilter("semua"); setPriorityFilter("semua"); };
  const toggleTarget = (id: string) =>
    setTargetIds((cur) => cur.includes(id) ? cur.filter((t) => t !== id) : [...cur, id].slice(0, 5));
  const toggleChecklist = (ptnId: string, key: string) =>
    setChecklist((cur) => ({ ...cur, [ptnId]: { ...cur[ptnId], [key]: !cur[ptnId]?.[key] } }));

  const uinIdx = uinData.findIndex((u) => u.singkat === selectedUin);
  const activeUin = uinData[uinIdx];

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 md:px-8">

      {/* ══ HERO ══ */}
      <div className="relative mb-6 overflow-hidden rounded-[28px] bg-slate-950">
        {/* accent bar */}
        <div className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,#0A66FF,#10B981,#F59E0B,#0A66FF)]" />
        {/* grid bg */}
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(180deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#0A66FF]/10 blur-3xl" />

        <div className="relative grid gap-0 lg:grid-cols-[1fr_auto]">
          <div className="px-7 py-8 sm:px-10">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-black uppercase tracking-widest text-blue-300">
              <GraduationCap size={13} /> Info PTN 2026
            </span>
            <h1 className="mt-4 max-w-lg text-3xl font-black leading-tight text-white sm:text-4xl">
              Pilih kampus, pantau deadline, susun strategi.
            </h1>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-400">
              Semua jalur mandiri PTN & PTKIN dalam satu panel — jadwal, skema, skor, dokumen, dan langkah belajar siap pakai.
            </p>
          </div>
          <div className="flex items-center gap-px border-t border-white/10 bg-white/5 px-2 lg:border-l lg:border-t-0">
            {[
              { label: "PTN", value: ptnDeadlines.length, icon: GraduationCap, color: "text-blue-400" },
              { label: "Buka", value: openCount, icon: CalendarDays, color: "text-emerald-400" },
              { label: "Prioritas", value: urgentCount, icon: Target, color: "text-amber-400" },
              { label: "CBT", value: cbtCount, icon: Clock3, color: "text-violet-400" },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="flex flex-col items-center gap-1 px-5 py-6 text-center">
                <Icon size={18} className={color} />
                <p className="text-2xl font-black text-white">{value}</p>
                <p className={`text-xs font-bold ${color}`}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══ TAB SWITCHER ══ */}
      <div className="mb-5 flex gap-1 rounded-2xl border border-slate-200 bg-slate-100 p-1">
        <button
          type="button"
          onClick={() => setActiveTab("um")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-black transition ${
            activeTab === "um" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <GraduationCap size={16} /> Ujian Mandiri PTN
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("umptkin")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-black transition ${
            activeTab === "umptkin" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <Target size={16} /> UM PTKIN — Info UIN
        </button>
      </div>

      {/* ══════════════════════════════════════════════════
          TAB: UJIAN MANDIRI PTN
      ══════════════════════════════════════════════════ */}
      {activeTab === "um" && (
        <>
          {/* target strip */}
          {targetPtn.length > 0 && (
            <div className="mb-4 flex flex-wrap items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-3.5">
              <Star size={15} className="shrink-0 fill-amber-500 text-amber-500" />
              <span className="text-xs font-black text-amber-900">Target saya:</span>
              {targetPtn.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => { setSelectedId(p.id); }}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3 py-1.5 text-xs font-black text-slate-800 shadow-sm hover:bg-slate-50"
                >
                  {p.shortName}
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => { e.stopPropagation(); toggleTarget(p.id); }}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.stopPropagation(); toggleTarget(p.id); } }}
                    className="text-slate-400 hover:text-red-500"
                  >
                    <X size={12} />
                  </span>
                </button>
              ))}
              <span className="ml-auto text-xs font-bold text-amber-700">{targetPtn.length}/5</span>
            </div>
          )}
          {targetPtn.length === 0 && (
            <div className="mb-4 flex items-center gap-3 rounded-2xl border border-dashed border-amber-200 bg-amber-50/60 px-5 py-3.5">
              <Star size={15} className="shrink-0 text-amber-400" />
              <p className="text-xs font-semibold text-amber-800">
                Belum ada kampus target. Klik ☆ pada kartu kampus untuk mempin maksimal 5 kampus.
              </p>
            </div>
          )}

          {/* filter bar */}
          <div className="sticky top-0 z-20 mb-4 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-sm backdrop-blur">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Cari kampus, kota, jalur..."
                  className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm font-semibold text-slate-900 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
                />
              </div>
              <div className="flex flex-wrap gap-1.5">
                {statusFilters.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setStatusFilter(f.id)}
                    className={`rounded-xl px-3 py-1.5 text-xs font-black transition ${
                      statusFilter === f.id ? "bg-[#0A66FF] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2">
              <div className="flex gap-1.5">
                {priorityFilters.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setPriorityFilter(f.id)}
                    className={`rounded-xl px-3 py-1.5 text-xs font-black transition ${
                      priorityFilter === f.id ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
              {(query || statusFilter !== "semua" || priorityFilter !== "semua") && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-black text-slate-500 hover:bg-slate-100"
                >
                  <X size={13} /> Reset
                </button>
              )}
            </div>
          </div>

          {/* main panel */}
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_380px]">
            {/* list */}
            <div className="space-y-2">
              <div className="mb-3 flex items-center justify-between px-1">
                <p className="text-sm font-black text-slate-700">
                  {filteredPtn.length} kampus
                </p>
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                  <SlidersHorizontal size={13} /> Filter aktif
                </div>
              </div>

              {filteredPtn.length > 0 ? filteredPtn.map((ptn) => (
                <PtnCard
                  key={ptn.id}
                  ptn={ptn}
                  selected={selectedPtn?.id === ptn.id}
                  pinned={targetIds.includes(ptn.id)}
                  onSelect={() => setSelectedId(ptn.id)}
                  onPin={() => toggleTarget(ptn.id)}
                />
              )) : (
                <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-16 text-center">
                  <Search size={32} className="text-slate-300" />
                  <p className="font-black text-slate-700">Tidak ada kampus yang cocok</p>
                  <p className="text-sm text-slate-500">Coba kurangi filter atau ubah kata pencarian</p>
                  <button onClick={resetFilters} className="mt-1 rounded-xl bg-[#0A66FF] px-4 py-2 text-xs font-black text-white">
                    Reset filter
                  </button>
                </div>
              )}
            </div>

            {/* detail panel */}
            {selectedPtn && (
              <aside className="h-fit rounded-2xl border border-slate-200 bg-white shadow-sm lg:sticky lg:top-40">
                {/* header */}
                <div className="relative overflow-hidden rounded-t-2xl bg-slate-950 px-5 py-5">
                  <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[#0A66FF]/20 blur-2xl" />
                  <div className="relative flex items-start justify-between gap-3">
                    <div>
                      <p className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-blue-300">
                        <GraduationCap size={13} /> {selectedPtn.shortName}
                      </p>
                      <h2 className="mt-1.5 text-xl font-black leading-tight text-white">{selectedPtn.name}</h2>
                      <p className="mt-1 text-xs font-semibold text-slate-400">{selectedPtn.selectionName}</p>
                    </div>
                    <span className={`shrink-0 rounded-xl px-3 py-1.5 text-xs font-black ${selectedPtn.color}`}>
                      {selectedPtn.status}
                    </span>
                  </div>
                  <div className="relative mt-4 flex gap-2">
                    <button
                      type="button"
                      onClick={() => toggleTarget(selectedPtn.id)}
                      className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-black transition ${
                        targetIds.includes(selectedPtn.id)
                          ? "bg-amber-400 text-slate-900"
                          : "bg-white/10 text-white hover:bg-white/20"
                      }`}
                    >
                      <Star size={13} className={targetIds.includes(selectedPtn.id) ? "fill-current" : ""} />
                      {targetIds.includes(selectedPtn.id) ? "Target saya" : "Jadikan target"}
                    </button>
                    <span className={`inline-flex items-center rounded-xl px-3 py-2 text-xs font-black ${getDeadlineBadge(selectedPtn.closeAt).className}`}>
                      {getDeadlineBadge(selectedPtn.closeAt).label}
                    </span>
                  </div>
                </div>

                <div className="p-5 space-y-4">
                  {/* info rows */}
                  <div className="grid grid-cols-2 gap-2">
                    <InfoTile icon={CalendarDays} label="Pendaftaran" value={`${selectedPtn.openAt} – ${selectedPtn.closeAt}`} />
                    <InfoTile icon={Clock3} label="Ujian" value={selectedPtn.examAt} />
                    <InfoTile icon={MapPin} label="Lokasi" value={selectedPtn.city} />
                    <InfoTile icon={Target} label="Prioritas" value={selectedPtn.priority} accent={selectedPtn.priority.toLowerCase().includes("tinggi")} />
                  </div>

                  {/* strategy */}
                  <div className="rounded-xl bg-blue-50 p-4">
                    <p className="flex items-center gap-2 text-xs font-black text-blue-900">
                      <ShieldCheck size={15} className="text-[#0A66FF]" /> Langkah terbaik
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-blue-900">{selectedPtn.strategy}</p>
                  </div>

                  {/* detail blocks */}
                  <div className="space-y-3">
                    <DetailBlock title="Skema seleksi" body={selectedPtn.scheme} />
                    <DetailBlock title="Fokus latihan" body={selectedPtn.materials} />
                    <DetailBlock title="Biaya" body={selectedPtn.fee} />
                  </div>

                  {/* dokumen */}
                  <div>
                    <p className="mb-2 flex items-center gap-2 text-xs font-black text-slate-700">
                      <FileText size={14} className="text-[#0A66FF]" /> Dokumen siap daftar
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedPtn.documents.map((doc) => (
                        <span key={doc} className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600">
                          {doc}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* checklist */}
                  <div className="rounded-xl border border-slate-200 p-4">
                    <p className="mb-3 flex items-center gap-2 text-xs font-black text-slate-700">
                      <ClipboardCheck size={14} className="text-[#0A66FF]" /> Checklist persiapan
                    </p>
                    <div className="space-y-2">
                      {preparationChecklist.map((item) => (
                        <label key={item.key} className="flex cursor-pointer items-start gap-2.5 rounded-lg p-2 hover:bg-slate-50">
                          <input
                            type="checkbox"
                            checked={Boolean(checklist[selectedPtn.id]?.[item.key])}
                            onChange={() => toggleChecklist(selectedPtn.id, item.key)}
                            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#0A66FF] focus:ring-[#0A66FF]"
                          />
                          <span className={`text-xs font-semibold leading-relaxed ${
                            checklist[selectedPtn.id]?.[item.key] ? "text-slate-400 line-through" : "text-slate-700"
                          }`}>{item.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* actions */}
                  <div className="grid grid-cols-2 gap-2">
                    <button className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#0A66FF] py-3 text-sm font-black text-[#0A66FF] hover:bg-blue-50">
                      <Bell size={15} /> Reminder
                    </button>
                    <a
                      href={selectedPtn.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 py-3 text-sm font-black text-white hover:bg-slate-800"
                    >
                      Sumber <ExternalLink size={15} />
                    </a>
                  </div>
                </div>
              </aside>
            )}
          </div>

          {/* tips row */}
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {[
              { icon: CheckCircle2, title: "Mulai minggu ini", body: "Pilih 3 kampus utama, cek deadline, amankan dokumen yang sering diminta.", color: "bg-blue-50 text-[#0A66FF]" },
              { icon: Clock3, title: "Latihan CBT", body: `${cbtCount} jalur punya elemen CBT. Jadwalkan simulasi penuh minimal 2× seminggu.`, color: "bg-violet-50 text-violet-600" },
              { icon: ShieldCheck, title: "Cek sumber resmi", body: "Jadwal kampus bisa berubah. Klik sumber resmi sebelum membayar pendaftaran.", color: "bg-emerald-50 text-emerald-600" },
            ].map(({ icon: Icon, title, body, color }) => (
              <div key={title} className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${color}`}>
                  <Icon size={18} />
                </div>
                <div>
                  <p className="text-sm font-black text-slate-900">{title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ══════════════════════════════════════════════════
          TAB: UM PTKIN
      ══════════════════════════════════════════════════ */}
      {activeTab === "umptkin" && (
        <>
          {/* header panel */}
          <div className="relative mb-5 overflow-hidden rounded-[24px] bg-emerald-950">
            <div className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,#10B981,#0A66FF,#10B981)]" />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(180deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
            <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-emerald-500/10 blur-3xl" />
            <div className="relative grid gap-0 lg:grid-cols-[1fr_auto]">
              <div className="px-7 py-8 sm:px-10">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-black uppercase tracking-widest text-emerald-300">
                  <Target size={13} /> UM PTKIN 2026
                </span>
                <h2 className="mt-4 max-w-lg text-2xl font-black leading-tight text-white sm:text-3xl">
                  Program Studi S1 Aktif di 39 UIN Indonesia
                </h2>
                <p className="mt-3 max-w-md text-sm leading-relaxed text-emerald-200">
                  Pilih UIN tujuanmu, lihat seluruh prodi S1 aktif beserta status akreditasi.
                  Data resmi PDDikti 2025/2 — 39 UIN, 1.272 prodi.
                </p>
              </div>
              <div className="flex items-center border-t border-white/10 bg-white/5 px-2 lg:border-l lg:border-t-0">
                {[
                  { label: "UIN", value: uinData.length },
                  { label: "Prodi S1", value: uinData.reduce((s, u) => s + u.prodi.length, 0) },
                ].map(({ label, value }) => (
                  <div key={label} className="flex flex-col items-center gap-1 px-6 py-6 text-center">
                    <p className="text-3xl font-black text-white">{value}</p>
                    <p className="text-xs font-bold text-emerald-300">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* UIN pills */}
          <div className="mb-4 flex gap-2 overflow-x-auto pb-2">
            {uinData.map((uin) => (
              <button
                key={uin.singkat}
                type="button"
                onClick={() => setSelectedUin(uin.singkat)}
                className={`shrink-0 rounded-2xl px-4 py-2.5 text-xs font-black transition ${
                  selectedUin === uin.singkat
                    ? "bg-emerald-700 text-white shadow-sm"
                    : "border border-slate-200 bg-white text-slate-600 hover:border-emerald-300 hover:text-emerald-700"
                }`}
              >
                {uin.singkat}
              </button>
            ))}
          </div>

          {/* UIN detail */}
          {activeUin && (
            <div className="rounded-[24px] border border-slate-200 bg-white shadow-sm">
              {/* UIN header */}
              <div className="flex flex-col gap-4 border-b border-slate-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-black uppercase tracking-wide text-emerald-700">PTKIN</span>
                    <span className="flex items-center gap-1 text-xs font-bold text-slate-400">
                      <MapPin size={12} /> {activeUin.kota}
                    </span>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-black text-slate-600">
                      {activeUin.totalProdi} prodi S1
                    </span>
                  </div>
                  <h3 className="mt-1.5 text-xl font-black text-slate-900">{activeUin.nama}</h3>
                </div>
                {/* legend */}
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: "Unggul", dot: "bg-emerald-500", bg: "bg-emerald-50 text-emerald-700" },
                    { label: "Baik Sekali", dot: "bg-amber-400", bg: "bg-amber-50 text-amber-700" },
                    { label: "Baik / Lainnya", dot: "bg-slate-400", bg: "bg-slate-100 text-slate-600" },
                  ].map((l) => (
                    <span key={l.label} className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[11px] font-black ${l.bg}`}>
                      <span className={`h-2 w-2 rounded-full ${l.dot}`} /> {l.label}
                    </span>
                  ))}
                </div>
              </div>

              {/* prodi grid */}
              <div className="grid gap-3 p-6 sm:grid-cols-2 lg:grid-cols-3">
                {activeUin.prodi.slice(0, 15).map((p) => {
                  const akr = p.akreditasi;
                  const t = akr === "Unggul"
                    ? { bg: "bg-emerald-50", border: "border-emerald-200", badge: "bg-emerald-100 text-emerald-800", bar: "bg-emerald-500", barPct: 100 }
                    : akr === "Baik Sekali"
                    ? { bg: "bg-amber-50", border: "border-amber-200", badge: "bg-amber-100 text-amber-800", bar: "bg-amber-400", barPct: 70 }
                    : akr === "Baik"
                    ? { bg: "bg-slate-50", border: "border-slate-200", badge: "bg-slate-100 text-slate-700", bar: "bg-slate-400", barPct: 45 }
                    : { bg: "bg-slate-50", border: "border-slate-200", badge: "bg-slate-100 text-slate-500", bar: "bg-slate-300", barPct: 25 };
                  return (
                    <div key={p.nama} className={`flex flex-col gap-3 rounded-2xl border p-4 ${t.bg} ${t.border}`}>
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-black leading-snug text-slate-900">{p.nama}</p>
                        {akr ? (
                          <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-black ${t.badge}`}>{akr}</span>
                        ) : (
                          <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-black text-slate-400">—</span>
                        )}
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/10">
                        <div className={`h-full rounded-full transition-all duration-500 ${t.bar}`} style={{ width: `${t.barPct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
              {activeUin.prodi.length > 15 && (
                <p className="px-6 pb-4 text-center text-xs font-semibold text-slate-400">
                  Menampilkan 15 dari {activeUin.prodi.length} program studi S1 aktif
                </p>
              )}

              {/* navigation */}
              <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4">
                <button
                  type="button"
                  onClick={() => { if (uinIdx > 0) setSelectedUin(uinData[uinIdx - 1].singkat); }}
                  disabled={uinIdx === 0}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2 text-xs font-black text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft size={14} /> Sebelumnya
                </button>
                <span className="text-xs font-bold text-slate-400">{uinIdx + 1} / {uinData.length}</span>
                <button
                  type="button"
                  onClick={() => { if (uinIdx < uinData.length - 1) setSelectedUin(uinData[uinIdx + 1].singkat); }}
                  disabled={uinIdx === uinData.length - 1}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2 text-xs font-black text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Berikutnya <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}

          <p className="mt-4 text-center text-xs text-slate-400">
            * Data resmi PDDikti 2025/2. Akreditasi dari BAN-PT. Verifikasi ke portal resmi UIN tujuan sebelum mendaftar.
          </p>
        </>
      )}
    </div>
  );
}

// ── sub-components ────────────────────────────────────────────────────────────

function PtnCard({ ptn, selected, pinned, onSelect, onPin }: {
  ptn: PtnItem; selected: boolean; pinned: boolean; onSelect: () => void; onPin: () => void;
}) {
  const deadline = getDeadlineBadge(ptn.closeAt);
  const isOpen = ptn.status.toLowerCase().includes("buka");
  const isHigh = ptn.priority.toLowerCase().includes("tinggi");

  return (
    <div
      className={`relative flex cursor-pointer flex-col gap-3 rounded-2xl border p-4 transition hover:shadow-md sm:flex-row sm:items-center sm:justify-between ${
        selected
          ? "border-[#0A66FF] bg-blue-50/60 ring-2 ring-blue-200"
          : "border-slate-200 bg-white hover:border-slate-300"
      }`}
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onSelect()}
    >
      {/* priority left bar */}
      <div className={`absolute left-0 top-4 bottom-4 w-1 rounded-full ${
        isHigh ? "bg-rose-500" : isOpen ? "bg-emerald-500" : "bg-slate-300"
      }`} />

      <div className="min-w-0 pl-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-black text-slate-900">{ptn.shortName}</span>
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-black ${ptn.color}`}>{ptn.status}</span>
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-black ${deadline.className}`}>{deadline.label}</span>
        </div>
        <p className="mt-0.5 text-sm font-semibold text-slate-600">{ptn.name}</p>
        <p className="mt-0.5 truncate text-xs text-slate-400">{ptn.selectionName}</p>
      </div>

      <div className="flex shrink-0 items-center gap-2 pl-3 sm:pl-0">
        <div className="grid grid-cols-2 gap-1.5 text-xs">
          <MiniStat label="Tutup" value={ptn.closeAt} />
          <MiniStat label="Prioritas" value={ptn.priority} highlight={isHigh} />
        </div>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onPin(); }}
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition ${
            pinned ? "bg-amber-100 text-amber-600" : "bg-slate-100 text-slate-400 hover:bg-amber-50 hover:text-amber-500"
          }`}
          aria-label={pinned ? "Hapus target" : "Jadikan target"}
        >
          <Star size={16} className={pinned ? "fill-current" : ""} />
        </button>
      </div>
    </div>
  );
}

function InfoTile({ icon: Icon, label, value, accent }: { icon: LucideIcon; label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wide text-slate-400">
        <Icon size={11} /> {label}
      </div>
      <p className={`mt-1 text-xs font-black leading-snug ${accent ? "text-rose-600" : "text-slate-800"}`}>{value}</p>
    </div>
  );
}

function MiniStat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="rounded-lg bg-slate-100 px-2.5 py-1.5">
      <p className="text-[9px] font-black uppercase tracking-wide text-slate-400">{label}</p>
      <p className={`mt-0.5 truncate text-[11px] font-black ${highlight ? "text-rose-600" : "text-slate-800"}`}>{value}</p>
    </div>
  );
}

function DetailBlock({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">{title}</p>
      <p className="mt-1.5 text-xs leading-relaxed text-slate-700">{body}</p>
    </div>
  );
}

function getDeadlineBadge(closeAt: string) {
  const parsed = parseIndonesianDate(closeAt);
  if (!parsed) return { label: "Cek berkala", className: "bg-slate-100 text-slate-600" };
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const diff = Math.ceil((parsed.getTime() - today.getTime()) / 86400000);
  if (diff < 0) return { label: "Lewat", className: "bg-slate-100 text-slate-500" };
  if (diff === 0) return { label: "Hari ini!", className: "bg-rose-100 text-rose-700" };
  if (diff <= 7) return { label: `H-${diff}`, className: "bg-rose-100 text-rose-700" };
  if (diff <= 30) return { label: `H-${diff}`, className: "bg-amber-100 text-amber-700" };
  return { label: `H-${diff}`, className: "bg-blue-100 text-blue-700" };
}

function parseIndonesianDate(value: string) {
  const months: Record<string, number> = {
    jan:0,januari:0,feb:1,februari:1,mar:2,maret:2,apr:3,april:3,
    mei:4,jun:5,juni:5,jul:6,juli:6,agu:7,agustus:7,sep:8,september:8,
    okt:9,oktober:9,nov:10,november:10,des:11,desember:11,
  };
  const m = value.match(/(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/);
  if (!m) return null;
  const month = months[m[2].toLowerCase()];
  if (month === undefined) return null;
  return new Date(Number(m[3]), month, Number(m[1]));
}

function readStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try { const v = window.localStorage.getItem(key); return v ? (JSON.parse(v) as T) : fallback; }
  catch { return fallback; }
}
