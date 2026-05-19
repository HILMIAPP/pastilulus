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
  Lock,
  Sparkles,
  Target,
} from "lucide-react";
import { learningModules, umptkinModules, learningResources } from "@/lib/learning-materials";
import type { LearningModule } from "@/lib/learning-materials";
import { getCurrentSession, canAccessTier } from "@/lib/session";

export const metadata = {
  title: "Belajar",
};

const categories = [
  { label: "Masterbook", count: learningModules.filter((m) => m.type === "masterbook").length },
  { label: "Rangkuman", count: learningModules.filter((m) => m.type === "rangkuman").length },
  { label: "Latihan", count: learningModules.filter((m) => m.type === "latihan").length },
  { label: "Tracker", count: learningModules.filter((m) => m.type === "tracker").length },
];

function ModuleCard({ module, locked }: { module: LearningModule; locked: boolean }) {
  const isUmptkin = module.jalur === "umptkin";
  return (
    <article className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      {locked && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-3xl bg-white/90 backdrop-blur-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
            <Lock size={22} />
          </div>
          <div className="text-center px-6">
            <p className="text-sm font-black text-slate-800">Materi terkunci</p>
            <p className="mt-1 text-xs text-slate-500">Upgrade untuk akses semua modul</p>
          </div>
          <Link
            href="/siswa/langganan"
            className="mt-1 inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-black text-white hover:bg-blue-700"
          >
            Upgrade ke Belajar
          </Link>
        </div>
      )}
      <div className="relative h-36 overflow-hidden bg-slate-100">
        <Image
          src={module.image}
          alt={module.title}
          fill
          className="object-cover"
          sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
        />
        <div className={`absolute inset-0 ${module.color} opacity-75`} />
        <div className="absolute inset-0 flex items-center justify-center text-white">
          <LibraryBig size={42} />
        </div>
      </div>
      <div className="p-5">
        <div className="flex items-center justify-between gap-3">
          <p className={`text-xs font-black uppercase tracking-wide ${isUmptkin ? "text-emerald-600" : "text-[#0A66FF]"}`}>
            {module.subject}
          </p>
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
          className={`mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-black text-white hover:opacity-90 ${
            isUmptkin ? "bg-emerald-700 hover:bg-emerald-800" : "bg-[#0A66FF] hover:bg-[#0052D6]"
          }`}
        >
          <BookOpenText size={16} /> Buka materi
        </Link>
      </div>
    </article>
  );
}

export default async function SiswaBelajarPage() {
  const session = await getCurrentSession();
  const userTier = session?.tier ?? "free";

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 md:px-8">

      {/* ── SECTION 1: Ujian Mandiri PTN ── */}
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="grid gap-0 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="p-6 sm:p-8">
            <div className="flex items-center gap-2 mb-1">
              <GraduationCap size={16} className="text-[#0A66FF]" />
              <p className="text-xs font-black uppercase tracking-widest text-[#0A66FF]">Jalur 1 — Ujian Mandiri PTN</p>
            </div>
            <h1 className="mt-2 text-3xl font-black leading-tight text-slate-950 sm:text-4xl">
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
        <PathCard icon={GraduationCap} title="1. Mulai dari roadmap" body="Pakai modul 30 hari untuk menentukan urutan belajar." accent="blue" />
        <PathCard icon={Target} title="2. Pilih mapel prioritas" body="Fokus ke TPS, literasi, matematika, atau TKA sesuai target." accent="blue" />
        <PathCard icon={Sparkles} title="3. Catat error log" body="Gunakan logbook agar setiap kesalahan berubah jadi remedial." accent="blue" />
      </section>

      <section className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {learningModules.map((module) => {
          const required = module.akses ?? "belajar_pro";
          const locked = !canAccessTier(userTier, required);
          return <ModuleCard key={module.id} module={module} locked={locked} />;
        })}
      </section>

      {/* ── DIVIDER ── */}
      <div className="relative my-12">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-slate-50 px-4 text-xs font-black uppercase tracking-widest text-slate-400">atau</span>
        </div>
      </div>

      {/* ── SECTION 2: UM PTKIN ── */}
      <section className="overflow-hidden rounded-3xl border border-emerald-200 bg-white shadow-sm">
        <div className="grid gap-0 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="p-6 sm:p-8">
            <div className="flex items-center gap-2 mb-1">
              <Target size={16} className="text-emerald-600" />
              <p className="text-xs font-black uppercase tracking-widest text-emerald-600">Jalur 2 — UM PTKIN</p>
            </div>
            <h2 className="mt-2 text-3xl font-black leading-tight text-slate-950 sm:text-4xl">
              Materi bimbel UM-PTKIN A-Z sudah tersedia.
            </h2>
            <p className="mt-4 max-w-2xl leading-relaxed text-slate-600">
              5 modul lengkap khusus UM-PTKIN: roadmap bimbel, penalaran akademik, matematika, literasi membaca, dan
              literasi ajaran Islam. Setiap modul siap diunduh dalam format DOCX.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href="/materi/umptkin/00_Roadmap_Bimbel_UM_PTKIN_A_Z.docx"
                download
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-800 hover:bg-slate-50"
              >
                <Download size={16} /> Unduh Roadmap
              </a>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-0 border-t border-emerald-100 bg-emerald-50 lg:border-l lg:border-t-0">
            {[
              { label: "Modul", count: umptkinModules.length },
              { label: "Total Bab", count: umptkinModules.reduce((s, m) => s + (m.seksi?.length ?? 0), 0) },
              { label: "Menit", count: umptkinModules.reduce((s, m) => s + m.duration, 0) },
              { label: "XP Reward", count: umptkinModules.reduce((s, m) => s + m.xpReward, 0) },
            ].map((stat) => (
              <div key={stat.label} className="border-b border-r border-emerald-100 p-5 last:border-r-0">
                <p className="text-3xl font-black text-slate-950">{stat.count}</p>
                <p className="mt-1 text-sm font-bold text-emerald-700">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-3">
        <PathCard icon={Target} title="1. Mulai dari Roadmap" body="Kenali karakter UM-PTKIN dan susun jadwal belajar dari modul 00." accent="emerald" />
        <PathCard icon={BookOpenText} title="2. Kuasai 4 Sub Tes" body="Penalaran Akademik, Matematika, Literasi, dan Agama Islam." accent="emerald" />
        <PathCard icon={Sparkles} title="3. Latihan dengan HOTS" body="Kerjakan 5 paket soal HOTS dari menu Simulasi Ujian." accent="emerald" />
      </section>

      <section className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {umptkinModules.map((module) => {
          const required = module.akses ?? "belajar_pro";
          const locked = !canAccessTier(userTier, required);
          return <ModuleCard key={module.id} module={module} locked={locked} />;
        })}
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

function PathCard({ icon: Icon, title, body, accent }: { icon: LucideIcon; title: string; body: string; accent: "blue" | "emerald" }) {
  const colors = accent === "emerald"
    ? { bg: "bg-emerald-50", text: "text-emerald-700" }
    : { bg: "bg-blue-50", text: "text-blue-700" };
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${colors.bg} ${colors.text}`}>
        <Icon size={20} />
      </div>
      <p className="mt-4 font-black text-slate-950">{title}</p>
      <p className="mt-2 text-sm font-semibold leading-relaxed text-slate-600">{body}</p>
    </div>
  );
}
