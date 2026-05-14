import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import {
  ArrowLeft,
  BookOpenText,
  CheckCircle,
  Clock,
  Download,
  FileText,
  Sparkles,
  Target,
} from "lucide-react";
import { getLearningModule, learningModules, learningResources } from "@/lib/learning-materials";
import { site } from "@/lib/site-config";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return learningModules.map((module) => ({ slug: module.slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const learningModule = getLearningModule(slug);

  return {
    title: learningModule ? learningModule.title : "Materi Belajar",
  };
}

export default async function LearningModulePage({ params }: PageProps) {
  const { slug } = await params;
  const learningModule = getLearningModule(slug);

  if (!learningModule) {
    notFound();
  }

  const isTracker = learningModule.type === "tracker";
  const primaryPdf = isTracker ? learningResources.logbookPdf : learningResources.masterPdf;
  const primaryDocx = isTracker ? learningResources.logbookDocx : learningResources.masterDocx;
  const relatedModules = learningModules.filter((item) => item.id !== learningModule.id).slice(0, 3);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 md:px-8">
      <Link
        href="/siswa/belajar"
        className="mb-5 inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-700 shadow-sm hover:bg-slate-50"
      >
        <ArrowLeft size={16} /> Kembali ke Belajar
      </Link>

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
          <div className="relative min-h-72 bg-slate-100">
            <Image src={learningModule.image} alt={learningModule.title} fill priority className="object-cover" sizes="(min-width: 1024px) 45vw, 100vw" />
            <div className={`absolute inset-0 ${learningModule.color} opacity-80`} />
            <div className="absolute inset-0 flex flex-col justify-between p-6 text-white sm:p-8">
              <div className="inline-flex w-fit items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs font-black uppercase backdrop-blur">
                <BookOpenText size={14} /> {learningModule.type}
              </div>
              <div>
                <p className="text-sm font-black uppercase tracking-wide text-white/80">{learningModule.subject}</p>
                <h1 className="mt-2 text-3xl font-black leading-tight sm:text-4xl">{learningModule.title}</h1>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <p className="text-base leading-relaxed text-slate-600">{learningModule.description}</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <Metric icon={Clock} label="Durasi" value={`${learningModule.duration} menit`} />
              <Metric icon={Sparkles} label="Reward" value={`+${learningModule.xpReward} XP`} />
              <Metric icon={FileText} label="Sumber" value={learningModule.pages} />
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <ResourceButton href={primaryPdf} label="Buka PDF" />
              <ResourceButton href={primaryDocx} label="Unduh DOCX" download />
              {!isTracker && <ResourceButton href={learningResources.logbookPdf} label="Buka Logbook" />}
            </div>
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="space-y-5">
          <InfoPanel title="Yang Kamu Kuasai Setelah Ini" icon={CheckCircle}>
            <ul className="space-y-3">
              {learningModule.outcomes.map((outcome) => (
                <li key={outcome} className="flex gap-3 text-sm font-semibold leading-relaxed text-slate-700">
                  <CheckCircle className="mt-0.5 shrink-0 text-emerald-600" size={17} />
                  {outcome}
                </li>
              ))}
            </ul>
          </InfoPanel>

          <InfoPanel title="Paling Cocok Untuk" icon={Target}>
            <div className="flex flex-wrap gap-2">
              {learningModule.recommendedFor.map((item) => (
                <span key={item} className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-black text-blue-700">
                  {item}
                </span>
              ))}
            </div>
          </InfoPanel>

          <InfoPanel title="Lanjutkan Setelah Ini" icon={BookOpenText}>
            <div className="space-y-3">
              {relatedModules.map((item) => (
                <Link
                  key={item.id}
                  href={`/siswa/belajar/${item.slug}`}
                  className="block rounded-2xl border border-slate-200 p-4 transition hover:-translate-y-0.5 hover:bg-slate-50"
                >
                  <p className="text-xs font-black uppercase text-[#0A66FF]">{item.subject}</p>
                  <p className="mt-1 font-black leading-tight text-slate-950">{item.title}</p>
                </Link>
              ))}
            </div>
          </InfoPanel>
        </div>

        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-5">
            <p className="text-sm font-black uppercase tracking-wide text-[#0A66FF]">Preview Materi</p>
            <h2 className="mt-1 text-xl font-black text-slate-950">Buka langsung dari library {site.name}.</h2>
          </div>
          <iframe
            src={`${primaryPdf}#view=FitH`}
            title={`Preview ${learningModule.title}`}
            className="h-[680px] w-full bg-slate-100"
          />
        </section>
      </section>
    </main>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <Icon className="text-[#0A66FF]" size={18} />
      <p className="mt-3 text-xs font-black uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-black leading-tight text-slate-950">{value}</p>
    </div>
  );
}

function ResourceButton({ href, label, download }: { href: string; label: string; download?: boolean }) {
  return (
    <a
      href={href}
      download={download}
      target={download ? undefined : "_blank"}
      rel={download ? undefined : "noreferrer"}
      className="inline-flex items-center gap-2 rounded-2xl bg-[#0A66FF] px-4 py-3 text-sm font-black text-white shadow-sm hover:bg-[#0052D6]"
    >
      {download ? <Download size={16} /> : <FileText size={16} />}
      {label}
    </a>
  );
}

function InfoPanel({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: LucideIcon;
  children: ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="mb-4 flex items-center gap-2 font-black text-slate-950">
        <Icon className="text-[#0A66FF]" size={19} />
        {title}
      </h2>
      {children}
    </section>
  );
}
