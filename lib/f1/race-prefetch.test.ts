import { expect, test } from "bun:test";

import { loadRaceDetails, peekRaceDetails } from "./race-prefetch";

test("shares an in-flight race request and reuses its completed response", async () => {
    const originalFetch = globalThis.fetch;
    let requests = 0;

    globalThis.fetch = (async () => {
        requests += 1;
        return new Response(JSON.stringify({ round: 901 }), { status: 200 });
    }) as typeof fetch;

    try {
        const [first, second] = await Promise.all([
            loadRaceDetails(901),
            loadRaceDetails(901),
        ]);

        expect(first).toEqual({ round: 901 });
        expect(second).toEqual(first);
        expect(peekRaceDetails(901)).toEqual(first);

        await loadRaceDetails(901);
        expect(requests).toBe(1);
    } finally {
        globalThis.fetch = originalFetch;
    }
});

test("does not cache a failed race request", async () => {
    const originalFetch = globalThis.fetch;
    let requests = 0;

    globalThis.fetch = (async () => {
        requests += 1;
        return requests === 1
            ? new Response(null, { status: 502 })
            : new Response(JSON.stringify({ round: 902 }), { status: 200 });
    }) as typeof fetch;

    try {
        await expect(loadRaceDetails(902)).rejects.toThrow();
        expect(peekRaceDetails(902)).toBeUndefined();
        expect(await loadRaceDetails(902)).toEqual({ round: 902 });
        expect(requests).toBe(2);
    } finally {
        globalThis.fetch = originalFetch;
    }
});
