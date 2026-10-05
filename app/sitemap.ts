import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/config";
import { getBlogPosts } from "@/lib/wordpress/client";

export const revalidate = 60;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/about`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/blog`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/f1`, changeFrequency: "daily", priority: 0.8 },
  ];

  const seen = new Set<number>();
  let page = 1;
  let totalPages = 1;
  do {
    // Let failures propagate so an outage cannot publish a truncated sitemap.
    const result = await getBlogPosts({ perPage: 100, page });
    if (result.page !== page) {
      throw new Error("WordPress pagination changed while generating sitemap");
    }
    totalPages = result.totalPages;
    for (const post of result.posts) {
      if (seen.has(post.id)) continue;
      seen.add(post.id);
      routes.push({
        url: `${SITE_URL}/blog/${post.slug}`,
        lastModified: new Date(post.modified),
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }
    page += 1;
  } while (page <= totalPages);

  return routes;
}
