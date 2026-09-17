"use client";

import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

import AnimatedLink from "@/components/ui/AnimatedLink";
import ChampionshipPanel from "@/components/f1/dashboard/ChampionshipPanel";
import CalendarPanel from "@/components/f1/dashboard/CalendarPanel";
import GridHeader from "@/components/f1/dashboard/GridHeader";
import GridNavigation from "@/components/f1/dashboard/GridNavigation";
import GridOverview from "@/components/f1/dashboard/GridOverview";
import LiveTimingPanel from "@/components/f1/dashboard/LiveTimingPanel";
import RaceWeekendPanel from "@/components/f1/dashboard/RaceWeekendPanel";

import {
    seriesData,
    type F1Race,
    type F1Series,
} from "@/lib/f1/calendar";

import type { F1LiveResponse } from "@/lib/f1/types";

type Panel =
    | "overview"
    | "race"
    | "live"
    | "drivers"
    | "teams"
    | "calendar";

type RaceStatus = "completed" | "live" | "upcoming";

interface DashboardPanelProps {
    active: boolean;
    children: React.ReactNode;
}

function DashboardPanel({
    active,
    children,
}: DashboardPanelProps) {
    return (
        <div
            className={`absolute inset-0 ${active
                ? "pointer-events-auto z-10"
                : "pointer-events-none z-0"
                }`}
            aria-hidden={!active}
        >
            {children}
        </div>
    );
}

function getRaceStatus(
    race: F1Race,
    now: number,
): RaceStatus {
    const start = new Date(race.startDate).getTime();
    const end = new Date(race.endDate).getTime();

    if (now >= start && now <= end) {
        return "live";
    }

    if (now > end) {
        return "completed";
    }

    return "upcoming";
}

export default function F1Dashboard({
    initialSeries = "f1",
}: {
    initialSeries?: F1Series;
}) {
    const [activeSeries, setActiveSeries] =
        useState<F1Series>(initialSeries);

    const [activePanel, setActivePanel] =
        useState<Panel>("overview");

    const [currentTime, setCurrentTime] = useState(
        () => Date.now(),
    );

    const [liveData, setLiveData] =
        useState<F1LiveResponse | null>(null);

    const [liveLoading, setLiveLoading] =
        useState(true);

    const [liveError, setLiveError] =
        useState<string | null>(null);

    useEffect(() => {
        const interval = window.setInterval(() => {
            setCurrentTime(Date.now());
        }, 30_000);

        return () => {
            window.clearInterval(interval);
        };
    }, []);

    useEffect(() => {
        if (activeSeries !== "f1") {
            return;
        }

        let cancelled = false;

        const loadLiveData = async () => {
            try {
                const response = await fetch(
                    "/api/f1/live",
                    {
                        cache: "no-store",
                    },
                );

                if (!response.ok) {
                    throw new Error(
                        `Live API returned ${response.status}`,
                    );
                }

                const data =
                    (await response.json()) as F1LiveResponse;

                if (cancelled) {
                    return;
                }

                setLiveData(data);
                setLiveLoading(false);
                setLiveError(null);
            } catch (error) {
                if (cancelled) {
                    return;
                }

                setLiveLoading(false);
                setLiveError(
                    error instanceof Error
                        ? error.message
                        : "Unable to load live data",
                );
            }
        };

        loadLiveData();

        const interval = window.setInterval(
            loadLiveData,
            5_000,
        );

        return () => {
            cancelled = true;
            window.clearInterval(interval);
        };
    }, [activeSeries]);

    const calendar =
        seriesData[activeSeries].calendar;

    const displayedRace = useMemo<F1Race | null>(() => {
        if (calendar.length === 0) {
            return null;
        }

        const liveRace = calendar.find(
            (race) =>
                getRaceStatus(
                    race,
                    currentTime,
                ) === "live",
        );

        if (liveRace) {
            return liveRace;
        }

        const upcomingRace = calendar.find(
            (race) =>
                getRaceStatus(
                    race,
                    currentTime,
                ) === "upcoming",
        );

        if (upcomingRace) {
            return upcomingRace;
        }

        return calendar[calendar.length - 1];
    }, [calendar, currentTime]);

    const displayedRaceIndex = useMemo(() => {
        if (!displayedRace) {
            return -1;
        }

        return calendar.findIndex(
            (race) =>
                race.round === displayedRace.round,
        );
    }, [calendar, displayedRace]);

    const previousRace = useMemo<F1Race | null>(() => {
        if (displayedRaceIndex <= 0) {
            return null;
        }

        return (
            calendar[displayedRaceIndex - 1] ??
            null
        );
    }, [calendar, displayedRaceIndex]);

    const nextRace = useMemo<F1Race | null>(() => {
        if (
            displayedRaceIndex < 0 ||
            displayedRaceIndex >=
            calendar.length - 1
        ) {
            return null;
        }

        return (
            calendar[displayedRaceIndex + 1] ??
            null
        );
    }, [calendar, displayedRaceIndex]);

    const displayedRaceStatus =
        useMemo<RaceStatus | null>(() => {
            if (!displayedRace) {
                return null;
            }

            return getRaceStatus(
                displayedRace,
                currentTime,
            );
        }, [displayedRace, currentTime]);

    const completedCount = useMemo(() => {
        return calendar.filter(
            (race) =>
                getRaceStatus(
                    race,
                    currentTime,
                ) === "completed",
        ).length;
    }, [calendar, currentTime]);

    const remainingCount = Math.max(
        calendar.length - completedCount,
        0,
    );

    const liveStatus = useMemo(() => {
        if (activeSeries !== "f1") {
            return "Unavailable";
        }

        if (liveLoading) {
            return "Loading";
        }

        if (liveError) {
            return "Unavailable";
        }

        if (!liveData?.session) {
            return "No live session";
        }

        return "Live";
    }, [
        activeSeries,
        liveData,
        liveError,
        liveLoading,
    ]);

    const liveSession = useMemo(() => {
        if (activeSeries !== "f1") {
            return "No live session";
        }

        return (
            liveData?.session?.sessionName ??
            "No live session"
        );
    }, [activeSeries, liveData]);

    const handleRaceClick = () => {
        setActivePanel("race");
    };

    const championshipActive =
        activePanel === "drivers" ||
        activePanel === "teams";

    return (
        <section className="w-full">
            <GridHeader
                activeSeries={activeSeries}
                onSeriesChange={setActiveSeries}
            />

            <GridNavigation
                activePanel={activePanel}
                onPanelChange={setActivePanel}
            />

            <div className="relative mt-6 min-h-[720px]">
                <DashboardPanel
                    active={activePanel === "overview"}
                >
                    <GridOverview
                        seriesLabel={
                            seriesData[activeSeries]
                                .fullLabel
                        }
                        rounds={calendar.length}
                        completed={completedCount}
                        remaining={remainingCount}
                        liveStatus={liveStatus}
                        liveSession={liveSession}
                        nextRace={displayedRace}
                        onRaceClick={handleRaceClick}
                    />
                </DashboardPanel>

                <DashboardPanel
                    active={activePanel === "race"}
                >
                    {displayedRace &&
                        displayedRaceStatus ? (
                        <RaceWeekendPanel
                            race={displayedRace}
                            previousRace={
                                previousRace
                            }
                            nextRace={nextRace}
                            status={
                                displayedRaceStatus
                            }
                        />
                    ) : (
                        <div className="rounded-2xl border border-white/10 bg-black/20 p-8 text-sm text-white/60">
                            No race data available.
                        </div>
                    )}
                </DashboardPanel>

                <DashboardPanel
                    active={activePanel === "live"}
                >
                    {activeSeries === "f1" ? (
                        <LiveTimingPanel
                            data={liveData}
                            loading={
                                liveLoading
                            }
                            error={liveError}
                        />
                    ) : (
                        <div className="rounded-2xl border border-white/10 bg-black/20 p-8 text-sm text-white/60">
                            Live timing is
                            currently
                            unavailable for{" "}
                            {
                                seriesData[
                                    activeSeries
                                ].fullLabel
                            }
                            .
                        </div>
                    )}
                </DashboardPanel>

                <DashboardPanel
                    active={championshipActive}
                >
                    {activeSeries === "f1" ? (
                        <ChampionshipPanel
                            initialView={
                                activePanel ===
                                    "teams"
                                    ? "teams"
                                    : "drivers"
                            }
                        />
                    ) : (
                        <div className="rounded-2xl border border-white/10 bg-black/20 p-8 text-sm text-white/60">
                            {activePanel ===
                                "teams"
                                ? "Team"
                                : "Driver"}{" "}
                            standings for{" "}
                            {
                                seriesData[
                                    activeSeries
                                ].fullLabel
                            }{" "}
                            are coming soon.
                        </div>
                    )}
                </DashboardPanel>

                <DashboardPanel
                    active={activePanel === "calendar"}
                >
                    <CalendarPanel
                        calendar={calendar}
                        seriesLabel={
                            seriesData[activeSeries]
                                .fullLabel
                        }
                        now={currentTime}
                    />
                </DashboardPanel>
            </div>

            {activePanel === "live" &&
                activeSeries === "f1" &&
                liveData?.session && (
                    <motion.div
                        initial={{
                            opacity: 0,
                            y: 8,
                        }}
                        animate={{
                            opacity: 1,
                            y: 0,
                        }}
                        className="mt-4 flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-4 py-3"
                    >
                        <div>
                            <p className="text-xs uppercase tracking-[0.18em] text-white/40">
                                Current session
                            </p>

                            <p className="mt-1 text-sm font-medium text-white">
                                {
                                    liveData
                                        .session
                                        .sessionName
                                }
                            </p>
                        </div>

                        <AnimatedLink href="/f1">
                            Open dashboard
                        </AnimatedLink>
                    </motion.div>
                )}
        </section>
    );
}