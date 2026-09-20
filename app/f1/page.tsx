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
import GridOverview from "@/components/f1/dashboard/GridOverview";
import LiveTimingPanel from "@/components/f1/dashboard/LiveTimingPanel";
import RaceWeekendPanel from "@/components/f1/dashboard/RaceWeekendPanel";

import {
    seriesData,
    type F1Race,
    type F1Series,
} from "@/lib/f1/calendar";
import { countryNameToCode } from "@/lib/f1/countries";
import {
    getRaceStatus,
    selectDisplayedRace,
} from "@/lib/f1/race-selection";

import type {
    F1LiveResponse,
    F1Race as ApiF1Race,
} from "@/lib/f1/types";

interface F1CalendarResponse {
    season: number;
    count: number;
    races: ApiF1Race[];
}

function adaptApiRace(race: ApiF1Race): F1Race {
    const raceDate =
        race.schedule.race.date ?? "";

    const country =
        race.circuit.country;

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

    const [loading, setLoading] =
        useState(true);

    const [calendarLoading, setCalendarLoading] =
        useState(true);

    const [error, setError] =
        useState<string | null>(null);

    const [calendarError, setCalendarError] =
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

        async function loadCalendar(): Promise<void> {
            try {
                setCalendarLoading(true);
                setCalendarError(null);

                const response = await fetch(
                    "/api/f1/calendar",
                    {
                        cache: "no-store",
                    },
                );

                if (!response.ok) {
                    throw new Error(
                        "Failed to load F1 calendar",
                    );
                }

                const data: F1CalendarResponse =
                    await response.json();

                const adaptedCalendar =
                    data.races
                        .map(adaptApiRace)
                        .sort(
                            (a, b) =>
                                a.round - b.round,
                        );

                if (!cancelled) {
                    setCalendar(
                        adaptedCalendar,
                    );
                    setSeason(data.season);
                    setCalendarError(null);
                }
            } catch (err) {
                console.error(err);

                if (!cancelled) {
                    setCalendarError(
                        "F1 calendar is currently unavailable.",
                    );
                }
            } finally {
                if (!cancelled) {
                    setCalendarLoading(false);
                }
            }
        }

        loadCalendar();

        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        if (activeSeries !== "f1") {
            return;
        }

        let cancelled = false;

        async function loadLiveData(): Promise<void> {
            try {
                const response = await fetch(
                    "/api/f1/live",
                    {
                        cache: "no-store",
                    },
                );

                if (!response.ok) {
                    throw new Error(
                        "Failed to load F1 live data",
                    );
                }

                const data: F1LiveResponse =
                    await response.json();

                if (!cancelled) {
                    setLiveData(data);
                    setError(null);
                    setLoading(false);
                }
            } catch (err) {
                console.error(err);

                if (!cancelled) {
                    setError(
                        "F1 timing is currently unavailable.",
                    );
                    setLoading(false);
                }
            }
        }

        loadLiveData();

        const refreshInterval =
            activePanel === "live" || liveData?.isLive
                ? 5_000
                : 30_000;

        const interval = setInterval(loadLiveData, refreshInterval);

        return () => {
            cancelled = true;
            clearInterval(interval);
        };
    }, [activePanel, activeSeries, liveData?.isLive]);

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

                <GridNavigation
                    activePanel={activePanel}
                    onPanelChange={
                        handlePanelChange
                    }
                />
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto">
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
                            calendarLoading && (
                                <section className="flex min-h-[60vh] items-center justify-center">
                                    <div className="text-center">
                                        <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#ff729f]">
                                            Formula 1
                                        </p>

                                        <p className="mt-4 text-sm font-medium text-white/50">
                                            Loading race
                                            calendar...
                                        </p>
                                    </div>
                                </section>
                            )}

                        {activePanel === "race" &&
                            activeSeries === "f1" &&
                            !calendarLoading &&
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
                            !calendarLoading &&
                            !calendarError &&
                            displayedRace && (
                                <RaceWeekendPanel
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
                                    loading={
                                        loading
                                    }
                                    error={error}
                                />
                            )}

                        {activePanel === "championship" &&
                            activeSeries === "f1" && (
                                <ChampionshipPanel liveDrivers={liveData?.drivers ?? []} />
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
            </div>
        </main>
    );
}
