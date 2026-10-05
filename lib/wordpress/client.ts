import { unstable_cache } from "next/cache";
import { cache } from "react";
import type {
  BlogDateRange,
  BlogPost,
  BlogPostSummary,
  BlogPostsQuery,
  BlogPostsResult,
  BlogSort,
  WordPressCategory,
  WordPressPost,
  WordPressTerm,
} from "@/lib/wordpress/types";
import { WORDPRESS_API_URL } from "@/lib/config";
import { cleanSeoTitle, decodeHtmlText } from "@/lib/wordpress/utils";

// Pressable caches anonymous REST responses independently of Next.js. A shared
// 15-second key bounds that cache's age without creating a new URL per visitor.
const WORDPRESS_REFRESH_INTERVAL_MS = 15_000;

class WordPressRequestError extends Error {
  constructor(public readonly status: number) {
    super(`WordPress request failed: ${status}`);
  }
}

// Cache against the stable endpoint, not the rotating Pressable bypass URL.
// Expired entries serve immediately while Next refreshes them in the background.
const getCachedWordPressResponse = unstable_cache(async (url: string) => {
  const freshUrl = new URL(url);
  freshUrl.searchParams.set(
    "fgc_refresh",
    String(Math.floor(Date.now() / WORDPRESS_REFRESH_INTERVAL_MS)),
  );
  const response = await fetch(freshUrl.toString(), {
    cache: "no-store",
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) throw new WordPressRequestError(response.status);
  return {
    body: await response.text(),
    status: response.status,
    headers: Array.from(response.headers.entries()),
  };
}, ["wordpress-editorial-v1"], { revalidate: 15, tags: ["wordpress"] });

async function fetchWordPressResponse(url: string): Promise<Response> {
  try {
    const cached = await getCachedWordPressResponse(url);
    return new Response(cached.body, { status: cached.status, headers: cached.headers });
  } catch (error) {
    // Keep existing pagination/legacy-plugin fallbacks; failed responses are
    // never stored as successful empty editorial content.
    if (error instanceof WordPressRequestError) {
      return new Response(null, { status: error.status });
    }
    throw error;
  }
}

function getTerms(post: WordPressPost): WordPressTerm[] {
  return (
    post._embedded?.["wp:term"]
      ?.flat()
      .filter((term) => term.taxonomy === "category") ?? []
  );
}

function getFeaturedImage(
  post: WordPressPost,
): BlogPostSummary["featuredImage"] {
  const media = post._embedded?.["wp:featuredmedia"]?.[0];

  if (!media?.source_url) {
    return null;
  }

  const mediumLarge = media.media_details.sizes?.medium_large;
  const large = media.media_details.sizes?.large;
  const extraLarge = media.media_details.sizes?.["1536x1536"];
  const full = media.media_details.sizes?.full;
  const card = mediumLarge ?? large ?? full;
  const hero = extraLarge ?? large ?? full ?? card;

  return {
    url: card?.source_url ?? media.source_url,
    width: card?.width ?? media.media_details.width,
    height: card?.height ?? media.media_details.height,
    heroUrl: hero?.source_url ?? media.source_url,
    heroWidth: hero?.width ?? media.media_details.width,
    heroHeight: hero?.height ?? media.media_details.height,
    alt: media.alt_text || "",
  };
}

function mapPostSummary(post: WordPressPost): BlogPostSummary {
  const terms = getTerms(post);

  return {
    id: post.id,
    slug: post.slug,
    title: decodeHtmlText(post.title.rendered),
    excerpt: decodeHtmlText(post.excerpt.rendered),
    date: post.date,
    modified: post.modified,
    featuredImage: getFeaturedImage(post),
    categories: terms.map((term) => ({
      id: term.id,
      name: term.name,
      slug: term.slug,
    })),
    author: post._embedded?.author?.[0]?.name ?? null,
  };
}

function mapPost(post: WordPressPost): BlogPost {
  const summary = mapPostSummary(post);

  return {
    ...summary,
    content: post.content.rendered,
    seo: {
      title: cleanSeoTitle(post.yoast_head_json?.title ?? null),
      description: post.yoast_head_json?.description ?? null,
      canonical: post.yoast_head_json?.canonical ?? null,
      image:
        post.yoast_head_json?.og_image?.[0]?.url ??
        summary.featuredImage?.url ??
        null,
    },
  };
}

async function wordpressFetch<T>(endpoint: string): Promise<{
  data: T;
  response: Response;
}> {
  const response = await fetchWordPressResponse(`${WORDPRESS_API_URL}${endpoint}`);

  if (!response.ok) {
    throw new WordPressRequestError(response.status);
  }

  return {
    data: (await response.json()) as T,
    response,
  };
}

function getDateAfter(dateRange: BlogDateRange): string | null {
  if (dateRange === "all") {
    return null;
  }

  const now = new Date();
  // Day-based filters share a stable cache key throughout the UTC day.
  now.setUTCHours(0, 0, 0, 0);

  if (dateRange === "7d") {
    now.setUTCDate(now.getUTCDate() - 7);
  }

  if (dateRange === "30d") {
    now.setUTCDate(now.getUTCDate() - 30);
  }

  if (dateRange === "year") {
    now.setUTCMonth(0);
    now.setUTCDate(1);
    now.setUTCHours(0, 0, 0, 0);
  }

  return now.toISOString();
}

function buildPostsQuery(options: BlogPostsQuery): string {
  const page = options.page ?? 1;
  const perPage = options.perPage ?? 4;
  const query = options.query?.trim() ?? "";
  const categoryId = options.categoryId;
  const dateRange = options.dateRange ?? "all";
  const sort: BlogSort = options.sort ?? "newest";

  const params = new URLSearchParams();

  params.set("per_page", String(perPage));

  params.set("page", String(page));

  params.set("status", "publish");

  params.set("orderby", "date");

  params.set("order", sort === "oldest" ? "asc" : "desc");

  params.set("_embed", "1");

  if (query) {
    params.set("search", query);
  }

  if (typeof categoryId === "number") {
    params.set("categories", String(categoryId));
  }

  const after = getDateAfter(dateRange);

  if (after) {
    params.set("after", after);
  }

  return params.toString();
}

export async function getBlogPosts(
  options: BlogPostsQuery = {},
): Promise<BlogPostsResult> {
  const query = buildPostsQuery(options);

  const requestedPage = options.page ?? 1;

  try {
    const { data, response } = await wordpressFetch<WordPressPost[]>(
      `/posts?${query}`,
    );

    return {
      posts: data.map(mapPostSummary),
      total: Number(response.headers.get("X-WP-Total") ?? "0"),
      totalPages: Number(response.headers.get("X-WP-TotalPages") ?? "0"),
      page: requestedPage,
    };
  } catch (error) {
    if (!(error instanceof WordPressRequestError) || error.status !== 400) {
      throw error;
    }

    const firstPageQuery = buildPostsQuery({ ...options, page: 1 });
    const firstPage = await wordpressFetch<WordPressPost[]>(
      `/posts?${firstPageQuery}`,
    );
    const total = Number(firstPage.response.headers.get("X-WP-Total") ?? "0");
    const totalPages = Number(
      firstPage.response.headers.get("X-WP-TotalPages") ?? "0",
    );

    if (totalPages <= 1) {
      return {
        posts: firstPage.data.map(mapPostSummary),
        total,
        totalPages,
        page: 1,
      };
    }

    const lastPageQuery = buildPostsQuery({ ...options, page: totalPages });
    const lastPage = await wordpressFetch<WordPressPost[]>(
      `/posts?${lastPageQuery}`,
    );

    return {
      posts: lastPage.data.map(mapPostSummary),
      total,
      totalPages,
      page: totalPages,
    };
  }
}

export async function getBlogCategories(): Promise<WordPressCategory[]> {
  const { data } = await wordpressFetch<WordPressCategory[]>(
    "/categories?per_page=100&hide_empty=true&orderby=count&order=desc",
  );

  return data;
}

export const getPostBySlug = cache(async (slug: string): Promise<BlogPost | null> => {
  const { data } = await wordpressFetch<WordPressPost[]>(
    `/posts?slug=${encodeURIComponent(slug)}&status=publish&_embed=1`,
  );

  const post = data[0];

  if (!post) {
    return null;
  }

  return mapPost(post);
});

/** Fixed editorial slots from the CMS; legacy installations retain newest-first behaviour. */
export async function getHomepagePosts(): Promise<Array<BlogPostSummary | null>> {
  const url = WORDPRESS_API_URL.replace(/\/wp\/v2\/?$/, "/fgc/v1/homepage");
  const response = await fetchWordPressResponse(url);
  if (response.status === 404) return (await getBlogPosts({ perPage: 3 })).posts;
  if (!response.ok) throw new WordPressRequestError(response.status);
  const data = await response.json() as { post_ids?: unknown };
  if (!Array.isArray(data.post_ids) || data.post_ids.length !== 3 ||
      !data.post_ids.every((id: unknown) => id === null || (Number.isInteger(id) && Number(id) > 0))) {
    throw new Error("Invalid homepage slots from WordPress");
  }
  const ids = data.post_ids as Array<number | null>;
  const include = ids.filter((id): id is number => id !== null);
  if (!include.length) return [null, null, null];
  const postsResponse = await fetchWordPressResponse(`${WORDPRESS_API_URL}/posts?include=${include.join(",")}&per_page=3&status=publish&_embed=1`);
  if (!postsResponse.ok) throw new WordPressRequestError(postsResponse.status);
  const posts = await postsResponse.json() as WordPressPost[];
  const summaries = new Map(posts.map((post) => [post.id, mapPostSummary(post)]));
  return ids.map((id) => id === null ? null : summaries.get(id) ?? null);
}
