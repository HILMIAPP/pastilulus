import Image from "next/image";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  BookOpenText,
  Clock,
  Download,
  FileText,
  GraduationCap,
  LibraryBig,
  Sparkles,
  Target,
} from "lucide-react";
import { learningModules, learningResources } from "@/lib/learning-materials";

export const metadata = {
  title: "Belajar",
};

const categories = [
  { label: "Masterbook", count: learningModules.filter((m) => m.type === "masterbook").length },
  { label: "Rangkuman", count: learningModules.filter((m) => m.type === "rangkuman").length },
  { label: "Latihan", count: learningModules.filter((m) => m.type === "latihan").length },
  { label: "Tracker", count: learningModules.filter((m) => m.type === "tracker").length },
];

export default function SiswaBelajarPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 md:px-8">
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="grid gap-0 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="p-6 sm:p-8">
            <p className="text-sm font-black uppercase tracking-wide text-[#0A66FF]">Materi Belajar</p>
            <h1 className="mt-3 text-3xl font-black leading-tight text-slate-950 sm:text-4xl">
              Master materi Ujian Mandiri PTN 2026 sudah masuk.
            </h1>
            <p className="mt-4 max-w-2xl leading-relaxed text-slate-600">
              Belajar dari masterbook, rangkuman, diagram, latihan soal, dan logbook progres. Mulai dari roadmap,
              lanjutkan ke mapel prioritas, lalu ukur dengan tryout CBT.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <ResourceLink href={learningResources.masterPdf} label="Buka Master PDF" />
              <ResourceLink href={learningResources.logbookPdf} label="Buka Logbook PDF" />
              <ResourceLink href={learningResources.masterDocx} label="Unduh DOCX" download />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-0 border-t border-slate-200 bg-slate-50 lg:border-l lg:border-t-0">
            {categories.map((category) => (
              <div key={category.label} className="border-b border-r border-slate-200 p-5 last:border-r-0">
                <p className="text-3xl font-black text-slate-950">{category.count}</p>
                <p className="mt-1 text-sm font-bold text-slate-500">{category.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-3">
        <PathCard icon={GraduationCap} title="1. Mulai dari roadmap" body="Pakai modul 30 hari untuk menentukan urutan belajar." />
        <PathCard icon={Target} title="2. Pilih mapel prioritas" body="Fokus ke TPS, literasi, matematika, atau TKA sesuai target." />
        <PathCard icon={Sparkles} title="3. Catat error log" body="Gunakan logbook agar setiap kesalahan berubah jadi remedial." />
      </section>

      <section className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {learningModules.map((module) => (
          <article
            key={module.id}
            className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <div className="relative h-36 overflow-hidden bg-slate-100">
              <Image src={module.image} alt={module.title} fill className="object-cover" sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw" />
              <div className={`absolute inset-0 ${module.color} opacity-75`} />
              <div className="absolute inset-0 flex items-center justify-center text-white">
                <LibraryBig size={42} />
              </div>
            </div>
            <div className="p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-black uppercase tracking-wide text-[#0A66FF]">{module.subject}</p>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-black uppercase text-slate-600">
                  {module.type}
                </span>
              </div>
              <h2 className="mt-2 text-lg font-black leading-tight text-slate-950">{module.title}</h2>
              <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-600">{module.description}</p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold text-slate-600">
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1">
                  <Clock size={13} /> {module.duration} menit
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-amber-700">
                  <Sparkles size={13} /> +{module.xpReward} XP
                </span>
              </div>
              <Link
                href={`/siswa/belajar/${module.slug}`}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#0A66FF] px-4 py-3 text-sm font-black text-white hover:bg-[#0052D6]"
              >
                <BookOpenText size={16} /> Buka materi
              </Link>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}

function ResourceLink({ href, label, download }: { href: string; label: string; download?: boolean }) {
  return (
    <a
      href={href}
      download={download}
      target={download ? undefined : "_blank"}
      rel={download ? undefined : "noreferrer"}
      className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-800 hover:bg-slate-50"
    >
      {download ? <Download size={16} /> : <FileText size={16} />}
      {label}
    </a>
  );
}

function PathCard({
  icon: Icon,
  title,
  body,
}: {
  icon: LucideIcon;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
        <Icon size={20} />
      </div>
      <p className="mt-4 font-black text-slate-950">{title}</p>
      <p className="mt-2 text-sm font-semibold leading-relaxed text-slate-600">{body}</p>
    </div>
  );
}
