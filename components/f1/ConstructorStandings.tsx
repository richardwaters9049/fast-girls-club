"use client";

import { useEffect, useMemo, useState } from "react";

import type {
    F1ConstructorStanding,
    F1ConstructorStandingsResponse,
} from "@/lib/f1/types";

const PAGE_SIZE = 10;

export default function ConstructorStandings(): React.ReactElement {
    const [standings, setStandings] = useState<F1ConstructorStanding[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        let cancelled = false;

        async function loadStandings(): Promise<void> {
            try {
                setLoading(true);
                setError(null);

                const response = await fetch("/api/f1/constructors");

                if (!response.ok) {
                    throw new Error(
                        "Failed to load constructor standings",
                    );
                }

                const data: F1ConstructorStandingsResponse =
                    await response.json();

                if (!cancelled) {
                    setStandings(data.standings);
                    setCurrentPage(1);
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

    const totalPages = Math.max(
        1,
        Math.ceil(standings.length / PAGE_SIZE),
    );

    const safeCurrentPage = Math.min(
        currentPage,
        totalPages,
    );

    const visibleStandings = useMemo(() => {
        const startIndex =
            (safeCurrentPage - 1) * PAGE_SIZE;

        return standings.slice(
            startIndex,
            startIndex + PAGE_SIZE,
        );
    }, [safeCurrentPage, standings]);

    const firstVisiblePosition =
        standings.length === 0
            ? 0
            : (safeCurrentPage - 1) * PAGE_SIZE + 1;

    const lastVisiblePosition = Math.min(
        safeCurrentPage * PAGE_SIZE,
        standings.length,
    );

    return (
        <div>
            <PanelHeader />

            {loading && <LoadingState />}

            {!loading && error && (
                <ErrorState message={error} />
            )}

            {!loading && !error && standings.length === 0 && (
                <EmptyState />
            )}

            {!loading &&
                !error &&
                standings.length > 0 && (
                    <div>
                        <div className="grid grid-cols-[42px_minmax(0,1fr)_82px] items-center gap-3 border-b border-white/10 bg-black/[0.08] px-5 py-3 text-[8px] font-black uppercase tracking-[0.22em] text-white/25 sm:grid-cols-[55px_minmax(0,1fr)_90px] sm:px-8">
                            <span>Pos</span>

                            <span>Constructor</span>

                            <span className="text-right">
                                Points
                            </span>
                        </div>

                        {visibleStandings.map((team) => (
                            <ConstructorRow
                                key={team.team}
                                team={team}
                            />
                        ))}

                        <div className="flex flex-col gap-4 border-t border-white/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8">
                            <p className="text-[8px] font-bold uppercase tracking-[0.18em] text-white/25">
                                Showing {firstVisiblePosition}–
                                {lastVisiblePosition} of{" "}
                                {standings.length} constructors
                            </p>

                            {totalPages > 1 && (
                                <Pagination
                                    currentPage={safeCurrentPage}
                                    totalPages={totalPages}
                                    onPrevious={() =>
                                        setCurrentPage((page) =>
                                            Math.max(
                                                page - 1,
                                                1,
                                            ),
                                        )
                                    }
                                    onNext={() =>
                                        setCurrentPage((page) =>
                                            Math.min(
                                                page + 1,
                                                totalPages,
                                            ),
                                        )
                                    }
                                />
                            )}
                        </div>
                    </div>
                )}
        </div>
    );
}

function PanelHeader(): React.ReactElement {
    return (
        <div className="border-b border-white/10 px-5 py-6 sm:px-8 sm:py-7">
            <div className="mb-3 flex items-center gap-3">
                <span className="h-2 w-2 bg-[#ee8434]" />

                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#ff729f]">
                    2026 Championship
                </p>
            </div>

            <h3 className="text-2xl font-black uppercase tracking-tight sm:text-3xl">
                Constructor Standings
            </h3>

            <p className="mt-2 max-w-xl text-sm leading-6 text-white/40">
                The battle between Formula 1&apos;s teams for the
                Constructors&apos; Championship.
            </p>
        </div>
    );
}

function ConstructorRow({
    team,
}: {
    team: F1ConstructorStanding;
}): React.ReactElement {
    const isLeader = team.position === 1;
    const isTopThree = team.position <= 3;

    return (
        <div
            className={[
                "group relative grid grid-cols-[42px_minmax(0,1fr)_82px] items-center gap-3 border-b border-white/[0.06] px-5 py-4 transition-colors duration-200 hover:bg-white/[0.04] sm:grid-cols-[55px_minmax(0,1fr)_90px] sm:px-8 sm:py-5",
                isLeader ? "bg-white/[0.025]" : "",
            ].join(" ")}
        >
            <span
                className={[
                    "absolute bottom-0 left-0 top-0 w-[3px] transition-opacity duration-200 group-hover:opacity-100",
                    isLeader
                        ? "bg-[#ff729f]"
                        : "bg-white/10 opacity-70",
                ].join(" ")}
            />

            {isLeader && (
                <span className="pointer-events-none absolute right-0 top-0 h-8 w-8 border-b border-l border-[#ff729f]/15" />
            )}

            <div className="pl-1">
                <span
                    className={[
                        "font-black tabular-nums tracking-tight",
                        isTopThree
                            ? "text-xl text-[#ff729f]"
                            : "text-lg text-white/45",
                    ].join(" ")}
                >
                    {String(team.position).padStart(2, "0")}
                </span>
            </div>

            <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                <TeamMark
                    team={team.team}
                    position={team.position}
                />

                <div className="min-w-0">
                    <div className="flex min-w-0 items-center gap-2">
                        <p
                            className={[
                                "truncate text-sm font-black uppercase tracking-tight sm:text-base",
                                isLeader
                                    ? "text-white"
                                    : "text-white/90",
                            ].join(" ")}
                        >
                            {team.team}
                        </p>

                        {isLeader && (
                            <span className="hidden border border-[#ee8434]/25 bg-[#ee8434]/5 px-1.5 py-0.5 text-[7px] font-black uppercase tracking-[0.16em] text-[#ee8434] sm:inline-block">
                                Leader
                            </span>
                        )}
                    </div>

                    <p className="mt-0.5 text-[8px] font-bold uppercase tracking-[0.18em] text-white/20 sm:text-[9px]">
                        Constructor
                    </p>
                </div>
            </div>

            <div className="text-right">
                <p
                    className={[
                        "text-sm font-black tabular-nums sm:text-base",
                        isLeader
                            ? "text-[#ff729f]"
                            : "text-white",
                    ].join(" ")}
                >
                    {team.points}
                </p>

                <p className="mt-0.5 text-[8px] font-bold uppercase tracking-[0.18em] text-white/20">
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
                "flex h-10 w-10 shrink-0 items-center justify-center border text-[10px] font-black uppercase transition-colors duration-200",
                position === 1
                    ? "border-[#ff729f]/40 bg-[#ff729f]/10 text-[#ff729f]"
                    : "border-white/10 bg-white/[0.04] text-white/40",
            ].join(" ")}
        >
            {initials}
        </div>
    );
}

function Pagination({
    currentPage,
    totalPages,
    onPrevious,
    onNext,
}: {
    currentPage: number;
    totalPages: number;
    onPrevious: () => void;
    onNext: () => void;
}): React.ReactElement {
    return (
        <div className="flex items-center gap-2">
            <button
                type="button"
                onClick={onPrevious}
                disabled={currentPage === 1}
                aria-label="Previous page"
                className="border border-white/10 px-3 py-2 text-[8px] font-black uppercase tracking-[0.16em] text-white/45 transition-colors hover:border-[#ff729f]/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-25"
            >
                Prev
            </button>

            <span className="min-w-12 text-center text-[8px] font-black tabular-nums text-white/45">
                {currentPage} / {totalPages}
            </span>

            <button
                type="button"
                onClick={onNext}
                disabled={currentPage === totalPages}
                aria-label="Next page"
                className="border border-white/10 px-3 py-2 text-[8px] font-black uppercase tracking-[0.16em] text-white/45 transition-colors hover:border-[#ff729f]/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-25"
            >
                Next
            </button>
        </div>
    );
}

function LoadingState(): React.ReactElement {
    return (
        <div className="px-5 py-12 sm:px-8">
            <div className="space-y-2">
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

            <p className="mt-8 text-center text-[9px] font-bold uppercase tracking-[0.22em] text-white/25">
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
                <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center border border-[#ff729f]/25 bg-[#ff729f]/5">
                    <span className="text-sm font-black text-[#ff729f]">
                        !
                    </span>
                </div>

                <p className="text-lg font-black uppercase tracking-[-0.02em]">
                    Standings unavailable
                </p>

                <p className="mt-2 text-sm leading-6 text-white/40">
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