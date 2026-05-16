import Link from "next/link";
import { ArrowRight, CalendarDays } from "lucide-react";
import { BlogVisual } from "@/components/blog-visual";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getPublicBlogPosts } from "@/lib/public-content";
import { site } from "@/lib/site-config";

const fallbackPosts = [
  {
    id: "fallback-1",
    slug: "strategi-14-hari-ujian-mandiri",
    title: "Strategi 14 hari mengejar Ujian Mandiri",
    category: "Strategi belajar",
    date: "13 Mei 2026",
    excerpt: "Cara menyusun prioritas latihan saat waktu sudah mepet, tanpa belajar acak setiap hari.",
  },
  {
    id: "fallback-2",
    slug: "kenapa-soal-mandiri-beda-snbt",
    title: "Kenapa soal mandiri terasa beda dari SNBT?",
    category: "Analisis soal",
    date: "12 Mei 2026",
    excerpt: "Beberapa kampus punya gaya soal dan tekanan waktu yang berbeda. Ini cara membacanya.",
  },
  {
    id: "fallback-3",
    slug: "checklist-sebelum-daftar-jalur-mandiri-ptn",
    title: "Checklist sebelum daftar jalur mandiri PTN",
    category: "Info PTN",
    date: "10 Mei 2026",
    excerpt: "Dokumen, jadwal, biaya, dan link resmi yang perlu dicek sebelum klik submit.",
  },
];

export const metadata = {
  title: "Blog & Tips Ujian Mandiri",
  description: `Artikel ${site.name} tentang strategi belajar, tryout, info PTN, dan persiapan Ujian Mandiri.`,
  alternates: {
    canonical: `${site.url}/blog`,
  },
  openGraph: {
    title: `Blog & Tips Ujian Mandiri - ${site.name}`,
    description: `Panduan belajar dan info Ujian Mandiri dari ${site.name}.`,
    url: `${site.url}/blog`,
    type: "website",
  },
};

export default async function BlogPage() {
  const posts = await getPublicBlogPosts(fallbackPosts);

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
          {posts.length ? posts.map((post) => (
            <article key={post.id} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <BlogVisual title={post.title} category={post.category} size="card" />
              <div className="p-6">
                <h2 className="text-lg font-black leading-tight text-slate-950">{post.title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">{post.excerpt}</p>
                <p className="mt-5 flex items-center gap-2 text-xs font-bold text-slate-500">
                  <CalendarDays size={14} /> {post.date}
                </p>
                <Link href={`/blog/${post.slug}`} className="mt-5 inline-flex items-center gap-2 text-sm font-black text-[#0A66FF]">
                  Baca artikel <ArrowRight size={15} />
                </Link>
              </div>
            </article>
          )) : (
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 md:col-span-3">
              <h2 className="text-xl font-black text-slate-950">Artikel sedang disiapkan.</h2>
              <p className="mt-2 max-w-xl leading-relaxed text-slate-600">
                Tim {site.name} sedang menyiapkan artikel baru. Sambil menunggu, kamu bisa mulai dari tryout gratis.
              </p>
              <Link href="/siswa/tryout" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#0A66FF] px-5 py-3 text-sm font-black text-white">
                Coba tryout gratis <ArrowRight size={16} />
              </Link>
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
