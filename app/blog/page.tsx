import Link from "next/link";
import { ArrowRight, CalendarDays } from "lucide-react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { site } from "@/lib/site-config";

const posts = [
  {
    title: "Strategi 14 hari mengejar Ujian Mandiri",
    category: "Strategi belajar",
    date: "13 Mei 2026",
    excerpt: "Cara menyusun prioritas latihan saat waktu sudah mepet, tanpa belajar acak setiap hari.",
  },
  {
    title: "Kenapa soal mandiri terasa beda dari SNBT?",
    category: "Analisis soal",
    date: "12 Mei 2026",
    excerpt: "Beberapa kampus punya gaya soal dan tekanan waktu yang berbeda. Ini cara membacanya.",
  },
  {
    title: "Checklist sebelum daftar jalur mandiri PTN",
    category: "Info PTN",
    date: "10 Mei 2026",
    excerpt: "Dokumen, jadwal, biaya, dan link resmi yang perlu dicek sebelum klik submit.",
  },
];

export const metadata = {
  title: "Blog & Tips Ujian Mandiri",
};

export default function BlogPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-14 sm:px-6">
        <div className="max-w-2xl">
          <p className="text-sm font-black uppercase tracking-wide text-[#0A66FF]">Blog {site.name}</p>
          <h1 className="mt-3 text-3xl font-black text-slate-950 sm:text-4xl">
            Tips belajar yang langsung bisa dipakai.
          </h1>
          <p className="mt-4 leading-relaxed text-slate-600">
            Artikel singkat untuk bantu kamu memahami pola soal, menyusun strategi, dan tidak ketinggalan info PTN.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {posts.map((post) => (
            <article key={post.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <span className="rounded-full bg-[#E6F0FF] px-3 py-1 text-xs font-black text-[#0A66FF]">
                {post.category}
              </span>
              <h2 className="mt-5 text-lg font-black leading-tight text-slate-950">{post.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">{post.excerpt}</p>
              <p className="mt-5 flex items-center gap-2 text-xs font-bold text-slate-500">
                <CalendarDays size={14} /> {post.date}
              </p>
              <Link href="/daftar" className="mt-5 inline-flex items-center gap-2 text-sm font-black text-[#0A66FF]">
                Mulai latihan <ArrowRight size={15} />
              </Link>
            </article>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
