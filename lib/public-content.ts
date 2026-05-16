import { createAdminClient } from "@/lib/supabase/admin";

type SiteContentRow = {
  section_key: string;
  content: Record<string, unknown>;
};

type BlogPostRow = {
  id: string;
  slug: string;
  title: string;
  category: string | null;
  excerpt: string | null;
  body?: string | null;
  published_at: string | null;
  updated_at: string;
};

export type HomeContent = {
  badge: string;
  headline: string;
  subheadline: string;
  cta: string;
};

export type PublicBlogPost = {
  id: string;
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  body?: string;
  date: string;
};

function asString(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function formatPostDate(value: string | null) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export async function getHomeContent(fallback: HomeContent) {
  const supabase = createAdminClient();
  if (!supabase) return fallback;

  const { data } = await supabase
    .from("site_content")
    .select("section_key,content")
    .eq("section_key", "hero")
    .eq("status", "published")
    .maybeSingle<SiteContentRow>();

  if (!data?.content) return fallback;

  return {
    badge: asString(data.content.badge, fallback.badge),
    headline: asString(data.content.headline, fallback.headline),
    subheadline: asString(data.content.subheadline, fallback.subheadline),
    cta: asString(data.content.cta, fallback.cta),
  };
}

export async function getPublicBlogPosts(fallback: PublicBlogPost[]) {
  const supabase = createAdminClient();
  if (!supabase) return fallback;

  const { data } = await supabase
    .from("blog_posts")
    .select("id,slug,title,category,excerpt,published_at,updated_at")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(60);

  if (!data?.length) return fallback;

  return (data as BlogPostRow[]).map((post) => ({
    id: post.id,
    slug: post.slug,
    title: post.title,
    category: post.category ?? "Tips belajar",
    excerpt: post.excerpt ?? "Artikel Pastilulus.",
    date: formatPostDate(post.published_at ?? post.updated_at),
  }));
}

export async function getPublicBlogPost(slug: string) {
  const supabase = createAdminClient();
  if (!supabase) return null;

  const { data } = await supabase
    .from("blog_posts")
    .select("id,slug,title,category,excerpt,body,published_at,updated_at")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle<BlogPostRow>();

  if (!data) return null;

  return {
    id: data.id,
    slug: data.slug,
    title: data.title,
    category: data.category ?? "Tips belajar",
    excerpt: data.excerpt ?? "",
    body: data.body ?? "",
    date: formatPostDate(data.published_at ?? data.updated_at),
  };
}
