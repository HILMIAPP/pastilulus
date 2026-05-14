"use client";

import { useEffect, useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Bell,
  CalendarDays,
  CheckCircle2,
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
  { id: "semua", label: "Semua prioritas" },
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

export function PtnInfoExplorer() {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("semua");
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>("semua");
  const [selectedId, setSelectedId] = useState(ptnDeadlines[0]?.id ?? "");
  const [targetIds, setTargetIds] = useState<string[]>(() => readStorage(storageKeys.ptnTargets, []));
  const [checklist, setChecklist] = useState<ChecklistState>(() => readStorage(storageKeys.ptnChecklist, {}));

  useEffect(() => {
    window.localStorage.setItem(storageKeys.ptnTargets, JSON.stringify(targetIds));
  }, [targetIds]);

  useEffect(() => {
    window.localStorage.setItem(storageKeys.ptnChecklist, JSON.stringify(checklist));
  }, [checklist]);

  const filteredPtn = useMemo(() => {
    const keyword = query.trim().toLowerCase();

    return ptnDeadlines.filter((ptn) => {
      const searchable = [ptn.name, ptn.shortName, ptn.selectionName, ptn.city, ptn.status]
        .join(" ")
        .toLowerCase();
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

  const selectedPtn = ptnDeadlines.find((ptn) => ptn.id === selectedId) ?? filteredPtn[0] ?? ptnDeadlines[0];
  const openCount = ptnDeadlines.filter((ptn) => ptn.status.toLowerCase().includes("buka")).length;
  const urgentCount = ptnDeadlines.filter((ptn) => ptn.priority.toLowerCase().includes("tinggi")).length;
  const cbtCount = ptnDeadlines.filter((ptn) => ptn.examAt.toLowerCase().includes("cbt")).length;
  const targetPtn = ptnDeadlines.filter((ptn) => targetIds.includes(ptn.id));

  const resetFilters = () => {
    setQuery("");
    setStatusFilter("semua");
    setPriorityFilter("semua");
  };

  const toggleTarget = (id: string) => {
    setTargetIds((current) => {
      if (current.includes(id)) return current.filter((targetId) => targetId !== id);
      return [...current, id].slice(0, 5);
    });
  };

  const toggleChecklist = (ptnId: string, key: string) => {
    setChecklist((current) => ({
      ...current,
      [ptnId]: {
        ...current[ptnId],
        [key]: !current[ptnId]?.[key],
      },
    }));
  };

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 md:px-8">
      <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
        <div className="grid gap-0 lg:grid-cols-[1.35fr_0.65fr]">
          <div className="bg-slate-950 px-6 py-8 text-white sm:px-8">
            <p className="text-sm font-black uppercase tracking-[0.2em] text-blue-300">Info PTN 2026</p>
            <h1 className="mt-3 max-w-3xl text-3xl font-black leading-tight sm:text-4xl">
              Pilih kampus, cek deadline, langsung tahu langkah berikutnya.
            </h1>
            <p className="mt-4 max-w-3xl leading-relaxed text-slate-300">
              Semua jalur mandiri penting diringkas dalam satu panel: jadwal, skema, biaya, dokumen, dan strategi
              belajar yang bisa langsung kamu pakai.
            </p>
          </div>

          <div className="grid grid-cols-3 border-t border-slate-200 bg-white lg:border-l lg:border-t-0">
            <HeroMetric label="PTN" value={ptnDeadlines.length} icon={GraduationCap} />
            <HeroMetric label="Buka" value={openCount} icon={CalendarDays} />
            <HeroMetric label="Prioritas" value={urgentCount} icon={Target} />
          </div>
        </div>
      </section>

      <section className="sticky top-0 z-20 mt-5 rounded-3xl border border-slate-200 bg-white/95 p-4 shadow-sm backdrop-blur">
        <div className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Cari kampus, jalur, kota, atau status..."
              className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm font-semibold text-slate-900 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {statusFilters.map((filter) => (
              <FilterButton
                key={filter.id}
                active={statusFilter === filter.id}
                label={filter.label}
                onClick={() => setStatusFilter(filter.id)}
              />
            ))}
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {priorityFilters.map((filter) => (
              <FilterButton
                key={filter.id}
                active={priorityFilter === filter.id}
                label={filter.label}
                onClick={() => setPriorityFilter(filter.id)}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={resetFilters}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-2 text-xs font-black text-slate-600 hover:bg-slate-50"
          >
            <X size={14} />
            Reset filter
          </button>
        </div>
      </section>

      <section className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_390px]">
        <div className="space-y-5">
          <TargetStrip targets={targetPtn} onSelect={setSelectedId} onRemove={toggleTarget} />

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-black uppercase tracking-wide text-[#0A66FF]">Timeline cepat</p>
                <h2 className="mt-1 text-xl font-black text-slate-950">Daftar kampus yang cocok dengan filter</h2>
              </div>
              <div className="inline-flex w-fit items-center gap-2 rounded-2xl bg-blue-50 px-4 py-2 text-sm font-black text-blue-700">
                <SlidersHorizontal size={16} />
                {filteredPtn.length} kampus
              </div>
            </div>

            <div className="mt-4 grid gap-3">
              {filteredPtn.length > 0 ? (
                filteredPtn.map((ptn) => (
                  <PtnCompactCard
                    key={ptn.id}
                    ptn={ptn}
                    selected={selectedPtn?.id === ptn.id}
                    pinned={targetIds.includes(ptn.id)}
                    onSelect={() => setSelectedId(ptn.id)}
                    onPin={() => toggleTarget(ptn.id)}
                  />
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                  <p className="font-black text-slate-950">Belum ada kampus yang cocok.</p>
                  <p className="mt-1 text-sm text-slate-600">Coba kurangi filter atau cari dengan kata yang lebih umum.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {selectedPtn && (
          <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-36">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="inline-flex items-center gap-2 text-sm font-black text-[#0A66FF]">
                  <GraduationCap size={18} /> {selectedPtn.shortName}
                </p>
                <h2 className="mt-2 text-2xl font-black leading-tight text-slate-950">{selectedPtn.name}</h2>
                <p className="mt-2 text-sm font-semibold leading-relaxed text-slate-500">{selectedPtn.selectionName}</p>
              </div>
              <span className={`shrink-0 rounded-xl px-3 py-1 text-xs font-black ${selectedPtn.color}`}>
                {selectedPtn.status}
              </span>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => toggleTarget(selectedPtn.id)}
                className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-xs font-black ${
                  targetIds.includes(selectedPtn.id)
                    ? "bg-amber-100 text-amber-800"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                <Star size={15} className={targetIds.includes(selectedPtn.id) ? "fill-current" : ""} />
                {targetIds.includes(selectedPtn.id) ? "Target saya" : "Jadikan target"}
              </button>
              <span className={`inline-flex items-center rounded-2xl px-4 py-2 text-xs font-black ${getDeadlineBadge(selectedPtn.closeAt).className}`}>
                {getDeadlineBadge(selectedPtn.closeAt).label}
              </span>
            </div>

            <div className="mt-5 grid gap-3">
              <InfoRow icon={CalendarDays} label="Pendaftaran" value={`${selectedPtn.openAt} - ${selectedPtn.closeAt}`} />
              <InfoRow icon={Clock3} label="Ujian/seleksi" value={selectedPtn.examAt} />
              <InfoRow icon={MapPin} label="Lokasi" value={selectedPtn.city} />
              <InfoRow icon={Target} label="Prioritas" value={selectedPtn.priority} />
            </div>

            <div className="mt-5 rounded-2xl bg-blue-50 p-4">
              <p className="flex items-center gap-2 text-sm font-black text-blue-950">
                <ShieldCheck size={17} />
                Langkah terbaik
              </p>
              <p className="mt-2 text-sm font-semibold leading-relaxed text-blue-950">{selectedPtn.strategy}</p>
            </div>

            <div className="mt-5 space-y-4">
              <DetailBlock title="Skema seleksi" body={selectedPtn.scheme} />
              <DetailBlock title="Fokus latihan" body={selectedPtn.materials} />
              <DetailBlock title="Biaya" body={selectedPtn.fee} />
            </div>

            <div className="mt-5 rounded-2xl bg-slate-50 p-4">
              <p className="flex items-center gap-2 text-sm font-black text-slate-950">
                <FileText size={17} className="text-[#0A66FF]" />
                Dokumen siap daftar
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {selectedPtn.documents.map((doc) => (
                  <span key={doc} className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-600 shadow-sm">
                    {doc}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4">
              <p className="flex items-center gap-2 text-sm font-black text-slate-950">
                <ClipboardCheck size={17} className="text-[#0A66FF]" />
                Checklist persiapan
              </p>
              <div className="mt-3 grid gap-2">
                {preparationChecklist.map((item) => (
                  <label
                    key={item.key}
                    className="flex cursor-pointer items-start gap-3 rounded-xl bg-slate-50 p-3 text-sm font-semibold text-slate-700"
                  >
                    <input
                      type="checkbox"
                      checked={Boolean(checklist[selectedPtn.id]?.[item.key])}
                      onChange={() => toggleChecklist(selectedPtn.id, item.key)}
                      className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
                    />
                    <span>{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              <button className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#0A66FF] px-4 py-3 text-sm font-black text-[#0A66FF] hover:bg-[#E6F0FF]">
                <Bell size={16} /> Reminder
              </button>
              <a
                href={selectedPtn.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-black text-white hover:bg-slate-800"
              >
                Sumber <ExternalLink size={16} />
              </a>
            </div>
          </aside>
        )}
      </section>

      <section className="mt-5 grid gap-4 md:grid-cols-3">
        <ActionCard
          title="Minggu ini"
          body="Pilih 3 kampus utama, cek deadline, lalu amankan dokumen yang sering diminta."
          icon={CheckCircle2}
        />
        <ActionCard
          title="Latihan CBT"
          body={`${cbtCount} jalur punya elemen CBT. Jadwalkan simulasi penuh minimal dua kali seminggu.`}
          icon={Clock3}
        />
        <ActionCard
          title="Cek resmi"
          body="Jadwal kampus bisa berubah. Gunakan tombol sumber resmi sebelum membayar pendaftaran."
          icon={ShieldCheck}
        />
      </section>
    </main>
  );
}

function TargetStrip({
  targets,
  onSelect,
  onRemove,
}: {
  targets: PtnItem[];
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="rounded-3xl border border-amber-100 bg-amber-50 p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="flex items-center gap-2 text-sm font-black text-amber-900">
            <Star size={17} className="fill-current" />
            Kampus target saya
          </p>
          <p className="mt-1 text-sm font-semibold text-amber-900/80">
            Pin maksimal 5 kampus supaya fokus persiapan tidak melebar.
          </p>
        </div>
        <span className="rounded-2xl bg-white px-4 py-2 text-xs font-black text-amber-800">
          {targets.length}/5 target
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {targets.length > 0 ? (
          targets.map((ptn) => (
            <button
              key={ptn.id}
              type="button"
              onClick={() => onSelect(ptn.id)}
              className="group inline-flex items-center gap-2 rounded-2xl bg-white px-3 py-2 text-xs font-black text-slate-800 shadow-sm"
            >
              {ptn.shortName}
              <span
                role="button"
                tabIndex={0}
                onClick={(event) => {
                  event.stopPropagation();
                  onRemove(ptn.id);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    event.stopPropagation();
                    onRemove(ptn.id);
                  }
                }}
                className="rounded-full p-0.5 text-slate-400 group-hover:bg-slate-100 group-hover:text-slate-700"
              >
                <X size={13} />
              </span>
            </button>
          ))
        ) : (
          <p className="text-sm font-semibold text-amber-900/80">
            Belum ada target. Klik tombol bintang pada kampus yang ingin kamu prioritaskan.
          </p>
        )}
      </div>
    </div>
  );
}

function PtnCompactCard({
  ptn,
  selected,
  pinned,
  onSelect,
  onPin,
}: {
  ptn: PtnItem;
  selected: boolean;
  pinned: boolean;
  onSelect: () => void;
  onPin: () => void;
}) {
  const deadline = getDeadlineBadge(ptn.closeAt);

  return (
    <div
      className={`w-full rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-sm ${
        selected ? "border-blue-400 bg-blue-50/70 ring-4 ring-blue-100" : "border-slate-200 bg-white hover:bg-slate-50"
      }`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={onSelect} className="font-black text-slate-950 hover:text-blue-700">
              {ptn.shortName}
            </button>
            <span className={`rounded-full px-2.5 py-1 text-[11px] font-black ${ptn.color}`}>{ptn.status}</span>
            <span className={`rounded-full px-2.5 py-1 text-[11px] font-black ${deadline.className}`}>
              {deadline.label}
            </span>
          </div>
          <p className="mt-1 text-sm font-semibold text-slate-700">{ptn.name}</p>
          <p className="mt-1 line-clamp-1 text-xs font-medium text-slate-500">{ptn.selectionName}</p>
        </div>
        <div className="grid shrink-0 grid-cols-[1fr_auto] gap-2 text-xs sm:w-72">
          <div className="grid grid-cols-2 gap-2">
            <SmallFact label="Tutup" value={ptn.closeAt} />
            <SmallFact label="Prioritas" value={ptn.priority} />
          </div>
          <button
            type="button"
            onClick={onPin}
            className={`flex h-full min-h-12 w-12 items-center justify-center rounded-xl ${
              pinned ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
            }`}
            aria-label={pinned ? "Hapus dari target" : "Jadikan target"}
          >
            <Star size={17} className={pinned ? "fill-current" : ""} />
          </button>
        </div>
      </div>
    </div>
  );
}

function HeroMetric({ label, value, icon: Icon }: { label: string; value: number; icon: LucideIcon }) {
  return (
    <div className="flex flex-col justify-center border-l border-slate-200 p-5 first:border-l-0">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
        <Icon size={20} />
      </div>
      <p className="text-3xl font-black text-slate-950">{value}</p>
      <p className="text-sm font-bold text-slate-500">{label}</p>
    </div>
  );
}

function FilterButton({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl px-4 py-2 text-xs font-black transition ${
        active ? "bg-blue-600 text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
      }`}
    >
      {label}
    </button>
  );
}

function SmallFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-100 px-3 py-2">
      <p className="text-[10px] font-black uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-0.5 truncate font-black text-slate-800">{value}</p>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="flex gap-3 rounded-2xl bg-slate-50 p-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-[#0A66FF] shadow-sm">
        <Icon size={17} />
      </div>
      <div>
        <p className="text-xs font-black uppercase tracking-wide text-slate-500">{label}</p>
        <p className="mt-1 text-sm font-bold leading-relaxed text-slate-800">{value}</p>
      </div>
    </div>
  );
}

function DetailBlock({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <p className="text-sm font-black text-slate-950">{title}</p>
      <p className="mt-1 text-sm leading-relaxed text-slate-600">{body}</p>
    </div>
  );
}

function ActionCard({ title, body, icon: Icon }: { title: string; body: string; icon: LucideIcon }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
        <Icon size={20} />
      </div>
      <p className="mt-4 text-lg font-black text-slate-950">{title}</p>
      <p className="mt-2 text-sm font-semibold leading-relaxed text-slate-600">{body}</p>
    </div>
  );
}

function getDeadlineBadge(closeAt: string) {
  const parsed = parseIndonesianDate(closeAt);

  if (!parsed) {
    return { label: "Cek berkala", className: "bg-slate-100 text-slate-700" };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.ceil((parsed.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return { label: "Lewat", className: "bg-slate-100 text-slate-700" };
  if (diffDays === 0) return { label: "Hari ini", className: "bg-rose-100 text-rose-800" };
  if (diffDays <= 7) return { label: `H-${diffDays}`, className: "bg-rose-100 text-rose-800" };
  if (diffDays <= 30) return { label: `H-${diffDays}`, className: "bg-amber-100 text-amber-800" };
  return { label: `H-${diffDays}`, className: "bg-blue-100 text-blue-800" };
}

function parseIndonesianDate(value: string) {
  const monthMap: Record<string, number> = {
    jan: 0,
    januari: 0,
    feb: 1,
    februari: 1,
    mar: 2,
    maret: 2,
    apr: 3,
    april: 3,
    mei: 4,
    jun: 5,
    juni: 5,
    jul: 6,
    juli: 6,
    agu: 7,
    agustus: 7,
    sep: 8,
    september: 8,
    okt: 9,
    oktober: 9,
    nov: 10,
    november: 10,
    des: 11,
    desember: 11,
  };

  const match = value.match(/(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/);
  if (!match) return null;

  const day = Number(match[1]);
  const month = monthMap[match[2].toLowerCase()];
  const year = Number(match[3]);

  if (month === undefined || Number.isNaN(day) || Number.isNaN(year)) return null;
  return new Date(year, month, day);
}

function readStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;

  try {
    const value = window.localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}
