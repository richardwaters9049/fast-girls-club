import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/config";
import { getBlogPosts } from "@/lib/wordpress/client";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/blog`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/f1`, changeFrequency: "daily", priority: 0.8 },
  ];

  try {
    const result = await getBlogPosts({ perPage: 100 });
    return [
      ...staticRoutes,
      ...result.posts.map((post) => ({
        url: `${SITE_URL}/blog/${post.slug}`,
        lastModified: new Date(post.modified),
        changeFrequency: "weekly" as const,
        priority: 0.7,
      })),
    ];
  } catch {
    return staticRoutes;
  }
}
