"use client";

import { useEffect, useMemo, useState } from "react";

import RaceMap3D from "@/components/3d/RaceMap3D";
import { countryCodeToEmoji } from "@/lib/f1/countries";
import { getCircuitMap } from "@/lib/f1/circuits";
import type { F1Race } from "@/lib/f1/calendar";

interface RaceWeekendPanelProps {
    race: F1Race;
    previousRace: F1Race | null;
    nextRace: F1Race | null;
    status: "completed" | "live" | "upcoming";
}

interface RaceSession {
    name: string;
    date: string | null;
    time: string | null;
}

interface RaceResult {
    position?: number | string | null;
    driver?: string | RaceDriver | null;
    driverName?: string | null;
    name?: string | null;
    fullName?: string | null;
    team?: string | RaceConstructor | null;
    teamName?: string | null;
    constructor?: string | RaceConstructor | null;
    time?: string | null;
    gap?: string | null;
    status?: string | null;
    points?: number | string | null;
}

interface RaceDriver {
    givenName?: string | null;
    familyName?: string | null;
    name?: string | null;
}

interface RaceConstructor {
    name?: string | null;
}

interface RaceCircuit {
    id?: string | null;
    circuitId?: string | null;
    name?: string | null;
    circuitName?: string | null;
    country?: string | null;
    city?: string | null;
    lengthKm?: number | string | null;
    circuitLength?: number | string | null;
    length?: number | string | null;
    corners?: number | string | null;
    lapRecord?: string | null;
    fastestLapDriverId?: string | null;
    fastestLapTeamId?: string | null;
    fastestLapYear?: number | string | null;
}

interface RaceScheduleSession {
    date?: string | null;
    time?: string | null;
}

interface RaceSchedule {
    practice1?: RaceScheduleSession | null;
    practice2?: RaceScheduleSession | null;
    practice3?: RaceScheduleSession | null;
    qualifying?: RaceScheduleSession | null;
    sprintQualifying?: RaceScheduleSession | null;
    sprintRace?: RaceScheduleSession | null;
    race?: RaceScheduleSession | null;
}

interface RawRaceResponse {
    round?: number | string | null;
    raceId?: string | null;
    raceName?: string | null;
    season?: number | string | null;
    date?: string | null;
    time?: string | null;
    schedule?: RaceSchedule | null;
    circuit?: RaceCircuit | null;
    laps?: number | string | null;
    winner?: {
        fullName?: string | null;
        firstName?: string | null;
        lastName?: string | null;
    } | null;
    constructorWinner?: {
        name?: string | null;
    } | null;
    teamWinner?: {
        name?: string | null;
    } | null;
}

interface RaceResultsResponse {
    results?: RaceResult[] | null;
    race?: {
        results?: RaceResult[] | null;
    } | null;
}

interface NormalisedRaceData {
    race: {
        name: string | null;
        date: string | null;
        time: string | null;
        winner: string | null;
        teamWinner: string | null;
        fastestLap: string | null;
        fastestLapDriver: string | null;
        laps: number | null;
    };
    circuit: {
        id: string | null;
        name: string | null;
        country: string | null;
        city: string | null;
        length: number | null;
        corners: number | null;
        lapRecord: string | null;
    };
    sessions: RaceSession[];
    results: RaceResult[];
}

interface RaceDataState {
    current: NormalisedRaceData | null;
    previous: NormalisedRaceData | null;
    next: NormalisedRaceData | null;
}

function toNumber(value: unknown): number | null {
    if (typeof value === "number" && Number.isFinite(value)) {
        return value;
    }

    if (typeof value === "string" && value.trim() !== "") {
        const parsed = Number(value);

        if (Number.isFinite(parsed)) {
            return parsed;
        }
    }

    return null;
}

function firstNumber(...values: unknown[]): number | null {
    for (const value of values) {
        const result = toNumber(value);

        if (result !== null) {
            return result;
        }
    }

    return null;
}

function firstString(...values: unknown[]): string | null {
    for (const value of values) {
        if (typeof value === "string" && value.trim() !== "") {
            return value;
        }
    }

    return null;
}

function getDriverName(result: RaceResult): string {
    if (typeof result.driver === "string") {
        return result.driver;
    }

    if (result.driver && typeof result.driver === "object") {
        const fullName = [
            result.driver.givenName,
            result.driver.familyName,
        ]
            .filter(Boolean)
            .join(" ");

        if (fullName) {
            return fullName;
        }

        if (result.driver.name) {
            return result.driver.name;
        }
    }

    return (
        firstString(
            result.driverName,
            result.fullName,
            result.name,
        ) ?? "Unknown"
    );
}

function getTeamName(result: RaceResult): string {
    if (typeof result.team === "string") {
        return result.team;
    }

    if (result.team && typeof result.team === "object") {
        if (result.team.name) {
            return result.team.name;
        }
    }

    if (typeof result.constructor === "string") {
        return result.constructor;
    }

    if (
        result.constructor &&
        typeof result.constructor === "object" &&
        result.constructor.name
    ) {
        return result.constructor.name;
    }

    return firstString(result.teamName) ?? "Unknown";
}

function getResultTime(result: RaceResult): string {
    return firstString(
        result.time,
        result.gap,
        result.status,
    ) ?? "Unavailable";
}

function getResultPosition(
    result: RaceResult,
): string {
    const position = toNumber(result.position);

    if (position !== null) {
        return String(position).padStart(2, "0");
    }

    return "—";
}

function getSessionLabel(name: string): string {
    const normalised = name.toLowerCase();

    if (normalised.includes("practice 1")) {
        return "Practice 1";
    }

    if (normalised.includes("practice 2")) {
        return "Practice 2";
    }

    if (normalised.includes("practice 3")) {
        return "Practice 3";
    }

    if (normalised.includes("sprint qualifying")) {
        return "Sprint Qualifying";
    }

    if (normalised.includes("sprint")) {
        return "Sprint";
    }

    if (normalised.includes("qualifying")) {
        return "Qualifying";
    }

    if (normalised.includes("race")) {
        return "Race";
    }

    return name;
}

function formatDate(value: string | null): string {
    if (!value) {
        return "Unavailable";
    }

    const date = new Date(`${value}T00:00:00`);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

function formatShortDate(value: string | null): string {
    if (!value) {
        return "Unavailable";
    }

    const date = new Date(`${value}T00:00:00`);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleDateString("en-GB", {
        weekday: "short",
        day: "numeric",
        month: "short",
    });
}

function formatTime(
    date: string | null,
    time: string | null,
): string {
    if (!time) {
        return "Time TBC";
    }

    const value = date
        ? `${date}T${time}`
        : time;

    const parsed = new Date(value);

    if (Number.isNaN(parsed.getTime())) {
        return time;
    }

    return parsed.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    });
}

function formatDistance(value: number | null): string {
    if (value === null) {
        return "Unavailable";
    }

    return `${value.toFixed(3)} km`;
}

function getCountdown(
    targetDate: string | null,
    now: number,
): string {
    if (!targetDate) {
        return "Unavailable";
    }

    const target = new Date(`${targetDate}T00:00:00`).getTime();

    if (Number.isNaN(target)) {
        return "Unavailable";
    }

    const difference = Math.max(0, target - now);

    const totalSeconds = Math.floor(difference / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return [
        String(days).padStart(2, "0"),
        String(hours).padStart(2, "0"),
        String(minutes).padStart(2, "0"),
        String(seconds).padStart(2, "0"),
    ].join(":");
}

function buildSessions(
    response: RawRaceResponse,
): RaceSession[] {
    const schedule = response.schedule;

    if (!schedule) {
        return [];
    }

    const entries: Array<
        [string, RaceScheduleSession | null | undefined]
    > = [
            ["Practice 1", schedule.practice1],
            ["Practice 2", schedule.practice2],
            ["Practice 3", schedule.practice3],
            ["Sprint Qualifying", schedule.sprintQualifying],
            ["Sprint Race", schedule.sprintRace],
            ["Qualifying", schedule.qualifying],
            ["Race", schedule.race],
        ];

    return entries
        .filter(([, session]) => session?.date)
        .map(([name, session]) => ({
            name,
            date: session?.date ?? null,
            time: session?.time ?? null,
        }));
}

function normaliseRaceResponse(
    input: unknown,
): NormalisedRaceData | null {
    if (!input || typeof input !== "object") {
        return null;
    }

    const response = input as RawRaceResponse;

    const circuit = response.circuit ?? null;

    const winnerName = response.winner
        ? firstString(
            response.winner.fullName,
            [
                response.winner.firstName,
                response.winner.lastName,
            ]
                .filter(Boolean)
                .join(" "),
        )
        : null;

    return {
        race: {
            name: response.raceName ?? null,
            date: response.date ?? null,
            time: response.time ?? null,
            winner: winnerName,
            teamWinner:
                response.constructorWinner?.name ??
                response.teamWinner?.name ??
                null,
            fastestLap: null,
            fastestLapDriver: null,
            laps: toNumber(response.laps),
        },
        circuit: {
            id:
                circuit?.id ??
                circuit?.circuitId ??
                null,
            name:
                circuit?.name ??
                circuit?.circuitName ??
                null,
            country: circuit?.country ?? null,
            city: circuit?.city ?? null,
            length: firstNumber(
                circuit?.lengthKm,
                circuit?.circuitLength,
                circuit?.length,
            ),
            corners: toNumber(circuit?.corners),
            lapRecord: circuit?.lapRecord ?? null,
        },
        sessions: buildSessions(response),
        results: [],
    };
}

function normaliseResults(
    input: unknown,
): RaceResult[] {
    if (!input || typeof input !== "object") {
        return [];
    }

    const response = input as RaceResultsResponse;

    if (Array.isArray(response.results)) {
        return response.results;
    }

    if (
        response.race &&
        Array.isArray(response.race.results)
    ) {
        return response.race.results;
    }

    return [];
}

export default function RaceWeekendPanel({
    race,
    previousRace,
    nextRace,
    status,
}: RaceWeekendPanelProps): React.ReactElement {
    const [data, setData] = useState<RaceDataState>({
        current: null,
        previous: null,
        next: null,
    });

    const [now, setNow] = useState(() => Date.now());
    const previousRound = previousRace?.round ?? null;
    const nextRound = nextRace?.round ?? null;

    useEffect(() => {
        const interval = window.setInterval(() => {
            setNow(Date.now());
        }, 1000);

        return () => {
            window.clearInterval(interval);
        };
    }, []);

    useEffect(() => {
        let cancelled = false;

        const loadRace = async (
            round: number,
        ): Promise<NormalisedRaceData | null> => {
            try {
                const response = await fetch(
                    `/api/f1/race/${round}`,
                    {
                        cache: "no-store",
                    },
                );

                if (!response.ok) {
                    return null;
                }

                const json: unknown = await response.json();

                return normaliseRaceResponse(json);
            } catch {
                return null;
            }
        };

        const loadResults = async (
            round: number,
        ): Promise<RaceResult[]> => {
            try {
                const response = await fetch(
                    `/api/f1/race/${round}/results`,
                    {
                        cache: "no-store",
                    },
                );

                if (!response.ok) {
                    return [];
                }

                const json: unknown = await response.json();

                return normaliseResults(json);
            } catch {
                return [];
            }
        };

        const loadRaceData = async (): Promise<void> => {
            const [current, previous, next] = await Promise.all([
                loadRace(race.round),
                previousRound
                    ? loadRace(previousRound)
                    : Promise.resolve(null),
                nextRound
                    ? loadRace(nextRound)
                    : Promise.resolve(null),
            ]);

            let previousResults: RaceResult[] = [];

            if (previousRound) {
                previousResults = await loadResults(
                    previousRound,
                );
            }

            if (cancelled) {
                return;
            }

            setData({
                current: current
                    ? {
                        ...current,
                        results: [],
                    }
                    : null,
                previous: previous
                    ? {
                        ...previous,
                        results: previousResults,
                    }
                    : null,
                next,
            });
        };

        void loadRaceData();

        return () => {
            cancelled = true;
        };
    }, [
        nextRound,
        previousRound,
        race.round,
    ]);

    const currentData = data.current;
    const previousData = data.previous;
    const nextData = data.next;

    const displayedName =
        currentData?.race.name ??
        race.name;

    const displayedCircuit =
        currentData?.circuit.name ??
        race.circuit;

    const displayedCountry =
        currentData?.circuit.country ??
        race.country;

    const displayedCountryCode =
        race.countryCode ??
        "";

    const displayedDate =
        currentData?.race.date ??
        race.startDate;

    const displayedSessions =
        currentData?.sessions ??
        [];

    const previousResults =
        previousData?.results.slice(0, 3) ??
        [];

    const nextCircuit =
        nextData?.circuit ??
        null;

    const nextCircuitMap = useMemo(() => {
        return getCircuitMap(
            nextCircuit?.name ??
            nextCircuit?.country ??
            nextRace?.circuit ??
            nextRace?.country,
        );
    }, [
        nextCircuit?.name,
        nextCircuit?.country,
        nextRace?.circuit,
        nextRace?.country,
    ]);

    const nextRaceDate =
        nextData?.race.date ??
        nextRace?.startDate ??
        null;

    const nextRaceCountdown = getCountdown(
        nextRaceDate,
        now,
    );

    return (
        <div className="h-full overflow-hidden">
            <div className="grid gap-4 p-4 sm:p-6 lg:p-8">
                <div className="grid gap-4 lg:grid-cols-[1.65fr_0.85fr]">
                    <section className="relative overflow-hidden border border-white/10 bg-[#242426]">
                        <div className="p-5 sm:p-6 lg:p-7">
                            <div className="flex items-start justify-between gap-6">
                                <div>
                                    <div className="mb-3 flex items-center gap-3">
                                        <span className="text-lg">
                                            {countryCodeToEmoji(
                                                displayedCountryCode,
                                            )}
                                        </span>

                                        <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#ff729f]">
                                            {status === "live"
                                                ? "Live race"
                                                : status === "completed"
                                                    ? "Completed race"
                                                    : "Race weekend"}
                                        </span>
                                    </div>

                                    <h2 className="text-3xl font-semibold uppercase tracking-[-0.04em] text-white sm:text-4xl">
                                        {displayedName}
                                    </h2>

                                    <p className="mt-2 text-xs font-medium uppercase tracking-[0.18em] text-white/40">
                                        {displayedCircuit} •{" "}
                                        {displayedCountry}
                                    </p>
                                </div>

                                <div className="hidden text-right sm:block">
                                    <p className="text-[9px] font-semibold uppercase tracking-[0.28em] text-white/30">
                                        Round
                                    </p>

                                    <p className="mt-1 text-2xl font-semibold text-white">
                                        {String(
                                            race.round,
                                        ).padStart(2, "0")}
                                    </p>
                                </div>
                            </div>

                            <div className="my-6 border-t border-white/10" />

                            <div>
                                <div className="flex items-end justify-between gap-4">
                                    <div>
                                        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#ff729f]">
                                            Weekend schedule
                                        </p>

                                        <p className="mt-2 text-xs tracking-[0.12em] text-white/35">
                                            Official session times and race day information
                                        </p>
                                    </div>

                                    <p className="hidden text-[9px] font-semibold uppercase tracking-[0.2em] text-white/25 sm:block">
                                        Current season
                                    </p>
                                </div>

                                {displayedSessions.length > 0 ? (
                                    <div className="mt-4 grid gap-2 sm:grid-cols-5">
                                        {displayedSessions.map(
                                            (session, index) => {
                                                const isRace =
                                                    getSessionLabel(
                                                        session.name,
                                                    ) === "Race";

                                                return (
                                                    <div
                                                        key={`${session.name}-${session.date}-${index}`}
                                                        className={`border px-3 py-3 ${isRace
                                                            ? "border-[#ff729f]/50 bg-[#ff729f]/5"
                                                            : "border-white/10 bg-white/[0.015]"
                                                            }`}
                                                    >
                                                        <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-white/30">
                                                            {getSessionLabel(
                                                                session.name,
                                                            )}
                                                        </p>

                                                        <p className="mt-2 text-xs font-semibold uppercase tracking-[0.06em] text-white">
                                                            {formatShortDate(
                                                                session.date,
                                                            )}
                                                        </p>

                                                        <p className="mt-1 text-[8px] font-medium uppercase tracking-[0.12em] text-white/35">
                                                            {formatTime(
                                                                session.date,
                                                                session.time,
                                                            )}
                                                        </p>
                                                    </div>
                                                );
                                            },
                                        )}
                                    </div>
                                ) : (
                                    <div className="mt-4 border border-white/10 bg-white/[0.015] px-4 py-5">
                                        <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-white/25">
                                            Weekend schedule
                                        </p>

                                        <p className="mt-2 text-xs text-white/40">
                                            Session schedule unavailable.
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="mt-6 grid grid-cols-2 border-t border-white/10 sm:grid-cols-4">
                                <div className="border-r border-white/10 pt-5 sm:pr-5">
                                    <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-white/30">
                                        Race date
                                    </p>

                                    <p className="mt-2 text-xs font-semibold uppercase tracking-[0.06em] text-white">
                                        {formatDate(
                                            displayedDate,
                                        )}
                                    </p>
                                </div>

                                <div className="border-b border-white/10 p-5 sm:border-b-0 sm:border-r">
                                    <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-white/30">
                                        Circuit length
                                    </p>

                                    <p className="mt-2 text-xs font-semibold text-white">
                                        {formatDistance(
                                            currentData?.circuit.length ??
                                            null,
                                        )}
                                    </p>
                                </div>

                                <div className="border-r border-white/10 pt-5 sm:px-5">
                                    <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-white/30">
                                        Corners
                                    </p>

                                    <p className="mt-2 text-xs font-semibold text-white">
                                        {currentData?.circuit.corners ??
                                            "Unavailable"}
                                    </p>
                                </div>

                                <div className="pt-5 sm:pl-5">
                                    <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-white/30">
                                        Laps
                                    </p>

                                    <p className="mt-2 text-xs font-semibold text-white">
                                        {currentData?.race.laps ??
                                            "Unavailable"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <PreviousRaceCard
                        race={previousRace}
                        data={previousData}
                        results={previousResults}
                    />
                </div>

                {nextRace && (
                    <NextRaceCard
                        race={nextRace}
                        data={nextData}
                        circuitMap={nextCircuitMap}
                        countdown={nextRaceCountdown}
                    />
                )}
            </div>
        </div>
    );
}

function PreviousRaceCard({
    race,
    data,
    results,
}: {
    race: F1Race | null;
    data: NormalisedRaceData | null;
    results: RaceResult[];
}): React.ReactElement {
    if (!race) {
        return (
            <section className="border border-white/10 bg-[#242426] p-6">
                <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/30">
                    Previous race
                </p>

                <p className="mt-4 text-sm text-white/40">
                    No previous race available.
                </p>
            </section>
        );
    }

    const winner =
        data?.race.winner ??
        (results.length > 0
            ? getDriverName(results[0])
            : null);

    return (
        <section className="overflow-hidden border border-white/10 bg-[#242426]">
            <div className="border-b border-white/10 p-5 sm:p-6">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <p className="text-[9px] font-semibold uppercase tracking-[0.28em] text-[#ff729f]">
                            Previous race
                        </p>

                        <h3 className="mt-2 text-xl font-semibold uppercase tracking-[-0.035em] text-white sm:text-2xl">
                            {data?.race.name ??
                                race.name}
                        </h3>

                        <p className="mt-1 text-[9px] font-medium uppercase tracking-[0.18em] text-white/35">
                            {data?.circuit.name ??
                                race.circuit}{" "}
                            •{" "}
                            {data?.circuit.country ??
                                race.country}
                        </p>
                    </div>

                    <span className="text-lg">
                        {countryCodeToEmoji(
                            race.countryCode ??
                            data?.circuit.country ??
                            race.country ??
                            "",
                        )}
                    </span>
                </div>
            </div>

            <div className="border-b border-white/10">
                <div className="grid grid-cols-[42px_minmax(0,1fr)_auto] border-b border-white/10 px-4 py-2">
                    <p className="text-[8px] font-semibold uppercase tracking-[0.18em] text-white/25">
                        Pos
                    </p>

                    <p className="text-[8px] font-semibold uppercase tracking-[0.18em] text-white/25">
                        Driver
                    </p>

                    <p className="text-right text-[8px] font-semibold uppercase tracking-[0.18em] text-white/25">
                        Time
                    </p>
                </div>

                {results.length > 0 ? (
                    results.map((result, index) => (
                        <div
                            key={`${getDriverName(result)}-${index}`}
                            className="grid grid-cols-[42px_minmax(0,1fr)_auto] items-center border-b border-white/5 px-4 py-3 last:border-b-0"
                        >
                            <p
                                className={`text-sm font-semibold ${index === 0
                                    ? "text-[#ff729f]"
                                    : "text-white/45"
                                    }`}
                            >
                                {getResultPosition(result)}
                            </p>

                            <div className="min-w-0">
                                <p className="truncate text-xs font-semibold uppercase tracking-[0.04em] text-white">
                                    {getDriverName(
                                        result,
                                    )}
                                </p>

                                <p className="mt-1 truncate text-[8px] font-medium uppercase tracking-[0.14em] text-white/25">
                                    {getTeamName(
                                        result,
                                    )}
                                </p>
                            </div>

                            <p className="pl-3 text-right text-[10px] font-semibold uppercase tracking-[0.04em] text-white/60">
                                {getResultTime(
                                    result,
                                )}
                            </p>
                        </div>
                    ))
                ) : (
                    <div className="px-4 py-5">
                        <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-white/25">
                            Race results
                        </p>

                        <p className="mt-2 text-xs text-white/40">
                            Results unavailable.
                        </p>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-3">
                <div className="border-r border-white/10 p-4">
                    <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-white/25">
                        Winner
                    </p>

                    <p className="mt-2 truncate text-[10px] font-semibold uppercase tracking-[0.04em] text-white">
                        {winner ?? "Unavailable"}
                    </p>
                </div>

                <div className="border-r border-white/10 p-4">
                    <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-white/25">
                        Fastest lap
                    </p>

                    <p className="mt-2 truncate text-[10px] font-semibold uppercase tracking-[0.04em] text-white">
                        {data?.race.fastestLapDriver ??
                            data?.race.fastestLap ??
                            "Unavailable"}
                    </p>
                </div>

                <div className="p-4">
                    <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-white/25">
                        Laps
                    </p>

                    <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.04em] text-white">
                        {data?.race.laps ??
                            "Unavailable"}
                    </p>
                </div>
            </div>
        </section>
    );
}

function NextRaceCard({
    race,
    data,
    circuitMap,
    countdown,
}: {
    race: F1Race;
    data: NormalisedRaceData | null;
    circuitMap: ReturnType<typeof getCircuitMap>;
    countdown: string;
}): React.ReactElement {
    const circuit = data?.circuit ?? null;

    const country =
        circuit?.country ??
        race.country ??
        "";

    const circuitName =
        circuit?.name ??
        race.circuit ??
        "Circuit";

    const location =
        circuit?.city ??
        country;

    const length =
        circuit?.length ??
        null;

    const corners =
        circuit?.corners ??
        null;

    const laps =
        data?.race.laps ??
        null;

    const raceDate =
        data?.race.date ??
        race.startDate ??
        null;

    return (
        <section className="overflow-hidden border border-white/10 bg-[#242426] p-3">
            <div className="grid items-center gap-8 lg:grid-cols-[0.95fr_1.05fr]">
                <div className="order-2 flex flex-col lg:order-1">
                    <div className="border-b border-white/10 p-5 sm:p-6 lg:p-7">
                        <div className="flex items-start justify-between gap-6">
                            <div>
                                <p className="text-[9px] font-semibold uppercase tracking-[0.28em] text-[#ff729f]">
                                    Next race
                                </p>

                                <h3 className="mt-2 text-2xl font-semibold uppercase leading-[0.95] tracking-[-0.045em] text-white sm:text-3xl lg:text-4xl">
                                    {data?.race.name ??
                                        race.name}
                                </h3>

                                <div className="mt-3 flex items-start gap-3">
                                    <span className="text-lg">
                                        {countryCodeToEmoji(
                                            race.countryCode ??
                                            country,
                                        )}
                                    </span>

                                    <div>
                                        <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-white/45">
                                            {circuitName}
                                        </p>

                                        <p className="mt-1 text-[9px] font-medium uppercase tracking-[0.18em] text-white/25">
                                            {location} •{" "}
                                            {country}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 border-b border-white/10 sm:grid-cols-4">
                        <div className="border-r border-white/10 p-4 sm:p-5">
                            <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-white/30">
                                Lights out
                            </p>

                            <p className="mt-2 text-xs font-semibold uppercase tracking-[0.06em] text-white">
                                {formatDate(
                                    raceDate,
                                )}
                            </p>
                        </div>

                        <div className="border-b border-white/10 p-4 sm:border-b-0 sm:border-r sm:p-5">
                            <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-white/30">
                                Round
                            </p>

                            <p className="mt-2 text-xs font-semibold text-white">
                                {String(
                                    race.round,
                                ).padStart(2, "0")}
                            </p>
                        </div>

                        <div className="border-r border-white/10 p-4 sm:p-5">
                            <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-white/30">
                                Length
                            </p>

                            <p className="mt-2 truncate text-xs font-semibold text-white">
                                {formatDistance(
                                    length,
                                )}
                            </p>
                        </div>

                        <div className="p-4 sm:p-5">
                            <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-white/30">
                                Corners
                            </p>

                            <p className="mt-2 text-xs font-semibold text-white">
                                {corners ??
                                    "Unavailable"}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 border-b border-white/10">
                        <div className="border-r border-white/10 p-4 sm:p-5">
                            <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-white/30">
                                Laps
                            </p>

                            <p className="mt-2 text-xs font-semibold text-white">
                                {laps ??
                                    "Unavailable"}
                            </p>
                        </div>

                        <div className="p-4 sm:p-5">
                            <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-white/30">
                                Until lights out
                            </p>

                            <p className="mt-2 text-xs font-semibold uppercase tracking-[0.06em] text-[#ee8434]">
                                Counting down
                            </p>
                        </div>
                    </div>

                    <div className="flex items-end justify-between gap-6 p-5 sm:p-6">
                        <div>
                            <p className="text-[8px] font-semibold uppercase tracking-[0.28em] text-white/30">
                                Countdown
                            </p>

                            <p className="mt-2 whitespace-nowrap text-2xl font-semibold tracking-[-0.04em] text-white sm:text-3xl">
                                {countdown}
                            </p>
                        </div>

                        <div className="hidden text-right sm:block">
                            <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-white/25">
                                Next destination
                            </p>

                            <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.06em] text-white/60">
                                {country}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="relative order-1 h-[280px] overflow-hidden bg-black lg:order-2 lg:h-[390px]">
                    {circuitMap ? (
                        <RaceMap3D circuit={circuitMap} />
                    ) : (
                        <div className="flex h-full items-center justify-center px-8 text-center">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/35">
                                Circuit map unavailable
                            </p>
                        </div>
                    )}

                    <div className="pointer-events-none absolute left-5 top-5 z-10">
                        <p className="text-[8px] font-semibold uppercase tracking-[0.28em] text-white/40">
                            Circuit map
                        </p>

                        <p className="mt-2 max-w-[220px] text-[10px] font-medium uppercase tracking-[0.12em] text-white/70">
                            {circuitName}
                        </p>
                    </div>

                    {circuitMap ? <div className="pointer-events-none absolute bottom-5 left-5 z-10">
                        <p className="text-[8px] font-semibold uppercase tracking-[0.24em] text-white/30">
                            Interactive circuit
                        </p>

                        <p className="mt-2 text-[8px] font-semibold uppercase tracking-[0.18em] text-[#ff729f]">
                            Drag to rotate • Scroll to zoom
                        </p>
                    </div> : null}
                </div>
            </div>
        </section>
    );
}
