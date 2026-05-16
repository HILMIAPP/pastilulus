import type { MetadataRoute } from "next";
import { getPublicBlogPosts } from "@/lib/public-content";
import { site } from "@/lib/site-config";

const staticRoutes = [
  { path: "", priority: 1 },
  { path: "/harga", priority: 0.85 },
  { path: "/info-ptn", priority: 0.8 },
  { path: "/blog", priority: 0.9 },
  { path: "/katalog", priority: 0.7 },
  { path: "/kontak", priority: 0.5 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const posts = await getPublicBlogPosts([]);

  return [
    ...staticRoutes.map((route) => ({
      url: `${site.url}${route.path}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: route.priority,
    })),
    ...posts.map((post) => ({
      url: `${site.url}/blog/${post.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.65,
    })),
  ];
}
