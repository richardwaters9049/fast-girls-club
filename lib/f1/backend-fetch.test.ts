import { afterAll, afterEach, expect, spyOn, test } from "bun:test";
import { fetchF1Backend } from "./backend-fetch";

const fetchSpy = spyOn(globalThis, "fetch");
const originalTimeout = globalThis.setTimeout;
const timerSpy = spyOn(globalThis, "setTimeout").mockImplementation(((callback: () => void) => originalTimeout(callback, 0)) as typeof setTimeout);
afterEach(() => fetchSpy.mockReset());
afterAll(() => { fetchSpy.mockRestore(); timerSpy.mockRestore(); });

test("recovers a sleeping backend and shares the wake-up between concurrent callers", async () => {
    fetchSpy.mockResolvedValueOnce(new Response(null, { status: 429 }))
        .mockResolvedValueOnce(Response.json({ round: 17 }));
    const [first, second] = await Promise.all([
        fetchF1Backend("https://fixture/races/17", { next: { revalidate: 1800 } }),
        fetchF1Backend("https://fixture/races/17", { next: { revalidate: 1800 } }),
    ]);
    expect(await first.json()).toEqual({ round: 17 });
    expect(await second.json()).toEqual({ round: 17 });
    expect(fetchSpy).toHaveBeenCalledTimes(2);
    expect(fetchSpy.mock.calls[1]?.[1]?.next?.revalidate).toBe(1800);
});

test("does not retry missing results", async () => {
    fetchSpy.mockResolvedValueOnce(new Response(null, { status: 404 }));
    expect((await fetchF1Backend("https://fixture/missing")).status).toBe(404);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
});

test("persistent outages stop retrying, and a later visit can recover", async () => {
    fetchSpy.mockResolvedValue(new Response(null, { status: 503 }));
    expect((await fetchF1Backend("https://fixture/outage")).status).toBe(503);
    expect(fetchSpy).toHaveBeenCalledTimes(3);
    fetchSpy.mockResolvedValueOnce(Response.json({ recovered: true }));
    expect(await (await fetchF1Backend("https://fixture/outage")).json()).toEqual({ recovered: true });
});

test("recovers a broken connection without caching the failure", async () => {
    fetchSpy.mockRejectedValueOnce(new TypeError("fetch failed"))
        .mockResolvedValueOnce(Response.json({ recovered: true }));
    expect(await (await fetchF1Backend("https://fixture/disconnect")).json()).toEqual({ recovered: true });
});

test("honours Retry-After beyond the recovery budget without hammering the backend", async () => {
    fetchSpy.mockResolvedValueOnce(new Response(null, { status: 429, headers: { "Retry-After": "180" } }));
    expect((await fetchF1Backend("https://fixture/throttle")).status).toBe(429);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
});
