import { afterEach, expect, spyOn, test } from "bun:test";
import { getBlogPosts, getHomepagePosts, getPostBySlug } from "./client";
import { GET } from "@/app/api/blog/latest/route";
const originalFetch = globalThis.fetch;
afterEach(() => { globalThis.fetch = originalFetch; });
const post = (id: number) => ({ id, slug: `story-${id}`, date: '2026-10-05', modified: '2026-10-05', title: { rendered: `Story ${id}` }, excerpt: { rendered: '' }, _embedded: {} });
test('homepage preserves pinned order and empty positions regardless of REST order', async () => {
  let calls = 0;
  globalThis.fetch = (async () => Response.json(++calls === 1 ? { post_ids: [3, null, 1] } : [post(1), post(3)])) as typeof fetch;
  expect((await getHomepagePosts()).map((item) => item?.id ?? null)).toEqual([3, null, 1]);
});
test('all hidden articles produce empty slots without requesting posts', async () => {
  let calls = 0;
  globalThis.fetch = (async () => { calls++; return Response.json({ post_ids: [null, null, null] }); }) as typeof fetch;
  expect(await getHomepagePosts()).toEqual([null, null, null]);
  expect(calls).toBe(1);
});
test('a CMS failure cannot bypass editorial exclusions', async () => {
  globalThis.fetch = (async () => new Response('', { status: 503 })) as typeof fetch;
  await expect(getHomepagePosts()).rejects.toThrow('503');
});
test('rejects malformed CMS slot data', async () => {
  globalThis.fetch = (async () => Response.json({ post_ids: [1, '2', null] })) as typeof fetch;
  await expect(getHomepagePosts()).rejects.toThrow('Invalid homepage slots');
});

test('CMS requests bypass Next caching and rotate the upstream cache key for editorial changes', async () => {
  const clock = spyOn(Date, 'now').mockReturnValue(30_000);
  const requests: Array<{ url: URL; init?: RequestInit }> = [];
  globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
    const url = new URL(String(input));
    requests.push({ url, init });
    if (url.pathname.endsWith('/homepage')) return Response.json({ post_ids: [null, null, null] });
    return Response.json([]);
  }) as typeof fetch;
  try {
    await getHomepagePosts();
    await getBlogPosts();
    expect(await getPostBySlug('trashed-article')).toBeNull();
    clock.mockReturnValue(45_000);
    await getHomepagePosts();
    expect(requests.map(({ url }) => url.searchParams.get('fgc_refresh'))).toEqual(['2', '2', '2', '3']);
    expect(requests.every(({ init }) => init?.cache === 'no-store' && !('next' in init))).toBe(true);
    expect(requests[1].url.searchParams.get('status')).toBe('publish');
    expect(requests[2].url.searchParams.get('slug')).toBe('trashed-article');
  } finally { clock.mockRestore(); }
});

test('homepage drops an unpublished story instead of retaining its cached summary', async () => {
  let calls = 0;
  globalThis.fetch = (async () => Response.json(++calls === 1 ? { post_ids: [3, 2, 1] } : [post(1), post(2)])) as typeof fetch;
  expect((await getHomepagePosts()).map((item) => item?.id ?? null)).toEqual([null, 2, 1]);
});

test('homepage API responses and outages cannot be stored by browser or CDN caches', async () => {
  globalThis.fetch = (async () => Response.json({ post_ids: [null, null, null] })) as typeof fetch;
  const response = await GET();
  expect(response.status).toBe(200);
  expect(response.headers.get('Cache-Control')).toBe('no-store');
  globalThis.fetch = (async () => new Response('', { status: 503 })) as typeof fetch;
  const errorLog = spyOn(console, 'error').mockImplementation(() => {});
  try {
    const failed = await GET();
    expect(failed.status).toBe(503);
    expect(failed.headers.get('Cache-Control')).toBe('no-store');
  } finally { errorLog.mockRestore(); }
});
