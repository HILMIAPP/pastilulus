import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, CalendarDays, MessageCircle, ShoppingBag } from "lucide-react";
import { BlogVisual } from "@/components/blog-visual";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getPublicBlogPost, getPublicBlogPosts } from "@/lib/public-content";
import { seoBlogSeedPosts } from "@/lib/seo-blog-seed";
import { site } from "@/lib/site-config";

function seedFallback(slug: string) {
  const found = seoBlogSeedPosts.find((p) => p.slug === slug);
  if (!found) return null;
  return { id: slug, slug: found.slug, title: found.title, category: found.category, excerpt: found.excerpt, body: found.body, date: "Mei 2026" };
}

function seedRelated(slug: string) {
  return seoBlogSeedPosts
    .filter((p) => p.slug !== slug)
    .slice(0, 4)
    .map((p, i) => ({ id: `seed-${i}`, slug: p.slug, title: p.title, category: p.category, excerpt: p.excerpt, date: "Mei 2026" }));
}

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const post = await getPublicBlogPost(slug);
  const title = post?.title ?? "Artikel Blog";
  const description = post?.excerpt ?? `Artikel ${site.name} tentang Ujian Mandiri PTN.`;
  const url = `${site.url}/blog/${slug}`;
  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      type: "article",
      siteName: site.fullName,
    },
  };
}

export default async function BlogDetailPage({ params }: Props) {
  const { slug } = await params;
  const post = (await getPublicBlogPost(slug)) ?? seedFallback(slug);

  if (!post) notFound();

  const dbRelated = (await getPublicBlogPosts([])).filter((item) => item.slug !== slug).slice(0, 4);
  const relatedPosts = dbRelated.length ? dbRelated : seedRelated(slug);
  const articleUrl = `${site.url}/blog/${post.slug}`;
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    dateModified: post.date,
    mainEntityOfPage: articleUrl,
    author: {
      "@type": "Organization",
      name: site.fullName,
      url: site.url,
    },
    publisher: {
      "@type": "Organization",
      name: site.fullName,
      logo: {
        "@type": "ImageObject",
        url: `${site.url}${site.logoWide}`,
      },
    },
  };

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <SiteHeader />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-14 sm:px-6">
        <Link href="/blog" className="inline-flex items-center gap-2 text-sm font-black text-[#0A66FF]">
          <ArrowLeft size={16} />
          Kembali ke blog
        </Link>
        <article className="mt-8">
          <span className="rounded-full bg-[#E6F0FF] px-3 py-1 text-xs font-black text-[#0A66FF]">
            {post.category}
          </span>
          <h1 className="mt-5 text-4xl font-black leading-tight text-slate-950">{post.title}</h1>
          <p className="mt-4 flex items-center gap-2 text-sm font-bold text-slate-500">
            <CalendarDays size={16} /> {post.date}
          </p>
          {post.excerpt && <p className="mt-6 text-lg leading-relaxed text-slate-600">{post.excerpt}</p>}
          <div className="mt-8">
            <BlogVisual title={post.title} category={post.category} />
          </div>
          <div className="mt-8 space-y-4 leading-relaxed text-slate-700">
            {(post.body || "Artikel sedang disiapkan oleh tim Pastilulus.")
              .split(/\n{2,}/)
              .filter(Boolean)
              .map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
          </div>
          <section className="mt-12 overflow-hidden rounded-3xl border border-slate-200 bg-slate-950 text-white shadow-xl shadow-slate-200">
            <div className="grid gap-0 md:grid-cols-[1fr_0.72fr]">
              <div className="p-7 sm:p-8">
                <p className="text-sm font-black uppercase tracking-wider text-blue-200">Langkah berikutnya</p>
                <h2 className="mt-3 text-3xl font-black leading-tight">
                  Jangan belajar sendirian. Masuk grup dan mulai latihan terarah.
                </h2>
                <p className="mt-4 leading-8 text-slate-300">
                  Gabung komunitas untuk info jadwal dan diskusi, atau langsung aktifkan paket belajar untuk tryout,
                  pembahasan, dan target PTN.
                </p>
              </div>
              <div className="flex flex-col justify-center gap-3 border-t border-white/10 bg-white/5 p-7 sm:p-8 md:border-l md:border-t-0">
                <Link
                  href={site.whatsappGroupUrl}
                  target={site.whatsappGroupUrl.startsWith("http") ? "_blank" : undefined}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-4 text-sm font-black text-white transition hover:bg-emerald-600"
                >
                  <MessageCircle size={18} /> Gabung grup WA
                </Link>
                <Link
                  href="/harga"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0A66FF] px-5 py-4 text-sm font-black text-white transition hover:bg-[#0052D6]"
                >
                  <ShoppingBag size={18} /> Beli paket belajar
                </Link>
                <Link href="/siswa/tryout" className="inline-flex items-center justify-center gap-2 px-5 py-2 text-sm font-black text-blue-100 hover:text-white">
                  Coba tryout gratis <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </section>
          {relatedPosts.length > 0 && (
            <section className="mt-12">
              <h2 className="text-2xl font-black text-slate-950">Lanjut baca artikel terkait</h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {relatedPosts.map((related) => (
                  <Link
                    key={related.id}
                    href={`/blog/${related.slug}`}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <span className="rounded-full bg-[#E6F0FF] px-3 py-1 text-xs font-black text-[#0A66FF]">
                      {related.category}
                    </span>
                    <p className="mt-4 font-black leading-snug text-slate-950">{related.title}</p>
                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-600">{related.excerpt}</p>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}
