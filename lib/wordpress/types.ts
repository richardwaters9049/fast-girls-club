export interface WordPressRendered {
  rendered: string;
}

export interface WordPressMediaSize {
  source_url: string;
  width: number;
  height: number;
}

export interface WordPressMediaDetails {
  width: number;
  height: number;
  sizes?: {
    medium?: WordPressMediaSize;
    medium_large?: WordPressMediaSize;
    large?: WordPressMediaSize;
    "1536x1536"?: WordPressMediaSize;
    full?: WordPressMediaSize;
    thumbnail?: WordPressMediaSize;
  };
}

export interface WordPressMedia {
  id: number;
  source_url: string;
  alt_text: string;
  media_details: WordPressMediaDetails;
}

export interface WordPressTerm {
  id: number;
  name: string;
  slug: string;
  taxonomy: string;
}

export interface WordPressAuthor {
  id: number;
  name: string;
  slug: string;
}

export interface WordPressCategory {
  id: number;
  count: number;
  description: string;
  link: string;
  name: string;
  slug: string;
  parent: number;
}

export interface WordPressPost {
  id: number;
  date: string;
  modified: string;
  slug: string;
  status: "publish" | "future" | "draft" | "pending" | "private";
  link: string;
  title: WordPressRendered;
  content: WordPressRendered;
  excerpt: WordPressRendered;
  author: number;
  featured_media: number;
  categories: number[];
  tags: number[];
  _embedded?: {
    author?: WordPressAuthor[];
    "wp:featuredmedia"?: WordPressMedia[];
    "wp:term"?: WordPressTerm[][];
  };
  yoast_head_json?: {
    title?: string;
    description?: string;
    canonical?: string;
    og_title?: string;
    og_description?: string;
    og_url?: string;
    og_image?: Array<{
      url?: string;
      width?: number;
      height?: number;
      type?: string;
    }>;
  };
}

export interface BlogFeaturedImage {
  url: string;
  width: number;
  height: number;
  heroUrl: string;
  heroWidth: number;
  heroHeight: number;
  alt: string;
}

export interface BlogPostSummary {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  modified: string;
  featuredImage: BlogFeaturedImage | null;
  categories: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
  author: string | null;
}

export interface BlogPost extends BlogPostSummary {
  content: string;
  seo: {
    title: string | null;
    description: string | null;
    canonical: string | null;
    image: string | null;
  };
}

export type BlogDateRange = "all" | "7d" | "30d" | "year";

export type BlogSort = "newest" | "oldest";

export interface BlogPostsQuery {
  page?: number;
  perPage?: number;
  query?: string;
  categoryId?: number;
  dateRange?: BlogDateRange;
  sort?: BlogSort;
}

export interface BlogPostsResult {
  posts: BlogPostSummary[];
  total: number;
  totalPages: number;
  page: number;
}
