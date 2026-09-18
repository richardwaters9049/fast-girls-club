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

const WORDPRESS_API_URL = "https://fastgirlsclub.co.uk/wp-json/wp/v2";

const WORDPRESS_REVALIDATE_SECONDS = 60;

function decodeHtml(value: string): string {
  return value
    .replace(/<[^>]*>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#8217;/g, "’")
    .replace(/&#8216;/g, "‘")
    .replace(/&#8220;/g, "“")
    .replace(/&#8221;/g, "”")
    .replace(/&#038;/g, "&")
    .replace(/&nbsp;/g, " ")
    .trim();
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

  const full = media.media_details.sizes?.full;

  return {
    url: mediumLarge?.source_url ?? full?.source_url ?? media.source_url,
    width: mediumLarge?.width ?? full?.width ?? media.media_details.width,
    height: mediumLarge?.height ?? full?.height ?? media.media_details.height,
    alt: media.alt_text || "",
  };
}

function mapPostSummary(post: WordPressPost): BlogPostSummary {
  const terms = getTerms(post);

  return {
    id: post.id,
    slug: post.slug,
    title: decodeHtml(post.title.rendered),
    excerpt: decodeHtml(post.excerpt.rendered),
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
      title: post.yoast_head_json?.title ?? null,
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
  });

  if (!response.ok) {
    throw new Error(`WordPress request failed: ${response.status}`);
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

  const { data, response } = await wordpressFetch<WordPressPost[]>(
    `/posts?${query}`,
  );

  return {
    posts: data.map(mapPostSummary),
    total: Number(response.headers.get("X-WP-Total") ?? "0"),
    totalPages: Number(response.headers.get("X-WP-TotalPages") ?? "0"),
  };
}

export async function getBlogCategories(): Promise<WordPressCategory[]> {
  const { data } = await wordpressFetch<WordPressCategory[]>(
    "/categories?per_page=100&hide_empty=true&orderby=count&order=desc",
  );

  return data;
}

export async function getPosts(perPage = 12): Promise<BlogPostSummary[]> {
  const result = await getBlogPosts({
    page: 1,
    perPage,
    sort: "newest",
  });

  return result.posts;
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
