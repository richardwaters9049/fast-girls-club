"use client";

import {
    AnimatePresence,
    motion,
} from "framer-motion";
import { useEffect, useMemo, useState } from "react";

import AnimatedLink from "@/components/ui/AnimatedLink";

import ChampionshipPanel from "./dashboard/ChampionshipPanel";
import CalendarPanel from "./dashboard/CalendarPanel";
import GridHeader from "./dashboard/GridHeader";
import GridNavigation, {
    type GridPanel,
} from "./dashboard/GridNavigation";
import GridOverview from "./dashboard/GridOverview";
import LiveTimingPanel from "./dashboard/LiveTimingPanel";
import RaceWeekendPanel from "./dashboard/RaceWeekendPanel";

import {
    seriesData,
    type F1Race,
    type F1Series,
} from "@/lib/f1/calendar";
import type { F1LiveResponse } from "@/lib/f1/types";

function getRaceStatus(
    race: F1Race,
    now: number,
): "completed" | "next" | "upcoming" {
    const start = new Date(
        `${race.startDate}T00:00:00`,
    ).getTime();

    const end = new Date(
        `${race.endDate}T23:59:59`,
    ).getTime();

    if (now > end) {
        return "completed";
    }

    if (now >= start && now <= end) {
        return "next";
    }

    return "upcoming";
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
        initial: {
            opacity: 0,
            y: 18,
        },
        animate: {
            opacity: 1,
            y: 0,
        },
        exit: {
            opacity: 0,
            y: -10,
        },
        transition: {
            duration: 0.4,
            ease: [0.22, 1, 0.36, 1],
        },
    },
    race: {
        initial: {
            opacity: 0,
            x: 28,
        },
        animate: {
            opacity: 1,
            x: 0,
        },
        exit: {
            opacity: 0,
            x: -20,
        },
        transition: {
            duration: 0.45,
            ease: [0.22, 1, 0.36, 1],
        },
    },
    live: {
        initial: {
            opacity: 0,
            scale: 0.985,
        },
        animate: {
            opacity: 1,
            scale: 1,
        },
        exit: {
            opacity: 0,
            scale: 0.992,
        },
        transition: {
            duration: 0.35,
            ease: [0.22, 1, 0.36, 1],
        },
    },
    drivers: {
        initial: {
            opacity: 0,
            x: -24,
        },
        animate: {
            opacity: 1,
            x: 0,
        },
        exit: {
            opacity: 0,
            x: 20,
        },
        transition: {
            duration: 0.4,
            ease: [0.22, 1, 0.36, 1],
        },
    },
    teams: {
        initial: {
            opacity: 0,
            x: 24,
        },
        animate: {
            opacity: 1,
            x: 0,
        },
        exit: {
            opacity: 0,
            x: -20,
        },
        transition: {
            duration: 0.4,
            ease: [0.22, 1, 0.36, 1],
        },
    },
    calendar: {
        initial: {
            opacity: 0,
            y: 12,
        },
        animate: {
            opacity: 1,
            y: 0,
        },
        exit: {
            opacity: 0,
            y: -8,
        },
        transition: {
            duration: 0.4,
            ease: [0.22, 1, 0.36, 1],
        },
    },
};

export default function F1Dashboard(): React.ReactElement {
    const [activeSeries, setActiveSeries] =
        useState<F1Series>("f1");

    const [activePanel, setActivePanel] =
        useState<GridPanel>("overview");

    const [liveData, setLiveData] =
        useState<F1LiveResponse | null>(
            null,
        );

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState<string | null>(null);

    const [currentTime, setCurrentTime] =
        useState(() => Date.now());

    useEffect(() => {
        const clock = setInterval(() => {
            setCurrentTime(
                Date.now(),
            );
        }, 1000);

        return () =>
            clearInterval(clock);
    }, []);

    useEffect(() => {
        if (activeSeries !== "f1") {
            return;
        }

        let cancelled = false;

        async function loadLiveData(): Promise<void> {
            try {
                const response =
                    await fetch(
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
                    setLiveData(
                        data,
                    );
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

        const interval =
            setInterval(
                loadLiveData,
                5000,
            );

        return () => {
            cancelled = true;
            clearInterval(
                interval,
            );
        };
    }, [activeSeries]);

    const activeSeriesData =
        seriesData[
        activeSeries
        ];

    const calendar =
        activeSeriesData.calendar;

    const displayedRace =
        useMemo<F1Race | null>(
            () => {
                if (
                    activeSeries ===
                    "f1" &&
                    liveData?.session
                ) {
                    const sessionCountry =
                        liveData.session.countryName.toLowerCase();

                    const liveRace =
                        calendar.find(
                            (race) =>
                                race.country.toLowerCase() ===
                                sessionCountry,
                        );

                    if (liveRace) {
                        return liveRace;
                    }
                }

                const currentRace =
                    calendar.find(
                        (race) =>
                            getRaceStatus(
                                race,
                                currentTime,
                            ) === "next",
                    );

                if (currentRace) {
                    return currentRace;
                }

                return (
                    calendar.find(
                        (race) =>
                            getRaceStatus(
                                race,
                                currentTime,
                            ) ===
                            "upcoming",
                    ) ??
                    calendar.at(-1) ??
                    null
                );
            },
            [
                activeSeries,
                calendar,
                currentTime,
                liveData,
            ],
        );

    const displayedIndex =
        displayedRace
            ? calendar.findIndex(
                (race) =>
                    race.round ===
                    displayedRace.round,
            )
            : -1;

    const previousRace =
        displayedIndex > 0
            ? calendar[
            displayedIndex - 1
            ]
            : null;

    const nextRace =
        displayedIndex >= 0 &&
            displayedIndex <
            calendar.length - 1
            ? calendar[
            displayedIndex + 1
            ]
            : null;

    const displayedRaceStatus =
        displayedRace
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
                ) ===
                "completed",
        ).length;

    const remainingCount =
        calendar.filter(
            (race) =>
                getRaceStatus(
                    race,
                    currentTime,
                ) !==
                "completed",
        ).length;

    const liveStatus =
        activeSeries === "f1" &&
            liveData?.isLive
            ? "LIVE"
            : "READY";

    const liveSession =
        activeSeries === "f1"
            ? liveData?.session
                ?.sessionName ??
            "No live session"
            : "Series calendar";

    const handleSeriesChange = (
        series: F1Series,
    ): void => {
        setActiveSeries(
            series,
        );
        setActivePanel(
            "overview",
        );
    };

    const handlePanelChange = (
        panel: GridPanel,
    ): void => {
        setActivePanel(
            panel,
        );
    };

    const motionState =
        panelMotion[
        activePanel
        ];

    return (
        <main className="flex h-[100dvh] flex-col overflow-hidden bg-[#1c1c1c] text-white">
            <div className="shrink-0">
                <GridHeader
                    activeSeries={
                        activeSeries
                    }
                    onSeriesChange={
                        handleSeriesChange
                    }
                />

                <GridNavigation
                    activePanel={
                        activePanel
                    }
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
                        initial={motionState.initial}
                        animate={motionState.animate}
                        exit={motionState.exit}
                        transition={motionState.transition}
                        className="min-h-full"
                    >
                        {activePanel ===
                            "overview" && (
                                <GridOverview
                                    seriesLabel={
                                        activeSeriesData.fullLabel
                                    }
                                    rounds={
                                        calendar.length
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

                        {activePanel ===
                            "race" && (
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

                        {activePanel ===
                            "live" &&
                            activeSeries ===
                            "f1" && (
                                <LiveTimingPanel
                                    data={
                                        liveData
                                    }
                                    loading={
                                        loading
                                    }
                                    error={
                                        error
                                    }
                                />
                            )}

                        {activePanel ===
                            "drivers" &&
                            activeSeries ===
                            "f1" && (
                                <ChampionshipPanel />
                            )}

                        {activePanel ===
                            "teams" &&
                            activeSeries ===
                            "f1" && (
                                <ChampionshipPanel
                                    initialView="teams"
                                />
                            )}

                        {activePanel ===
                            "calendar" && (
                                <CalendarPanel
                                    calendar={
                                        calendar
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
                                "drivers" ||
                                activePanel ===
                                "teams") && (
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
                                            This panel is ready for
                                            the deeper{" "}
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