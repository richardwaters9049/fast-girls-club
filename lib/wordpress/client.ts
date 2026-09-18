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

const WORDPRESS_REVALIDATE_SECONDS = 60;

class WordPressRequestError extends Error {
  constructor(public readonly status: number) {
    super(`WordPress request failed: ${status}`);
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
  const response = await fetch(`${WORDPRESS_API_URL}${endpoint}`, {
    next: {
      revalidate: WORDPRESS_REVALIDATE_SECONDS,
    },
    signal: AbortSignal.timeout(10_000),
  });

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

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const { data } = await wordpressFetch<WordPressPost[]>(
    `/posts?slug=${encodeURIComponent(slug)}&status=publish&_embed=1`,
  );

  const post = data[0];

  if (!post) {
    return null;
  }

  return mapPost(post);
}
