import { expect, spyOn, test } from "bun:test";

import { loadRaceDetails, peekRaceDetails, loadDriverStandings } from "./race-prefetch";

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
            ? new Response(null, { status: 404 })
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


test("standings share requests and expire instead of surviving a new result indefinitely", async () => {
    const originalFetch = globalThis.fetch;
    const clock = spyOn(Date, "now").mockReturnValue(1_000);
    let requests = 0;
    globalThis.fetch = (async () => {
        requests++;
        return Response.json({ standings: [], revision: requests });
    }) as typeof fetch;
    try {
        const [first, second] = await Promise.all([loadDriverStandings(), loadDriverStandings()]);
        expect(second).toEqual(first);
        await loadDriverStandings();
        expect(requests).toBe(1);
        clock.mockReturnValue(61_001);
        await loadDriverStandings();
        expect(requests).toBe(2);
    } finally {
        clock.mockRestore();
        globalThis.fetch = originalFetch;
    }
});

test("recovers a transient proxy failure automatically and shares the retry", async () => {
    const originalFetch = globalThis.fetch;
    const timeout = globalThis.setTimeout;
    const timer = spyOn(globalThis, "setTimeout").mockImplementation(((callback: () => void) => timeout(callback, 0)) as typeof setTimeout);
    let requests = 0;
    globalThis.fetch = (async () => ++requests === 1
        ? new Response(null, { status: 503 })
        : Response.json({ round: 903 })) as typeof fetch;
    try {
        const [first, second] = await Promise.all([loadRaceDetails(903), loadRaceDetails(903)]);
        expect(first).toEqual({ round: 903 });
        expect(second).toEqual(first);
        expect(requests).toBe(2);
        expect(peekRaceDetails(903)).toEqual(first);
    } finally {
        globalThis.fetch = originalFetch;
        timer.mockRestore();
    }
});

test("a persistent proxy outage remains an error and later requests can recover", async () => {
    const originalFetch = globalThis.fetch;
    const timeout = globalThis.setTimeout;
    const timer = spyOn(globalThis, "setTimeout").mockImplementation(((callback: () => void) => timeout(callback, 0)) as typeof setTimeout);
    let requests = 0;
    globalThis.fetch = (async () => { requests++; return new Response(null, { status: 502 }); }) as typeof fetch;
    try {
        await expect(loadRaceDetails(904)).rejects.toThrow();
        expect(requests).toBe(2);
        expect(peekRaceDetails(904)).toBeUndefined();
        globalThis.fetch = (async () => Response.json({ round: 904 })) as typeof fetch;
        expect(await loadRaceDetails(904)).toEqual({ round: 904 });
    } finally {
        globalThis.fetch = originalFetch;
        timer.mockRestore();
    }
});
