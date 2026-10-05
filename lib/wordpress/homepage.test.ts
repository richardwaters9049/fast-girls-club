import { afterEach, expect, test } from "bun:test";
import { getHomepagePosts } from "./client";
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
