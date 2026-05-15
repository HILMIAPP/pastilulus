import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays } from "lucide-react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getPublicBlogPost } from "@/lib/public-content";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const post = await getPublicBlogPost(slug);
  return {
    title: post?.title ?? "Artikel Blog",
    description: post?.excerpt,
  };
}

export default async function BlogDetailPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPublicBlogPost(slug);

  if (!post) notFound();

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <SiteHeader />
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
          <div className="mt-8 space-y-4 leading-relaxed text-slate-700">
            {(post.body || "Artikel sedang disiapkan oleh tim Pastilulus.")
              .split(/\n{2,}/)
              .filter(Boolean)
              .map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
          </div>
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}
