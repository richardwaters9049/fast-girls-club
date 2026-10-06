import { wakeF1Backend } from "./backend-wakeup";
import type { F1Race } from "@/lib/f1/calendar";
import { countryNameToCode } from "@/lib/f1/countries";
import { selectDisplayedRace } from "@/lib/f1/race-selection";
import type { F1Race as ApiF1Race, F1Session, F1DriverStandingsResponse, F1ConstructorStandingsResponse } from "@/lib/f1/types";

export interface F1CalendarResponse {
    season: number;
    count: number;
    races: ApiF1Race[];
}

interface CacheEntry {
    value?: unknown;
    expiresAt: number;
    pending?: Promise<unknown>;
}

const responseCache = new Map<string, CacheEntry>();
const CALENDAR_TTL = 5 * 60_000;
const RACE_TTL = 5 * 60_000;
const RESULTS_TTL = 60_000;

async function loadJson<T>(url: string, ttl: number): Promise<T> {
    const cached = responseCache.get(url);

    if (cached?.pending) {
        return cached.pending as Promise<T>;
    }

    if (cached && cached.expiresAt > Date.now()) {
        return cached.value as T;
    }

    const pending = wakeF1Backend().then(() => fetchGridData<T>(url))
        .then((value) => {
            responseCache.set(url, {
                value,
                expiresAt: Date.now() + ttl,
            });

            return value;
        })
        .catch((error: unknown) => {
            responseCache.delete(url);
            throw error;
        });

    responseCache.set(url, { expiresAt: 0, pending });

    return pending;
}

async function fetchGridData<T>(url: string): Promise<T> {
    for (let attempt = 0; ; attempt++) {
        try {
            // The proxy may need up to 90 seconds to wake a sleeping service.
            const response = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(100_000) });
            if (response.ok) return await response.json();
            if (attempt === 0 && [429, 500, 502, 503, 504].includes(response.status)) {
                await response.body?.cancel();
                await new Promise((resolve) => setTimeout(resolve, 2_000));
                continue;
            }
            throw new Error(`F1 request failed: ${response.status}`);
        } catch (error) {
            // HTTP errors have already exhausted their retry above. Retry network
            // disconnects once; never turn a missing race into a fabricated result.
            if (attempt === 0 && error instanceof Error && !error.message.startsWith("F1 request failed:")) {
                await new Promise((resolve) => setTimeout(resolve, 2_000));
                continue;
            }
            throw error;
        }
    }
}

function peekJson<T>(url: string): T | undefined {
    const cached = responseCache.get(url);

    if (!cached || cached.pending || cached.expiresAt <= Date.now()) {
        return undefined;
    }

    return cached.value as T;
}

export function adaptApiRace(race: ApiF1Race): F1Race {
    const raceDate = race.schedule.race.date ?? "";
    const country = race.circuit.country;

    return {
        round: race.round,
        name: race.raceName,
        circuit: race.circuit.name,
        location: race.circuit.city,
        country,
        countryCode: countryNameToCode(country),
        startDate: raceDate,
        endDate: raceDate,
    };
}

export function loadRaceCalendar(): Promise<F1CalendarResponse> {
    return loadJson<F1CalendarResponse>("/api/f1/calendar", CALENDAR_TTL);
}

export function loadDriverStandings(): Promise<F1DriverStandingsResponse> {
    return loadJson("/api/f1/drivers", 60_000);
}

export function loadConstructorStandings(): Promise<F1ConstructorStandingsResponse> {
    return loadJson("/api/f1/constructors", 60_000);
}

export function peekGridData() {
    return {
        calendar: peekJson<F1CalendarResponse>("/api/f1/calendar"),
        drivers: peekJson<F1DriverStandingsResponse>("/api/f1/drivers"),
        constructors: peekJson<F1ConstructorStandingsResponse>("/api/f1/constructors"),
    };
}

export async function prefetchGridData(): Promise<void> {
    await Promise.allSettled([
        prefetchRaceTabData(), loadDriverStandings(), loadConstructorStandings(),
    ]);
}

export function loadLatestRaceResults(): Promise<unknown> {
    return loadJson<unknown>("/api/f1/results/latest", RESULTS_TTL);
}

export function loadRaceDetails(round: number): Promise<unknown> {
    return loadJson<unknown>(`/api/f1/race/${round}`, RACE_TTL);
}

export function loadRaceResults(round: number): Promise<unknown> {
    return loadJson<unknown>(`/api/f1/race/${round}/results`, RESULTS_TTL);
}

export function peekRaceDetails(round: number): unknown | undefined {
    return peekJson<unknown>(`/api/f1/race/${round}`);
}

export function peekRaceResults(round: number): unknown | undefined {
    return peekJson<unknown>(`/api/f1/race/${round}/results`);
}

export async function prefetchRaceBundle(
    calendar: F1Race[],
    liveSession?: F1Session | null,
): Promise<void> {
    const selectedRace = selectDisplayedRace(calendar, Date.now(), liveSession);

    if (!selectedRace) {
        return;
    }

    const selectedIndex = calendar.findIndex(
        (race) => race.round === selectedRace.round,
    );
    const nextRound = calendar[selectedIndex + 1]?.round;

    await Promise.allSettled([
        loadRaceDetails(selectedRace.round),
        loadLatestRaceResults(),
        ...(nextRound ? [loadRaceDetails(nextRound)] : []),
    ]);
}

export async function prefetchRaceTabData(): Promise<void> {
    try {
        const response = await loadRaceCalendar();
        const calendar = response.races
            .map(adaptApiRace)
            .sort((a, b) => a.round - b.round);

        await prefetchRaceBundle(calendar);
    } catch {
        // The Grid will show its normal error state if the API is unavailable.
    }
}
