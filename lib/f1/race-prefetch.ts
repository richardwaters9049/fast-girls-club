import type { F1Race } from "@/lib/f1/calendar";
import { countryNameToCode } from "@/lib/f1/countries";
import { selectDisplayedRace } from "@/lib/f1/race-selection";
import type { F1Race as ApiF1Race, F1Session } from "@/lib/f1/types";

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

    const pending = fetch(url, { cache: "no-store" })
        .then((response) => {
            if (!response.ok) {
                throw new Error(`F1 request failed: ${response.status}`);
            }

            return response.json() as Promise<T>;
        })
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
    const previousRound = calendar[selectedIndex - 1]?.round;
    const nextRound = calendar[selectedIndex + 1]?.round;

    await Promise.allSettled([
        loadRaceDetails(selectedRace.round),
        ...(previousRound
            ? [loadRaceDetails(previousRound), loadRaceResults(previousRound)]
            : []),
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
