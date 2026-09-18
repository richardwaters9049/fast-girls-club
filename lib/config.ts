const DEFAULT_SITE_URL = "http://localhost:3000";
const DEFAULT_WORDPRESS_API_URL =
  "https://fastgirlsclub.co.uk/wp-json/wp/v2";
const DEFAULT_F1_API_BASE_URL = "http://127.0.0.1:8787/api";

function withoutTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

export const SITE_URL = withoutTrailingSlash(
  process.env.NEXT_PUBLIC_SITE_URL ?? DEFAULT_SITE_URL,
);

export const WORDPRESS_API_URL = withoutTrailingSlash(
  process.env.WORDPRESS_API_URL ?? DEFAULT_WORDPRESS_API_URL,
);

export const F1_API_BASE_URL = withoutTrailingSlash(
  process.env.F1_API_BASE_URL ?? DEFAULT_F1_API_BASE_URL,
);

