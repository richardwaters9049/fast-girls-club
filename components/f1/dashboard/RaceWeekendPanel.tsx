"use client";

import { useEffect, useState } from "react";

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
    gridPosition?: number | string;
    driver?: {
        id?: string;
        name?: string;
        shortName?: string;
        nationality?: string;
        number?: number | string;
    } | string;
    driverName?: string;
    name?: string;
    fullName?: string;
    team?: {
        id?: string;
        name?: string;
    } | string;
    teamName?: string;
    constructor?: string;
    time?: string;
    gap?: string;
    status?: string;
    retired?: string | null;
    points?: number | string;
    fastLap?: string;
}

interface RaceApiData {
    round?: number;
    raceId?: string;
    raceName?: string;
    date?: string;
    time?: string;
    status?: string;
    resultsAvailable?: boolean;
    winner?: {
        name?: string;
        shortName?: string;
        driverId?: string;
    };
    teamWinner?: {
        name?: string;
        teamId?: string;
    };
    results?: RaceResult[];
    topDrivers?: RaceResult[];
    races?: {
        results?: RaceResult[];
    };
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
    circuit?: {
        id?: string;
        name?: string;
        location?: string;
        country?: string;
        city?: string;
        length?: number;
        lengthKm?: number;
        corners?: number;
        laps?: number;
        lapRecord?: string;
        fastestLap?: string;
    };
    sessions?: RaceSession[];
    schedule?: {
        practice1?: {
            date?: string | null;
            time?: string | null;
        };
        practice2?: {
            date?: string | null;
            time?: string | null;
        };
        practice3?: {
            date?: string | null;
            time?: string | null;
        };
        qualifying?: {
            date?: string | null;
            time?: string | null;
        };
        sprintQualifying?: {
            date?: string | null;
            time?: string | null;
        };
        sprintRace?: {
            date?: string | null;
            time?: string | null;
        };
        race?: {
            date?: string | null;
            time?: string | null;
        };
    };
    laps?: number;
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

    if (!Number.isNaN(date.getTime())) {
        return date.toLocaleTimeString("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
        });
    }

    const timeMatch = value.match(
        /^(\d{2}):(\d{2})/,
    );

    if (timeMatch) {
        return `${timeMatch[1]}:${timeMatch[2]}`;
    }

    return value;
}

function formatDistance(
    value?: number,
    valueIsKm = false,
): string {
    if (
        typeof value !== "number" ||
        Number.isNaN(value)
    ) {
        return "—";
    }

    const kilometres = valueIsKm
        ? value
        : value > 100
            ? value / 1000
            : value;

    return `${kilometres.toFixed(3)} km`;
}

function getCountdown(
    targetDate: string,
    now: number,
): string {
    const target = new Date(targetDate).getTime();

    if (Number.isNaN(target)) {
        return "—";
    }

    const difference = Math.max(
        0,
        target - now,
    );

    const totalSeconds = Math.floor(
        difference / 1000,
    );

    const days = Math.floor(
        totalSeconds / 86400,
    );

    const hours = Math.floor(
        (totalSeconds % 86400) / 3600,
    );

    const minutes = Math.floor(
        (totalSeconds % 3600) / 60,
    );

    const seconds = totalSeconds % 60;

    return [
        String(days).padStart(2, "0"),
        String(hours).padStart(2, "0"),
        String(minutes).padStart(2, "0"),
        String(seconds).padStart(2, "0"),
    ].join(":");
}

function createRaceSession(
    name: string,
    date?: string | null,
    time?: string | null,
): RaceSession | null {
    if (!date) {
        return null;
    }

    return {
        name,
        date,
        time: time ?? "",
    };
}

function getSessionLabel(
    sessionName: string,
): string {
    const normalised =
        sessionName.toLowerCase();

    if (normalised.includes("practice 1")) {
        return "Practice 1";
    }

    if (normalised.includes("practice 2")) {
        return "Practice 2";
    }

    if (normalised.includes("practice 3")) {
        return "Practice 3";
    }

    if (
        normalised.includes("qualifying") &&
        normalised.includes("sprint")
    ) {
        return "Sprint Qualifying";
    }

    if (normalised.includes("qualifying")) {
        return "Qualifying";
    }

    if (
        normalised.includes("sprint") &&
        normalised.includes("race")
    ) {
        return "Sprint Race";
    }

    if (normalised.includes("race")) {
        return "Race";
    }

    return sessionName;
}

function getSessions(
    data: RaceApiData | null,
): RaceSession[] {
    if (data?.sessions?.length) {
        return data.sessions;
    }

    const schedule = data?.schedule;

    if (!schedule) {
        return [];
    }

    return [
        createRaceSession(
            "Practice 1",
            schedule.practice1?.date,
            schedule.practice1?.time,
        ),
        createRaceSession(
            "Practice 2",
            schedule.practice2?.date,
            schedule.practice2?.time,
        ),
        createRaceSession(
            "Practice 3",
            schedule.practice3?.date,
            schedule.practice3?.time,
        ),
        createRaceSession(
            "Qualifying",
            schedule.qualifying?.date,
            schedule.qualifying?.time,
        ),
        createRaceSession(
            "Sprint Qualifying",
            schedule.sprintQualifying?.date,
            schedule.sprintQualifying?.time,
        ),
        createRaceSession(
            "Sprint Race",
            schedule.sprintRace?.date,
            schedule.sprintRace?.time,
        ),
        createRaceSession(
            "Race",
            schedule.race?.date,
            schedule.race?.time,
        ),
    ].filter(
        (
            session,
        ): session is RaceSession =>
            session !== null,
    );
}

function getRaceDateTime(
    date?: string | null,
    time?: string | null,
): string | null {
    if (!date) {
        return null;
    }

    if (!time) {
        return date;
    }

    return `${date}T${time.replace(
        "Z",
        "",
    )}`;
}

function getRaceResults(
    data: RaceApiData | null,
): RaceResult[] {
    if (!data) {
        return [];
    }

    const candidates = [
        data.results,
        data.races?.results,
        data.topDrivers,
        data.race?.results,
        data.race?.topDrivers,
    ];

    for (const results of candidates) {
        if (
            Array.isArray(results) &&
            results.length > 0
        ) {
            return [...results]
                .sort((a, b) => {
                    const positionA =
                        typeof a.position === "number"
                            ? a.position
                            : Number(a.position);

                    const positionB =
                        typeof b.position === "number"
                            ? b.position
                            : Number(b.position);

                    if (
                        Number.isFinite(positionA) &&
                        Number.isFinite(positionB)
                    ) {
                        return positionA - positionB;
                    }

                    return 0;
                })
                .slice(0, 3);
        }
    }

    return [];
}

function hasRaceResults(
    data: RaceApiData | null,
): boolean {
    if (!data) {
        return false;
    }

    const candidates = [
        data.results,
        data.races?.results,
        data.topDrivers,
        data.race?.results,
        data.race?.topDrivers,
    ];

    return candidates.some(
        (results) =>
            Array.isArray(results) &&
            results.length > 0,
    );
}

function isRaceCompleted(
    data: RaceApiData | null,
): boolean {
    if (!data) {
        return false;
    }

    if (data.resultsAvailable === true) {
        return true;
    }

    if (hasRaceResults(data)) {
        return true;
    }

    return (
        data.status?.toLowerCase() ===
        "completed"
    );
}

function getDriverName(
    result: RaceResult,
): string {
    if (
        typeof result.driver === "object" &&
        result.driver !== null
    ) {
        return (
            result.driver.name ??
            result.driver.shortName ??
            "—"
        );
    }

    return (
        result.driver ??
        result.driverName ??
        result.fullName ??
        result.name ??
        "—"
    );
}

function getTeamName(
    result: RaceResult,
): string {
    if (
        typeof result.team === "object" &&
        result.team !== null
    ) {
        return result.team.name ?? "—";
    }

    return (
        result.team ??
        result.teamName ??
        result.constructor ??
        "—"
    );
}

function getResultTime(
    result: RaceResult,
): string {
    return (
        result.time ??
        result.gap ??
        "—"
    );
}

function getResultPosition(
    result: RaceResult,
    fallback: number,
): string {
    if (typeof result.position === "number") {
        return String(
            result.position,
        ).padStart(2, "0");
    }

    if (
        typeof result.position === "string" &&
        result.position.trim()
    ) {
        return result.position.padStart(
            2,
            "0",
        );
    }

    return String(fallback).padStart(
        2,
        "0",
    );
}

function getRaceWinner(
    data: RaceApiData | null,
    results: RaceResult[],
): string {
    if (data?.winner?.name) {
        return data.winner.name;
    }

    if (data?.race?.winner) {
        return data.race.winner;
    }

    if (results.length > 0) {
        return getDriverName(
            results[0],
        );
    }

    return "—";
}

function getFastestLap(
    data: RaceApiData | null,
): string {
    return (
        data?.circuit?.lapRecord ??
        data?.circuit?.fastestLap ??
        data?.race?.fastestLap ??
        "—"
    );
}

function getRaceLaps(
    data: RaceApiData | null,
): number | string | undefined {
    return (
        data?.laps ??
        data?.race?.laps ??
        data?.circuit?.laps
    );
}

function getRoundNumber(
    value: unknown,
): number | null {
    if (
        typeof value === "number" &&
        Number.isFinite(value)
    ) {
        return value;
    }

    const match = String(
        value ?? "",
    ).match(/\d+/);

    if (!match) {
        return null;
    }

    const round = Number(match[0]);

    if (
        !Number.isFinite(round) ||
        round < 1
    ) {
        return null;
    }

    return round;
}

async function fetchRaceData(
    round: number | null,
): Promise<RaceApiData | null> {
    if (
        round === null ||
        !Number.isFinite(round) ||
        round < 1
    ) {
        return null;
    }

    try {
        const response = await fetch(
            `/api/f1/race/${round}?panel=${Date.now()}`,
            {
                cache: "no-store",
            },
        );

        if (!response.ok) {
            return null;
        }

        const json =
            (await response.json()) as RaceApiData;

        if (
            typeof json.round === "number" &&
            json.round !== round
        ) {
            return null;
        }

        return json;
    } catch {
        return null;
    }
}

async function findPreviousCompletedRace(
    currentRound: number | null,
): Promise<RaceApiData | null> {
    if (
        currentRound === null ||
        !Number.isFinite(currentRound) ||
        currentRound <= 1
    ) {
        return null;
    }

    for (
        let round = currentRound - 1;
        round >= 1;
        round -= 1
    ) {
        const candidate =
            await fetchRaceData(round);

        if (
            candidate &&
            isRaceCompleted(candidate)
        ) {
            return candidate;
        }
    }

    return null;
}

export default function RaceWeekendPanel({
    race,
    nextRace,
}: RaceWeekendPanelProps): React.ReactElement {
    const [data, setData] =
        useState<RaceDataState>({
            current: null,
            previous: null,
            next: null,
        });

    const [now, setNow] = useState(
        () => Date.now(),
    );

    const currentRound =
        getRoundNumber(race.round);

    const nextRound =
        nextRace
            ? getRoundNumber(
                nextRace.round,
            )
            : currentRound !== null
                ? currentRound + 1
                : null;

    useEffect(() => {
        const interval =
            window.setInterval(() => {
                setNow(Date.now());
            }, 1000);

        return () => {
            window.clearInterval(interval);
        };
    }, []);

    useEffect(() => {
        let cancelled = false;

        const loadRaceData =
            async (): Promise<void> => {
                const [
                    current,
                    previous,
                    next,
                ] = await Promise.all([
                    fetchRaceData(
                        currentRound,
                    ),
                    findPreviousCompletedRace(
                        currentRound,
                    ),
                    fetchRaceData(
                        nextRound,
                    ),
                ]);

                if (cancelled) {
                    return;
                }

                setData({
                    current,
                    previous,
                    next,
                });
            };

        void loadRaceData();

        return () => {
            cancelled = true;
        };
    }, [
        currentRound,
        nextRound,
    ]);

    const currentSessions =
        getSessions(data.current);

    const previousResults =
        getRaceResults(
            data.previous,
        );

    const nextCircuit =
        data.next?.circuit ?? null;

    const nextCircuitMap =
        getCircuitMap(
            nextCircuit?.id ??
            nextCircuit?.name ??
            nextRace?.circuit ??
            "",
        );

    const nextRaceStart =
        getRaceDateTime(
            data.next?.schedule?.race?.date ??
            data.next?.date ??
            nextRace?.startDate ??
            null,
            data.next?.schedule?.race?.time ??
            data.next?.time ??
            null,
        );

    const countdown =
        nextRaceStart
            ? getCountdown(
                nextRaceStart,
                now,
            )
            : "—";

    return (
        <div className="overflow-hidden">
            <div className="space-y-4 p-4 sm:p-6 lg:p-8">
                <section className="overflow-hidden border border-white/10 bg-[#242426]">
                    <div className="relative grid lg:grid-cols-[1fr_1.15fr]">
                        <div className="relative z-10 flex flex-col justify-between p-6 sm:p-8 lg:p-10">
                            <div>
                                <div className="flex items-center gap-3">
                                    <span className="text-xl">
                                        {countryCodeToEmoji(
                                            race.countryCode ??
                                            race.country ??
                                            "",
                                        )}
                                    </span>

                                    <span className="text-[9px] font-semibold uppercase tracking-[0.3em] text-[#ff729f]">
                                        Race weekend
                                    </span>
                                </div>

                                <div className="mt-6">
                                    <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-white/25">
                                        Round{" "}
                                        {String(
                                            currentRound ??
                                            race.round,
                                        ).padStart(
                                            2,
                                            "0",
                                        )}
                                    </p>

                                    <h2 className="mt-3 max-w-xl text-4xl font-semibold uppercase leading-[0.9] tracking-[-0.055em] text-white sm:text-5xl">
                                        {race.name}
                                    </h2>

                                    <p className="mt-4 text-[10px] font-medium uppercase tracking-[0.2em] text-white/35">
                                        {race.circuit}{" "}
                                        <span className="text-[#ff729f]">
                                            /
                                        </span>{" "}
                                        {race.country}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-10">
                                <div className="mb-4 flex items-end justify-between">
                                    <div>
                                        <p className="text-[9px] font-semibold uppercase tracking-[0.28em] text-[#ff729f]">
                                            Weekend schedule
                                        </p>

                                        <p className="mt-2 text-[9px] uppercase tracking-[0.15em] text-white/25">
                                            Official session data
                                        </p>
                                    </div>
                                </div>

                                {currentSessions.length > 0 ? (
                                    <div className="space-y-1.5">
                                        {currentSessions.map(
                                            (
                                                session,
                                                index,
                                            ) => {
                                                const isRace =
                                                    getSessionLabel(
                                                        session.name,
                                                    ) ===
                                                    "Race";

                                                return (
                                                    <div
                                                        key={`${session.name}-${session.date}-${index}`}
                                                        className={`flex items-center justify-between border px-4 py-3 ${isRace
                                                            ? "border-[#ff729f]/40 bg-[#ff729f]/[0.06]"
                                                            : "border-white/5 bg-white/[0.015]"
                                                            }`}
                                                    >
                                                        <div className="flex items-center gap-4">
                                                            <span
                                                                className={`h-1.5 w-1.5 rounded-full ${isRace
                                                                    ? "bg-[#ff729f]"
                                                                    : "bg-white/20"
                                                                    }`}
                                                            />

                                                            <div>
                                                                <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-white">
                                                                    {getSessionLabel(
                                                                        session.name,
                                                                    )}
                                                                </p>

                                                                <p className="mt-1 text-[8px] uppercase tracking-[0.15em] text-white/25">
                                                                    {formatShortDate(
                                                                        session.date,
                                                                    )}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-white/50">
                                                            {session.time
                                                                ? formatTime(
                                                                    session.time,
                                                                )
                                                                : "Time TBC"}
                                                        </p>
                                                    </div>
                                                );
                                            },
                                        )}
                                    </div>
                                ) : (
                                    <div className="border border-white/5 bg-white/[0.015] px-4 py-5">
                                        <p className="text-[9px] uppercase tracking-[0.18em] text-white/30">
                                            Session schedule not available yet.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="relative min-h-[340px] overflow-hidden bg-black lg:min-h-[500px]">
                            <div className="absolute inset-0">
                                <RaceMap3D
                                    circuit={getCircuitMap(
                                        race.circuit ?? "",
                                    )}
                                />
                            </div>

                            <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#242426] via-transparent to-transparent opacity-80" />

                            <div className="pointer-events-none absolute right-6 top-6 text-right sm:right-8 sm:top-8">
                                <p className="text-[8px] font-semibold uppercase tracking-[0.28em] text-white/30">
                                    Circuit
                                </p>

                                <p className="mt-2 text-xs font-semibold uppercase tracking-[0.1em] text-white/70">
                                    {race.circuit}
                                </p>
                            </div>

                            <div className="pointer-events-none absolute bottom-6 right-6 text-right sm:bottom-8 sm:right-8">
                                <p className="text-[8px] font-semibold uppercase tracking-[0.24em] text-white/25">
                                    Interactive circuit
                                </p>

                                <p className="mt-2 text-[8px] font-semibold uppercase tracking-[0.18em] text-[#ff729f]">
                                    Drag to rotate • Scroll to zoom
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="grid gap-4 lg:grid-cols-[0.7fr_1.3fr]">
                    <PreviousRaceCard
                        data={data.previous}
                        results={previousResults}
                    />

                    {nextRace && (
                        <NextRaceCard
                            race={nextRace}
                            data={data.next}
                            circuitMap={
                                nextCircuitMap
                            }
                            countdown={
                                countdown
                            }
                        />
                    )}
                </div>
            </div>
        </div>
    );
}

function PreviousRaceCard({
    data,
    results,
}: {
    data: RaceApiData | null;
    results: RaceResult[];
}): React.ReactElement {
    const raceName =
        data?.raceName ??
        "Previous race";

    const circuit =
        data?.circuit?.name ??
        "—";

    const country =
        data?.circuit?.country ??
        "";

    return (
        <section className="overflow-hidden border border-white/10 bg-[#242426]">
            <div className="flex items-start justify-between border-b border-white/10 p-5 sm:p-6">
                <div>
                    <p className="text-[9px] font-semibold uppercase tracking-[0.28em] text-white/30">
                        Previous race
                    </p>

                    <h3 className="mt-3 text-xl font-semibold uppercase leading-none tracking-[-0.04em] text-white">
                        {raceName}
                    </h3>

                    <p className="mt-2 text-[9px] uppercase tracking-[0.16em] text-white/30">
                        {circuit}
                        {country
                            ? ` • ${country}`
                            : ""}
                    </p>
                </div>

                <span className="text-lg">
                    {countryCodeToEmoji(
                        country,
                    )}
                </span>
            </div>

            <div className="divide-y divide-white/5">
                {results.length > 0 ? (
                    results.map(
                        (
                            result,
                            index,
                        ) => (
                            <div
                                key={`${getDriverName(result)}-${index}`}
                                className="flex items-center gap-4 px-5 py-4 sm:px-6"
                            >
                                <span
                                    className={`w-7 text-sm font-semibold ${index === 0
                                        ? "text-[#ff729f]"
                                        : "text-white/25"
                                        }`}
                                >
                                    {getResultPosition(
                                        result,
                                        index + 1,
                                    )}
                                </span>

                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-[10px] font-semibold uppercase tracking-[0.06em] text-white">
                                        {getDriverName(
                                            result,
                                        )}
                                    </p>

                                    <p className="mt-1 truncate text-[8px] uppercase tracking-[0.14em] text-white/25">
                                        {getTeamName(
                                            result,
                                        )}
                                    </p>
                                </div>

                                <p className="text-[9px] font-semibold uppercase tracking-[0.04em] text-white/40">
                                    {getResultTime(
                                        result,
                                    )}
                                </p>
                            </div>
                        ),
                    )
                ) : (
                    <div className="px-5 py-6 sm:px-6">
                        <p className="text-[9px] uppercase tracking-[0.18em] text-white/30">
                            Race results not available.
                        </p>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-3 border-t border-white/10">
                <div className="border-r border-white/10 p-4">
                    <p className="text-[7px] font-semibold uppercase tracking-[0.2em] text-white/25">
                        Winner
                    </p>

                    <p className="mt-2 truncate text-[9px] font-semibold uppercase text-white/70">
                        {getRaceWinner(
                            data,
                            results,
                        )}
                    </p>
                </div>

                <div className="border-r border-white/10 p-4">
                    <p className="text-[7px] font-semibold uppercase tracking-[0.2em] text-white/25">
                        Lap record
                    </p>

                    <p className="mt-2 truncate text-[9px] font-semibold uppercase text-white/70">
                        {getFastestLap(data)}
                    </p>
                </div>

                <div className="p-4">
                    <p className="text-[7px] font-semibold uppercase tracking-[0.2em] text-white/25">
                        Laps
                    </p>

                    <p className="mt-2 text-[9px] font-semibold text-white/70">
                        {getRaceLaps(data) ??
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
    circuitMap: ReturnType<
        typeof getCircuitMap
    >;
    countdown: string;
}): React.ReactElement {
    const circuit =
        data?.circuit ?? null;

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
        circuit?.location ??
        country;

    const length =
        typeof circuit?.lengthKm ===
            "number"
            ? circuit.lengthKm
            : typeof circuit?.length ===
                "number"
                ? circuit.length
                : undefined;

    const lengthIsKm =
        typeof circuit?.lengthKm ===
        "number";

    const corners =
        circuit?.corners;

    const laps =
        circuit?.laps ??
        data?.race?.laps ??
        data?.laps;

    return (
        <section className="overflow-hidden border border-white/10 bg-[#242426]">
            <div className="grid lg:grid-cols-[1fr_1.1fr]">
                <div className="flex flex-col p-6 sm:p-7 lg:p-8">
                    <div className="flex items-start justify-between gap-6">
                        <div>
                            <p className="text-[9px] font-semibold uppercase tracking-[0.3em] text-[#ee8434]">
                                Next race
                            </p>

                            <h3 className="mt-3 text-3xl font-semibold uppercase leading-[0.92] tracking-[-0.05em] text-white sm:text-4xl">
                                {race.name}
                            </h3>

                            <div className="mt-4 flex items-center gap-3">
                                <span className="text-xl">
                                    {countryCodeToEmoji(
                                        race.countryCode ??
                                        country,
                                    )}
                                </span>

                                <div>
                                    <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-white/55">
                                        {circuitName}
                                    </p>

                                    <p className="mt-1 text-[8px] uppercase tracking-[0.16em] text-white/25">
                                        {location}
                                        {country
                                            ? ` • ${country}`
                                            : ""}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="hidden text-right sm:block">
                            <p className="text-[8px] uppercase tracking-[0.2em] text-white/25">
                                Round
                            </p>

                            <p className="mt-1 text-2xl font-semibold text-white">
                                {String(
                                    getRoundNumber(
                                        race.round,
                                    ) ??
                                    race.round,
                                ).padStart(
                                    2,
                                    "0",
                                )}
                            </p>
                        </div>
                    </div>

                    <div className="mt-8 border-y border-white/10">
                        <div className="grid grid-cols-2">
                            <div className="border-r border-white/10 p-4 sm:p-5">
                                <p className="text-[7px] font-semibold uppercase tracking-[0.22em] text-white/25">
                                    Race date
                                </p>

                                <p className="mt-2 text-xs font-semibold uppercase text-white">
                                    {formatDate(
                                        race.startDate,
                                    )}
                                </p>
                            </div>

                            <div className="p-4 sm:p-5">
                                <p className="text-[7px] font-semibold uppercase tracking-[0.22em] text-white/25">
                                    Countdown
                                </p>

                                <p className="mt-2 text-xs font-semibold tracking-[0.04em] text-[#ff729f]">
                                    {countdown}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 border-t border-white/10">
                            <div className="border-r border-white/10 p-4">
                                <p className="text-[7px] font-semibold uppercase tracking-[0.2em] text-white/25">
                                    Length
                                </p>

                                <p className="mt-2 text-[10px] font-semibold text-white/70">
                                    {formatDistance(
                                        length,
                                        lengthIsKm,
                                    )}
                                </p>
                            </div>

                            <div className="border-r border-white/10 p-4">
                                <p className="text-[7px] font-semibold uppercase tracking-[0.2em] text-white/25">
                                    Corners
                                </p>

                                <p className="mt-2 text-[10px] font-semibold text-white/70">
                                    {corners ??
                                        "—"}
                                </p>
                            </div>

                            <div className="p-4">
                                <p className="text-[7px] font-semibold uppercase tracking-[0.2em] text-white/25">
                                    Laps
                                </p>

                                <p className="mt-2 text-[10px] font-semibold text-white/70">
                                    {laps ??
                                        "—"}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-auto pt-8">
                        <p className="text-[8px] font-semibold uppercase tracking-[0.25em] text-white/20">
                            Circuit destination
                        </p>

                        <p className="mt-2 text-xs font-semibold uppercase tracking-[0.08em] text-white/60">
                            {circuitName}
                        </p>

                        <p className="mt-1 text-[8px] uppercase tracking-[0.16em] text-white/25">
                            {location}
                            {country
                                ? ` • ${country}`
                                : ""}
                        </p>
                    </div>
                </div>

                <div className="relative min-h-[320px] overflow-hidden bg-black lg:min-h-[470px]">
                    <RaceMap3D
                        circuit={circuitMap}
                    />

                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/10" />

                    <div className="pointer-events-none absolute left-5 top-5 sm:left-7 sm:top-7">
                        <p className="text-[8px] font-semibold uppercase tracking-[0.28em] text-white/35">
                            Circuit map
                        </p>

                        <p className="mt-2 max-w-[220px] text-[10px] font-semibold uppercase tracking-[0.1em] text-white/75">
                            {circuitName}
                        </p>
                    </div>

                    <div className="pointer-events-none absolute bottom-5 left-5 sm:bottom-7 sm:left-7">
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