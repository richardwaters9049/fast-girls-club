"use client";

import { useEffect, useState } from "react";

import ConstructorStandings from "./ConstructorStandings";
import DriverStandings from "./DriverStandings";
import LiveTiming from "./LiveTiming";

import RaceMap3D from "@/components/3d/RaceMap3D";
import { getCircuitMap } from "@/lib/f1/circuits";

import type {
    F1LiveResponse,
    F1Tab,
} from "@/lib/f1/types";

const tabs: {
    id: F1Tab;
    label: string;
    shortLabel: string;
}[] = [
        {
            id: "live",
            label: "Live Timing",
            shortLabel: "Live",
        },
        {
            id: "drivers",
            label: "Driver Championship",
            shortLabel: "Drivers",
        },
        {
            id: "constructors",
            label: "Constructor Championship",
            shortLabel: "Teams",
        },
    ];

const activeCircuit = getCircuitMap("monza");

export default function F1DataHub(): React.ReactElement {
    const [activeTab, setActiveTab] = useState<F1Tab>("live");
    const [liveData, setLiveData] = useState<F1LiveResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentTime, setCurrentTime] = useState(() => Date.now());

    useEffect(() => {
        const clock = setInterval(() => {
            setCurrentTime(Date.now());
        }, 1000);

        return () => {
            clearInterval(clock);
        };
    }, []);

    useEffect(() => {
        if (activeTab !== "live") {
            return;
        }

        let cancelled = false;

        async function loadLiveData(): Promise<void> {
            try {
                setLoading(true);

                const response = await fetch("/api/f1/live", {
                    cache: "no-store",
                });

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
                }
            } catch (err) {
                console.error(err);

                if (!cancelled) {
                    setError(
                        "F1 timing is currently unavailable.",
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        loadLiveData();

        const interval = setInterval(() => {
            loadLiveData();
        }, 5000);

        return () => {
            cancelled = true;
            clearInterval(interval);
        };
    }, [activeTab]);

    const session = liveData?.session ?? null;

    return (
        <section
            id="f1-data"
            className="relative overflow-hidden border-y border-white/10 bg-[#1c1c1c] px-5 py-16 text-white sm:px-8 sm:py-20 lg:px-12 lg:py-24"
        >
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -right-40 -top-40 h-[420px] w-[420px] rounded-full bg-[#ff729f]/20 blur-[120px]" />

                <div className="absolute -bottom-48 -left-40 h-[480px] w-[480px] rounded-full bg-[#ee8434]/15 blur-[130px]" />

                <div
                    className="absolute inset-0 opacity-[0.035]"
                    style={{
                        backgroundImage:
                            "linear-gradient(135deg, transparent 25%, #ffffff 25%, #ffffff 26%, transparent 26%, transparent 74%, #ffffff 74%, #ffffff 75%, transparent 75%)",
                        backgroundSize: "70px 70px",
                    }}
                />
            </div>

            <div className="relative mx-auto max-w-[77.5rem]">
                <div className="mb-8 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
                    <div>
                        <div className="mb-4 flex items-center gap-3">
                            <span className="h-[3px] w-10 bg-[#ff729f]" />

                            <p className="text-xs font-black uppercase tracking-[0.3em] text-[#ff729f]">
                                Formula 1
                            </p>
                        </div>

                        <div className="flex flex-wrap items-end gap-x-5 gap-y-2">
                            <h2 className="text-5xl font-black uppercase leading-[0.9] tracking-[-0.06em] sm:text-6xl lg:text-7xl">
                                F1 Data
                                <span className="text-[#ff729f]">
                                    {" "}
                                    Hub
                                </span>
                            </h2>

                            <span className="mb-1 border border-[#ee8434]/30 bg-[#ee8434]/10 px-2.5 py-1.5 text-[8px] font-black uppercase tracking-[0.2em] text-[#ee8434]">
                                Live Data
                            </span>
                        </div>

                        <p className="mt-5 max-w-2xl text-sm leading-6 text-white/55 sm:text-base">
                            Live timing, driver standings and constructor
                            championship data for the 2026 Formula 1 season.
                        </p>
                    </div>

                    <SeasonBadge
                        session={session}
                        currentTime={currentTime}
                    />
                </div>

                <div className="mb-6 overflow-hidden border-y border-white/10">
                    <div className="grid grid-cols-3">
                        {tabs.map((tab) => {
                            const active = activeTab === tab.id;

                            return (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => setActiveTab(tab.id)}
                                    aria-pressed={active}
                                    className={[
                                        "relative px-2 py-5 text-center text-[9px] font-black uppercase tracking-[0.1em] transition-colors duration-200 sm:px-4 sm:text-xs sm:tracking-[0.16em]",
                                        active
                                            ? "bg-[#ff729f] text-[#1c1c1c]"
                                            : "text-white/40 hover:bg-white/[0.025] hover:text-white",
                                    ].join(" ")}
                                >
                                    <span className="relative">
                                        <span className="hidden sm:inline">
                                            {tab.label}
                                        </span>

                                        <span className="sm:hidden">
                                            {tab.shortLabel}
                                        </span>
                                    </span>

                                    {active && (
                                        <span className="absolute bottom-0 left-1/2 h-[3px] w-12 -translate-x-1/2 bg-[#ee8434]" />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="relative overflow-hidden border border-white/10 bg-[#242426]">
                    <div className="pointer-events-none absolute right-0 top-0 h-24 w-24 border-b border-l border-[#ff729f]/20" />

                    <div className="pointer-events-none absolute bottom-0 left-0 h-16 w-16 border-r border-t border-[#ee8434]/20" />

                    {activeTab === "live" && (
                        <div className="grid lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
                            <div className="relative min-h-[420px] border-b border-white/10 lg:border-b-0 lg:border-r">
                                <RaceMap3D circuit={activeCircuit} />
                            </div>

                            <div className="min-w-0">
                                <LiveTiming
                                    data={liveData}
                                    loading={loading}
                                    error={error}
                                />
                            </div>
                        </div>
                    )}

                    {activeTab === "drivers" && (
                        <DriverStandings />
                    )}

                    {activeTab === "constructors" && (
                        <ConstructorStandings />
                    )}
                </div>
            </div>
        </section>
    );
}

function SeasonBadge({
    session,
    currentTime,
}: {
    session: F1LiveResponse["session"] | null;
    currentTime: number;
}): React.ReactElement {
    const isLive =
        session !== null &&
        new Date(session.dateStart).getTime() <= currentTime &&
        currentTime <= new Date(session.dateEnd).getTime();

    return (
        <div className="flex w-fit items-center gap-4 border border-white/10 bg-white/[0.04] px-5 py-4">
            <span
                className={[
                    "h-2.5 w-2.5 rounded-full",
                    isLive
                        ? "bg-[#ff729f] shadow-[0_0_12px_rgba(255,114,159,0.7)]"
                        : "bg-white/25",
                ].join(" ")}
            />

            <div>
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-white/35">
                    2026 Season
                </p>

                <p className="mt-1 text-xs font-black uppercase tracking-wider text-white">
                    {isLive ? "Session Live" : "Latest Session"}
                </p>
            </div>
        </div>
    );
}