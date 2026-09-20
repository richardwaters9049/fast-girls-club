"use client";

import {
    AnimatePresence,
    motion,
    useReducedMotion,
} from "framer-motion";

import {
    useEffect,
    useMemo,
    useState,
} from "react";

import AnimatedLink from "@/components/ui/AnimatedLink";

import ChampionshipPanel from "@/components/f1/dashboard/ChampionshipPanel";
import CalendarPanel from "@/components/f1/dashboard/CalendarPanel";
import GridHeader from "@/components/f1/dashboard/GridHeader";
import GridNavigation, {
    type GridPanel,
} from "@/components/f1/dashboard/GridNavigation";
import GridLoadingState from "@/components/f1/dashboard/GridLoadingState";
import GridOverview from "@/components/f1/dashboard/GridOverview";
import LiveTimingPanel from "@/components/f1/dashboard/LiveTimingPanel";
import RaceWeekendPanel from "@/components/f1/dashboard/RaceWeekendPanel";

import {
    seriesData,
    type F1Race,
    type F1Series,
} from "@/lib/f1/calendar";
import {
    getRaceStatus,
    selectDisplayedRace,
} from "@/lib/f1/race-selection";
import {
    adaptApiRace,
    loadRaceCalendar,
    prefetchRaceBundle,
} from "@/lib/f1/race-prefetch";

import type {
    F1ConstructorStandingsResponse,
    F1DriverStandingsResponse,
    F1LiveResponse,
} from "@/lib/f1/types";

async function fetchGridJson<T>(url: string): Promise<T> {
    const response = await fetch(url, {
        cache: "no-store",
        signal: AbortSignal.timeout(12_000),
    });

    if (!response.ok) {
        throw new Error(`${url} returned ${response.status}`);
    }

    return response.json() as Promise<T>;
}

const panelMotion: Record<
    GridPanel,
    {
        initial: Record<string, number | string>;
        animate: Record<string, number | string>;
        exit: Record<string, number | string>;
        transition: {
            duration: number;
            ease: [number, number, number, number];
        };
    }
> = {
    overview: {
        initial: { opacity: 0, y: 18 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -10 },
        transition: {
            duration: 0.4,
            ease: [0.22, 1, 0.36, 1],
        },
    },
    race: {
        initial: { opacity: 0, x: 28 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -20 },
        transition: {
            duration: 0.45,
            ease: [0.22, 1, 0.36, 1],
        },
    },
    live: {
        initial: { opacity: 0, scale: 0.985 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.992 },
        transition: {
            duration: 0.35,
            ease: [0.22, 1, 0.36, 1],
        },
    },
    championship: {
        initial: { opacity: 0, y: 14 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -10 },
        transition: {
            duration: 0.4,
            ease: [0.22, 1, 0.36, 1],
        },
    },
    calendar: {
        initial: { opacity: 0, y: 12 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -8 },
        transition: {
            duration: 0.4,
            ease: [0.22, 1, 0.36, 1],
        },
    },
};

export default function F1Dashboard(): React.ReactElement {
    const reducedMotion = useReducedMotion();
    const [activeSeries, setActiveSeries] =
        useState<F1Series>("f1");

    const [activePanel, setActivePanel] =
        useState<GridPanel>("overview");

    const [calendar, setCalendar] =
        useState<F1Race[]>([]);

    const [season, setSeason] =
        useState<number | null>(null);

    const [liveData, setLiveData] =
        useState<F1LiveResponse | null>(null);

    const [driverStandings, setDriverStandings] =
        useState<F1DriverStandingsResponse | null>(null);

    const [constructorStandings, setConstructorStandings] =
        useState<F1ConstructorStandingsResponse | null>(null);

    const [initialising, setInitialising] =
        useState(true);

    const [error, setError] =
        useState<string | null>(null);

    const [calendarError, setCalendarError] =
        useState<string | null>(null);

    const [driverError, setDriverError] =
        useState<string | null>(null);

    const [constructorError, setConstructorError] =
        useState<string | null>(null);

    const [currentTime, setCurrentTime] =
        useState(() => Date.now());

    useEffect(() => {
        const clock = setInterval(() => {
            setCurrentTime(Date.now());
        }, 30_000);

        return () => clearInterval(clock);
    }, []);

    useEffect(() => {
        let cancelled = false;

        async function loadInitialGridData(): Promise<void> {
            const liveRequest = fetchGridJson<F1LiveResponse>("/api/f1/live");
            const calendarRequest = loadRaceCalendar().then(async (data) => {
                const races = data.races
                    .map(adaptApiRace)
                    .sort((a, b) => a.round - b.round);
                const live = await liveRequest.catch(() => null);

                await prefetchRaceBundle(
                    races,
                    live?.isLive ? live.session : null,
                );

                return { races, season: data.season };
            });

            const [calendarResult, liveResult, driverResult, constructorResult] =
                await Promise.allSettled([
                    calendarRequest,
                    liveRequest,
                    fetchGridJson<F1DriverStandingsResponse>("/api/f1/drivers"),
                    fetchGridJson<F1ConstructorStandingsResponse>("/api/f1/constructors"),
                ]);

            if (cancelled) {
                return;
            }

            if (calendarResult.status === "fulfilled") {
                setCalendar(calendarResult.value.races);
                setSeason(calendarResult.value.season);
            } else {
                console.error("Failed to load F1 calendar:", calendarResult.reason);
                setCalendarError("F1 calendar is currently unavailable.");
            }

            if (liveResult.status === "fulfilled") {
                setLiveData(liveResult.value);
            } else {
                console.error("Failed to load F1 timing:", liveResult.reason);
                setError("F1 timing is currently unavailable.");
            }

            if (driverResult.status === "fulfilled") {
                setDriverStandings(driverResult.value);
            } else {
                console.error("Failed to load driver standings:", driverResult.reason);
                setDriverError("Driver championship data is currently unavailable.");
            }

            if (constructorResult.status === "fulfilled") {
                setConstructorStandings(constructorResult.value);
            } else {
                console.error("Failed to load constructor standings:", constructorResult.reason);
                setConstructorError("Constructor championship data is currently unavailable.");
            }

            setInitialising(false);
        }

        void loadInitialGridData();

        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        if (initialising || activeSeries !== "f1") {
            return;
        }

        let cancelled = false;

        async function loadLiveData(): Promise<void> {
            try {
                const data = await fetchGridJson<F1LiveResponse>("/api/f1/live");

                if (!cancelled) {
                    setLiveData(data);
                    setError(null);
                }
            } catch (err) {
                console.error(err);

                if (!cancelled) {
                    setError(
                        "F1 timing is currently unavailable.",
                    );
                }
            }
        }

        const refreshInterval =
            activePanel === "live" || liveData?.isLive
                ? 5_000
                : 30_000;

        const interval = setInterval(loadLiveData, refreshInterval);

        return () => {
            cancelled = true;
            clearInterval(interval);
        };
    }, [activePanel, activeSeries, initialising, liveData?.isLive]);

    const activeSeriesData =
        activeSeries === "f1"
            ? {
                ...seriesData.f1,
                calendar,
            }
            : seriesData[activeSeries];

    const displayedRace = useMemo<F1Race | null>(() => {
        if (activeSeries !== "f1") {
            return null;
        }

        return selectDisplayedRace(
            calendar,
            currentTime,
            liveData?.isLive ? liveData.session : null,
        );
    }, [activeSeries, calendar, currentTime, liveData]);

    const displayedIndex =
        displayedRace !== null
            ? calendar.findIndex(
                (race) =>
                    race.round ===
                    displayedRace.round,
            )
            : -1;

    const previousRace =
        displayedIndex > 0
            ? calendar[displayedIndex - 1]
            : null;

    const nextRace =
        displayedIndex >= 0 &&
            displayedIndex < calendar.length - 1
            ? calendar[displayedIndex + 1]
            : null;

    const displayedRaceStatus =
        displayedRace !== null
            ? getRaceStatus(
                displayedRace,
                currentTime,
            )
            : "upcoming";

    const completedCount =
        calendar.filter(
            (race) =>
                getRaceStatus(
                    race,
                    currentTime,
                ) === "completed",
        ).length;

    const remainingCount =
        calendar.filter(
            (race) =>
                getRaceStatus(
                    race,
                    currentTime,
                ) !== "completed",
        ).length;

    const liveStatus =
        activeSeries === "f1" &&
            liveData?.isLive
            ? "LIVE"
            : "READY";

    const liveSession =
        activeSeries === "f1"
            ? liveData?.session?.sessionName ??
            "No live session"
            : "Series calendar";

    const handleSeriesChange = (
        series: F1Series,
    ): void => {
        setActiveSeries(series);
        setActivePanel("overview");
    };

    const handlePanelChange = (
        panel: GridPanel,
    ): void => {
        setActivePanel(panel);
    };

    const motionState =
        panelMotion[activePanel];

    return (
        <main className="flex h-[100dvh] flex-col overflow-hidden bg-[#1c1c1c] text-white">
            <div className="shrink-0">
                <GridHeader
                    activeSeries={activeSeries}
                    season={season}
                    onSeriesChange={
                        handleSeriesChange
                    }
                />

                {!initialising && (
                    <GridNavigation
                        activePanel={activePanel}
                        onPanelChange={handlePanelChange}
                    />
                )}
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto">
                {initialising && (
                    <GridLoadingState
                        label="Getting The Grid ready"
                        description="Loading races, live timing and standings"
                    />
                )}
                {!initialising && (
                <AnimatePresence
                    mode="wait"
                    initial={false}
                >
                    <motion.div
                        key={`${activeSeries}-${activePanel}`}
                        initial={reducedMotion ? false : motionState.initial}
                        animate={reducedMotion ? { opacity: 1, x: 0, y: 0, scale: 1 } : motionState.animate}
                        exit={reducedMotion ? { opacity: 1 } : motionState.exit}
                        transition={reducedMotion ? { duration: 0 } : motionState.transition}
                        className="min-h-full"
                    >
                        {activePanel ===
                            "overview" && (
                                <GridOverview
                                    seriesLabel={
                                        activeSeriesData.fullLabel
                                    }
                                    rounds={
                                        activeSeriesData
                                            .calendar
                                            .length
                                    }
                                    completed={
                                        completedCount
                                    }
                                    remaining={
                                        remainingCount
                                    }
                                    liveStatus={
                                        liveStatus
                                    }
                                    liveSession={
                                        liveSession
                                    }
                                    nextRace={
                                        displayedRace
                                    }
                                    onRaceClick={() =>
                                        handlePanelChange(
                                            "race",
                                        )
                                    }
                                />
                            )}

                        {activePanel === "race" &&
                            activeSeries === "f1" &&
                            calendarError && (
                                <section className="flex min-h-[60vh] items-center justify-center">
                                    <div className="px-6 text-center">
                                        <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#ff729f]">
                                            Formula 1
                                        </p>

                                        <h2 className="mt-4 text-3xl font-black uppercase tracking-[-0.05em] text-white">
                                            Race data unavailable
                                        </h2>

                                        <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-white/50">
                                            {calendarError}
                                        </p>
                                    </div>
                                </section>
                            )}

                        {activePanel === "race" &&
                            activeSeries === "f1" &&
                            !calendarError &&
                            !displayedRace && (
                                <section className="flex min-h-[60vh] items-center justify-center px-6 text-center">
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#ff729f]">
                                            The Grid
                                        </p>
                                        <h2 className="mt-4 text-3xl font-black uppercase tracking-[-0.05em] text-white">
                                            No race data available
                                        </h2>
                                        <p className="mt-3 text-sm text-white/55">
                                            There are no races to show for this season yet.
                                        </p>
                                    </div>
                                </section>
                            )}

                        {activePanel === "race" &&
                            activeSeries === "f1" &&
                            !calendarError &&
                            displayedRace && (
                                <RaceWeekendPanel
                                    key={`${displayedRace.round}-${previousRace?.round ?? 0}-${nextRace?.round ?? 0}`}
                                    race={
                                        displayedRace
                                    }
                                    previousRace={
                                        previousRace
                                    }
                                    nextRace={
                                        nextRace
                                    }
                                    status={
                                        displayedRaceStatus
                                    }
                                />
                            )}

                        {activePanel === "live" &&
                            activeSeries === "f1" && (
                                <LiveTimingPanel
                                    data={liveData}
                                    loading={false}
                                    error={error}
                                />
                            )}

                        {activePanel === "championship" &&
                            activeSeries === "f1" && (
                                <ChampionshipPanel
                                    liveDrivers={liveData?.drivers ?? []}
                                    driverStandings={driverStandings}
                                    constructorStandings={constructorStandings}
                                    driverError={driverError}
                                    constructorError={constructorError}
                                />
                            )}

                        {activePanel ===
                            "calendar" && (
                                <CalendarPanel
                                    calendar={
                                        activeSeriesData.calendar
                                    }
                                    seriesLabel={
                                        activeSeriesData.fullLabel
                                    }
                                    now={
                                        currentTime
                                    }
                                />
                            )}

                        {activeSeries !==
                            "f1" &&
                            (activePanel ===
                                "live" ||
                                activePanel ===
                                "championship") && (
                                <section className="flex h-full items-center justify-center">
                                    <div className="px-6 text-center">
                                        <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#ff729f]">
                                            {
                                                activeSeriesData.fullLabel
                                            }
                                        </p>

                                        <h2 className="mt-4 text-3xl font-black uppercase tracking-[-0.05em] text-white md:text-5xl">
                                            Coming to{" "}
                                            {
                                                activeSeriesData.label
                                            }
                                        </h2>

                                        <p className="mx-auto mt-4 max-w-xl text-base font-medium leading-7 text-white/60">
                                            This panel is ready for the deeper{" "}
                                            {
                                                activeSeriesData.fullLabel
                                            }{" "}
                                            data layer.
                                        </p>

                                        <div className="mt-6">
                                            <AnimatedLink
                                                href="/"
                                                variant="accent"
                                            >
                                                Back to Fast Girls Club
                                            </AnimatedLink>
                                        </div>
                                    </div>
                                </section>
                            )}
                    </motion.div>
                </AnimatePresence>
                )}
            </div>
        </main>
    );
}
