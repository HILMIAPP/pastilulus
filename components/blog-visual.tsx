import { BookOpen, CalendarDays, GraduationCap, LineChart, Target } from "lucide-react";
import { site } from "@/lib/site-config";

const categoryStyles = [
  {
    match: ["simak", "ui"],
    bg: "from-blue-700 via-blue-500 to-sky-300",
    accent: "bg-blue-100 text-blue-700",
    icon: GraduationCap,
  },
  {
    match: ["try", "out", "skor"],
    bg: "from-emerald-700 via-teal-500 to-cyan-300",
    accent: "bg-emerald-100 text-emerald-700",
    icon: LineChart,
  },
  {
    match: ["info", "ptn", "deadline"],
    bg: "from-slate-900 via-slate-700 to-blue-300",
    accent: "bg-slate-100 text-slate-700",
    icon: CalendarDays,
  },
  {
    match: ["strategi", "belajar"],
    bg: "from-[#0A66FF] via-indigo-500 to-amber-300",
    accent: "bg-blue-100 text-[#0A66FF]",
    icon: Target,
  },
];

function getStyle(category: string) {
  const normalized = category.toLowerCase();
  return categoryStyles.find((style) => style.match.some((word) => normalized.includes(word))) ?? {
    bg: "from-[#0D1B2A] via-[#0A66FF] to-emerald-300",
    accent: "bg-blue-100 text-[#0A66FF]",
    icon: BookOpen,
  };
}

export function BlogVisual({
  title,
  category,
  size = "detail",
}: {
  title: string;
  category: string;
  size?: "card" | "detail";
}) {
  const style = getStyle(category);
  const Icon = style.icon;

  return (
    <div
      className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${style.bg} ${
        size === "card" ? "aspect-[16/10]" : "aspect-[16/8] min-h-72"
      }`}
    >
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.16)_1px,transparent_1px),linear-gradient(180deg,rgba(255,255,255,0.16)_1px,transparent_1px)] bg-[size:36px_36px]" />
      <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/20 blur-2xl" />
      <div className="absolute -bottom-24 left-10 h-64 w-64 rounded-full bg-slate-950/20 blur-3xl" />
      <div className="relative flex h-full flex-col justify-between p-6 text-white sm:p-8">
        <div className="flex items-center justify-between gap-4">
          <span className={`rounded-full px-3 py-1 text-xs font-black ${style.accent}`}>{category}</span>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
            <Icon size={24} />
          </div>
        </div>
        <div>
          <p className="text-sm font-black uppercase tracking-wider text-white/70">{site.name} Journal</p>
          <p className={`${size === "card" ? "mt-2 text-xl" : "mt-3 max-w-3xl text-4xl"} font-black leading-tight`}>
            {title}
          </p>
        </div>
      </div>
    </div>
  );
}
