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
    date: string;
    time: string;
}

interface RaceResult {
    position?: number | string;
    driver?: string;
    driverName?: string;
    name?: string;
    fullName?: string;
    team?: string;
    teamName?: string;
    constructor?: string;
    time?: string;
    gap?: string;
    status?: string;
    points?: number | string;
}

interface RaceApiResult {
    status?: string;
    race?: {
        winner?: string;
        winnerTeam?: string;
        fastestLap?: string;
        fastestLapDriver?: string;
        distance?: number;
        laps?: number;
        results?: RaceResult[];
        topDrivers?: RaceResult[];
    };
    results?: RaceResult[];
    topDrivers?: RaceResult[];
    circuit?: {
        name?: string;
        location?: string;
        country?: string;
        length?: number;
        corners?: number;
        laps?: number;
    };
    sessions?: RaceSession[];
}

interface RaceApiData {
    race?: RaceApiResult["race"];
    results?: RaceResult[];
    topDrivers?: RaceResult[];
    circuit?: RaceApiResult["circuit"];
    sessions?: RaceSession[];
}

interface RaceDataState {
    current: RaceApiData | null;
    previous: RaceApiData | null;
    next: RaceApiData | null;
}

function formatDate(value: string): string {
    if (!value) {
        return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

function formatShortDate(value: string): string {
    if (!value) {
        return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleDateString("en-GB", {
        weekday: "short",
        day: "numeric",
        month: "short",
    });
}

function formatTime(value: string): string {
    if (!value) {
        return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    });
}

function formatDistance(value?: number): string {
    if (typeof value !== "number" || Number.isNaN(value)) {
        return "—";
    }

    return `${value.toFixed(3)} km`;
}

function getCountdown(targetDate: string, now: number): string {
    const target = new Date(targetDate).getTime();

    if (Number.isNaN(target)) {
        return "—";
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

function getRaceStartDate(race: F1Race): string {
    return race.startDate;
}

function getSessionLabel(sessionName: string): string {
    const normalised = sessionName.toLowerCase();

    if (normalised.includes("practice 1")) {
        return "Practice 1";
    }

    if (normalised.includes("practice 2")) {
        return "Practice 2";
    }

    if (normalised.includes("practice 3")) {
        return "Practice 3";
    }

    if (normalised.includes("qualifying")) {
        return "Qualifying";
    }

    if (normalised.includes("race")) {
        return "Race";
    }

    return sessionName;
}

function buildFallbackSessions(race: F1Race): RaceSession[] {
    const start = new Date(race.startDate);

    if (Number.isNaN(start.getTime())) {
        return [];
    }

    const createSession = (
        name: string,
        dayOffset: number,
        hour: number,
        minute: number,
    ): RaceSession => {
        const date = new Date(start);

        date.setDate(date.getDate() + dayOffset);
        date.setHours(hour, minute, 0, 0);

        return {
            name,
            date: date.toISOString(),
            time: date.toISOString(),
        };
    };

    return [
        createSession("Practice 1", -2, 9, 30),
        createSession("Practice 2", -2, 13, 0),
        createSession("Practice 3", -1, 9, 30),
        createSession("Qualifying", -1, 13, 0),
        createSession("Race", 0, 12, 0),
    ];
}

function getRaceResults(data: RaceApiData | null): RaceResult[] {
    if (!data) {
        return [];
    }

    const candidates = [
        data.results,
        data.topDrivers,
        data.race?.results,
        data.race?.topDrivers,
    ];

    for (const results of candidates) {
        if (Array.isArray(results) && results.length > 0) {
            return results.slice(0, 3);
        }
    }

    return [];
}

function getDriverName(result: RaceResult): string {
    return (
        result.driver ??
        result.driverName ??
        result.fullName ??
        result.name ??
        "Unknown"
    );
}

function getTeamName(result: RaceResult): string {
    return (
        result.team ??
        result.teamName ??
        result.constructor ??
        "—"
    );
}

function getResultTime(result: RaceResult): string {
    if (result.time) {
        return result.time;
    }

    if (result.gap) {
        return result.gap;
    }

    return "—";
}

function getResultPosition(
    result: RaceResult,
    fallback: number,
): string {
    if (typeof result.position === "number") {
        return String(result.position).padStart(2, "0");
    }

    if (typeof result.position === "string" && result.position) {
        return result.position.padStart(2, "0");
    }

    return String(fallback).padStart(2, "0");
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

        const loadRaceData = async (): Promise<void> => {
            const requests = [
                race?.round
                    ? fetch(`/api/f1/race/${race.round}`, {
                        cache: "no-store",
                    }).then((response) =>
                        response.ok ? response.json() : null,
                    )
                    : Promise.resolve(null),

                previousRace?.round
                    ? fetch(`/api/f1/race/${previousRace.round}`, {
                        cache: "no-store",
                    }).then((response) =>
                        response.ok ? response.json() : null,
                    )
                    : Promise.resolve(null),

                nextRace?.round
                    ? fetch(`/api/f1/race/${nextRace.round}`, {
                        cache: "no-store",
                    }).then((response) =>
                        response.ok ? response.json() : null,
                    )
                    : Promise.resolve(null),
            ];

            try {
                const [current, previous, next] =
                    await Promise.all(requests);

                if (cancelled) {
                    return;
                }

                setData({
                    current,
                    previous,
                    next,
                });
            } catch {
                if (cancelled) {
                    return;
                }

                setData({
                    current: null,
                    previous: null,
                    next: null,
                });
            }
        };

        void loadRaceData();

        return () => {
            cancelled = true;
        };
    }, [nextRace?.round, previousRace?.round, race?.round]);

    const currentData = data.current;
    const previousData = data.previous;
    const nextData = data.next;

    const currentSessions = useMemo(() => {
        if (currentData?.sessions?.length) {
            return currentData.sessions;
        }

        return buildFallbackSessions(race);
    }, [currentData?.sessions, race]);

    const previousResults = useMemo(
        () => getRaceResults(previousData),
        [previousData],
    );

    const nextCircuit = nextData?.circuit ?? null;

    const nextCircuitMap = useMemo(() => {
        return getCircuitMap(
            nextCircuit?.country ??
            nextRace?.country ??
            nextCircuit?.name ??
            nextRace?.circuit ??
            "Singapore",
        );
    }, [
        nextCircuit?.country,
        nextCircuit?.name,
        nextRace?.circuit,
        nextRace?.country,
    ]);

    const nextRaceCountdown = nextRace
        ? getCountdown(getRaceStartDate(nextRace), now)
        : "—";

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
                                                race.countryCode ??
                                                race.country ??
                                                "",
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
                                        {race.name}
                                    </h2>

                                    <p className="mt-2 text-xs font-medium uppercase tracking-[0.18em] text-white/40">
                                        {race.circuit} • {race.country}
                                    </p>
                                </div>

                                <div className="hidden text-right sm:block">
                                    <p className="text-[9px] font-semibold uppercase tracking-[0.28em] text-white/30">
                                        Round
                                    </p>

                                    <p className="mt-1 text-2xl font-semibold text-white">
                                        {String(race.round).padStart(2, "0")}
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
                                            Session times and race day information
                                        </p>
                                    </div>

                                    <p className="hidden text-[9px] font-semibold uppercase tracking-[0.2em] text-white/25 sm:block">
                                        2026 Season
                                    </p>
                                </div>

                                <div className="mt-4 grid gap-2 sm:grid-cols-5">
                                    {currentSessions.map((session, index) => {
                                        const isRace =
                                            getSessionLabel(session.name) ===
                                            "Race";

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

                                                <p className="mt-1 text-[8px] font-medium uppercase tracking-[0.16em] text-white/35">
                                                    {formatTime(session.time)}
                                                    {" UTC"}
                                                </p>
                                            </div>
                                        );
                                    })}
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
    data: RaceApiData | null;
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

    const raceResult = data?.race;

    return (
        <section className="overflow-hidden border border-white/10 bg-[#242426]">
            <div className="border-b border-white/10 p-5 sm:p-6">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <p className="text-[9px] font-semibold uppercase tracking-[0.28em] text-[#ff729f]">
                            Previous race
                        </p>

                        <h3 className="mt-2 text-xl font-semibold uppercase tracking-[-0.035em] text-white sm:text-2xl">
                            {race.name}
                        </h3>

                        <p className="mt-1 text-[9px] font-medium uppercase tracking-[0.18em] text-white/35">
                            {race.circuit} • {race.country}
                        </p>
                    </div>

                    <span className="text-lg">
                        {countryCodeToEmoji(
                            race.countryCode ?? race.country ?? "",
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
                                {getResultPosition(result, index + 1)}
                            </p>

                            <div className="min-w-0">
                                <p className="truncate text-xs font-semibold uppercase tracking-[0.04em] text-white">
                                    {getDriverName(result)}
                                </p>

                                <p className="mt-1 truncate text-[8px] font-medium uppercase tracking-[0.14em] text-white/25">
                                    {getTeamName(result)}
                                </p>
                            </div>

                            <p className="pl-3 text-right text-[10px] font-semibold uppercase tracking-[0.04em] text-white/60">
                                {getResultTime(result)}
                            </p>
                        </div>
                    ))
                ) : (
                    <div className="px-4 py-5">
                        <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-white/25">
                            Race results
                        </p>

                        <p className="mt-2 text-xs text-white/40">
                            {raceResult?.winner ?? "Results unavailable"}
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
                        {raceResult?.winner ?? results[0]
                            ? getDriverName(
                                results[0] ?? {
                                    driver: raceResult?.winner,
                                },
                            )
                            : "—"}
                    </p>
                </div>

                <div className="border-r border-white/10 p-4">
                    <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-white/25">
                        Fastest lap
                    </p>

                    <p className="mt-2 truncate text-[10px] font-semibold uppercase tracking-[0.04em] text-white">
                        {raceResult?.fastestLapDriver ??
                            raceResult?.fastestLap ??
                            "—"}
                    </p>
                </div>

                <div className="p-4">
                    <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-white/25">
                        Laps
                    </p>

                    <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.04em] text-white">
                        {raceResult?.laps ??
                            data?.circuit?.laps ??
                            "—"}
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
    data: RaceApiData | null;
    circuitMap: ReturnType<typeof getCircuitMap>;
    countdown: string;
}): React.ReactElement {
    const circuit = data?.circuit ?? null;

    const country = circuit?.country ?? race.country ?? "";
    const circuitName = circuit?.name ?? race.circuit ?? "Circuit";
    const location = circuit?.location ?? country;

    const length =
        typeof circuit?.length === "number"
            ? circuit.length
            : undefined;

    const corners = circuit?.corners;
    const laps = circuit?.laps ?? data?.race?.laps;

    return (
        <section className="overflow-hidden border border-white/10 bg-[#242426] p-3">
            <div className="grid lg:grid-cols-[0.95fr_1.05fr] gap-8">
                <div className="order-2 flex flex-col lg:order-1">
                    <div className="border-b border-white/10 p-5 sm:p-6 lg:p-7">
                        <div className="flex items-start justify-between gap-6">
                            <div>
                                <p className="text-[9px] font-semibold uppercase tracking-[0.28em] text-[#ff729f]">
                                    Next race
                                </p>

                                <h3 className="mt-2 text-2xl font-semibold uppercase leading-[0.95] tracking-[-0.045em] text-white sm:text-3xl lg:text-4xl">
                                    {race.name}
                                </h3>

                                <div className="mt-3 flex items-start gap-3">
                                    <span className="text-lg">
                                        {countryCodeToEmoji(
                                            race.countryCode ?? country,
                                        )}
                                    </span>

                                    <div>
                                        <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-white/45">
                                            {circuitName}
                                        </p>

                                        <p className="mt-1 text-[9px] font-medium uppercase tracking-[0.18em] text-white/25">
                                            {location} • {country}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <span className="hidden text-xl sm:block">
                                🏁
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 border-b border-white/10 sm:grid-cols-4">
                        <div className="border-r border-white/10 p-4 sm:p-5">
                            <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-white/30">
                                Lights out
                            </p>

                            <p className="mt-2 text-xs font-semibold uppercase tracking-[0.06em] text-white">
                                {formatDate(race.startDate)}
                            </p>
                        </div>

                        <div className="border-b border-white/10 p-4 sm:border-b-0 sm:border-r sm:p-5">
                            <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-white/30">
                                Round
                            </p>

                            <p className="mt-2 text-xs font-semibold text-white">
                                {String(race.round).padStart(2, "0")}
                            </p>
                        </div>

                        <div className="border-r border-white/10 p-4 sm:p-5">
                            <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-white/30">
                                Length
                            </p>

                            <p className="mt-2 truncate text-xs font-semibold text-white">
                                {formatDistance(length)}
                            </p>
                        </div>

                        <div className="p-4 sm:p-5">
                            <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-white/30">
                                Corners
                            </p>

                            <p className="mt-2 text-xs font-semibold text-white">
                                {corners ?? "—"}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 border-b border-white/10">
                        <div className="border-r border-white/10 p-4 sm:p-5">
                            <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-white/30">
                                Laps
                            </p>

                            <p className="mt-2 text-xs font-semibold text-white">
                                {laps ?? "—"}
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
                    <RaceMap3D circuit={circuitMap} />

                    <div className="pointer-events-none absolute left-5 top-5 z-10">
                        <p className="text-[8px] font-semibold uppercase tracking-[0.28em] text-white/40">
                            Circuit map
                        </p>

                        <p className="mt-2 max-w-[220px] text-[10px] font-medium uppercase tracking-[0.12em] text-white/70">
                            {circuitName}
                        </p>
                    </div>

                    <div className="pointer-events-none absolute bottom-5 left-5 z-10">
                        <p className="text-[8px] font-semibold uppercase tracking-[0.24em] text-white/30">
                            Interactive circuit
                        </p>

                        <p className="mt-2 text-[8px] font-semibold uppercase tracking-[0.18em] text-[#ff729f]">
                            Drag to rotate • Scroll to zoom
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}