"use client";

import { useEffect, useState } from "react";

import type {
    F1ConstructorStanding,
    F1ConstructorStandingsResponse,
} from "@/lib/f1/types";

export default function ConstructorStandings(): React.ReactElement {
    const [standings, setStandings] = useState<F1ConstructorStanding[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        async function loadStandings(): Promise<void> {
            try {
                setLoading(true);
                setError(null);

                const response = await fetch(
                    "/api/f1/constructors",
                );

                if (!response.ok) {
                    throw new Error(
                        "Failed to load constructor standings",
                    );
                }

                const data: F1ConstructorStandingsResponse =
                    await response.json();

                if (!cancelled) {
                    setStandings(data.standings);
                }
            } catch (err) {
                console.error(err);

                if (!cancelled) {
                    setError(
                        "Constructor championship data is currently unavailable.",
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        loadStandings();

        return () => {
            cancelled = true;
        };
    }, []);

    return (
        <div>
            <div className="border-b border-white/10 px-5 py-6 sm:px-8 sm:py-7">
                <div className="flex items-center gap-3">
                    <span className="h-2 w-2 bg-[#ee8434]" />

                    <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#ff729f]">
                        2026 Championship
                    </p>
                </div>

                <h3 className="mt-3 text-2xl font-black uppercase tracking-[-0.03em] sm:text-3xl">
                    Constructor Standings
                </h3>

                <p className="mt-2 max-w-xl text-sm leading-6 text-white/40">
                    The battle between Formula 1&apos;s teams for the
                    Constructors&apos; Championship.
                </p>
            </div>

            {loading && <LoadingState />}

            {!loading && error && (
                <ErrorState message={error} />
            )}

            {!loading && !error && standings.length === 0 && (
                <EmptyState />
            )}

            {!loading && !error && standings.length > 0 && (
                <div>
                    <div className="grid grid-cols-[48px_1fr_90px] items-center gap-3 border-b border-white/10 bg-black/[0.08] px-5 py-3 text-[9px] font-black uppercase tracking-[0.2em] text-white/25 sm:grid-cols-[55px_1fr_90px] sm:px-8">
                        <span>Pos</span>
                        <span>Constructor</span>

                        <span className="text-right">
                            Points
                        </span>
                    </div>

                    {standings.map((team) => (
                        <ConstructorRow
                            key={team.team}
                            team={team}
                        />
                    ))}

                    <div className="border-t border-white/10 px-5 py-4 sm:px-8">
                        <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-white/25">
                            {standings.length} constructors in championship
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}

function ConstructorRow({
    team,
}: {
    team: F1ConstructorStanding;
}): React.ReactElement {
    const isTopThree = team.position <= 3;

    return (
        <div className="group relative grid grid-cols-[48px_1fr_90px] items-center gap-3 border-b border-white/[0.06] px-5 py-5 transition-colors duration-200 hover:bg-white/[0.035] sm:grid-cols-[55px_1fr_90px] sm:px-8">
            <span
                className={[
                    "absolute bottom-0 left-0 top-0 w-[3px]",
                    team.position === 1
                        ? "bg-[#ff729f]"
                        : team.position === 2
                            ? "bg-[#ee8434]"
                            : "bg-white/10",
                ].join(" ")}
            />

            <div className="pl-1">
                <span
                    className={[
                        "text-lg font-black tracking-tight",
                        isTopThree
                            ? "text-[#ff729f]"
                            : "text-white/50",
                    ].join(" ")}
                >
                    {String(team.position).padStart(2, "0")}
                </span>
            </div>

            <div className="flex min-w-0 items-center gap-4">
                <TeamMark
                    team={team.team}
                    position={team.position}
                />

                <div className="min-w-0">
                    <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-black uppercase text-white sm:text-base">
                            {team.team}
                        </p>

                        {team.position === 1 && (
                            <span className="hidden border border-[#ff729f]/20 bg-[#ff729f]/5 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider text-[#ff729f] sm:inline-block">
                                P1
                            </span>
                        )}
                    </div>

                    <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.15em] text-white/25">
                        Constructor
                    </p>
                </div>
            </div>

            <div className="text-right">
                <p
                    className={[
                        "text-sm font-black tabular-nums sm:text-base",
                        isTopThree
                            ? "text-white"
                            : "text-white/75",
                    ].join(" ")}
                >
                    {team.points}
                </p>

                <p className="text-[9px] font-bold uppercase tracking-wider text-white/25">
                    PTS
                </p>
            </div>
        </div>
    );
}

function TeamMark({
    team,
    position,
}: {
    team: string;
    position: number;
}): React.ReactElement {
    const initials = team
        .split(" ")
        .map((word) => word[0])
        .join("")
        .slice(0, 2);

    return (
        <div
            className={[
                "flex h-10 w-10 shrink-0 items-center justify-center border text-[10px] font-black uppercase",
                position === 1
                    ? "border-[#ff729f]/40 bg-[#ff729f]/10 text-[#ff729f]"
                    : position === 2
                        ? "border-[#ee8434]/30 bg-[#ee8434]/5 text-[#ee8434]"
                        : "border-white/10 bg-white/[0.04] text-white/40",
            ].join(" ")}
        >
            {initials}
        </div>
    );
}

function LoadingState(): React.ReactElement {
    return (
        <div className="px-5 py-12 sm:px-8">
            <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((item) => (
                    <div
                        key={item}
                        className="flex items-center gap-4 border-b border-white/[0.06] px-2 py-5"
                    >
                        <div className="h-5 w-7 bg-white/[0.06]" />

                        <div className="h-10 w-10 bg-white/[0.06]" />

                        <div className="flex-1">
                            <div className="h-3 w-32 bg-white/[0.06]" />
                            <div className="mt-2 h-2 w-20 bg-white/[0.06]" />
                        </div>

                        <div className="h-3 w-12 bg-white/[0.06]" />
                    </div>
                ))}
            </div>

            <p className="mt-8 text-center text-xs font-bold uppercase tracking-[0.2em] text-white/25">
                Loading championship...
            </p>
        </div>
    );
}

function ErrorState({
    message,
}: {
    message: string;
}): React.ReactElement {
    return (
        <div className="px-5 py-12 sm:px-8">
            <div className="border border-[#ff729f]/20 bg-[#ff729f]/5 px-6 py-8 text-center">
                <p className="text-lg font-black uppercase">
                    Standings unavailable
                </p>

                <p className="mt-2 text-sm text-white/40">
                    {message}
                </p>
            </div>
        </div>
    );
}

function EmptyState(): React.ReactElement {
    return (
        <div className="px-5 py-16 text-center sm:px-8">
            <p className="text-xl font-black uppercase">
                No championship data
            </p>

            <p className="mt-2 text-sm text-white/40">
                Constructor standings are not currently available.
            </p>
        </div>
    );
}