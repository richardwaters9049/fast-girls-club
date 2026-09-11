"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

import { countryCodeToEmoji } from "@/lib/f1/countries";
import type {
    F1DriverStanding,
    F1DriverStandingsResponse,
} from "@/lib/f1/types";

const PAGE_SIZE = 10;

export default function DriverStandings(): React.ReactElement {
    const [standings, setStandings] = useState<F1DriverStanding[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        let cancelled = false;

        async function loadStandings(): Promise<void> {
            try {
                setLoading(true);
                setError(null);

                const response = await fetch("/api/f1/drivers");

                if (!response.ok) {
                    throw new Error(
                        "Failed to load driver standings",
                    );
                }

                const data: F1DriverStandingsResponse =
                    await response.json();

                if (!cancelled) {
                    setStandings(data.standings);
                    setCurrentPage(1);
                }
            } catch (err) {
                console.error(err);

                if (!cancelled) {
                    setError(
                        "Driver championship data is currently unavailable.",
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
            <PanelHeader
                eyebrow="2026 Championship"
                title="Driver Standings"
                description="The fight for the Formula 1 World Drivers&apos; Championship."
            />

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
                        <div className="grid grid-cols-[42px_minmax(0,1fr)_82px] items-center gap-3 border-b border-white/10 bg-black/[0.08] px-5 py-3 text-[8px] font-black uppercase tracking-[0.22em] text-white/25 sm:grid-cols-[55px_minmax(0,1fr)_150px_90px] sm:px-8">
                            <span>Pos</span>

                            <span>Driver</span>

                            <span className="hidden sm:block">
                                Team
                            </span>

                            <span className="text-right">
                                Points
                            </span>
                        </div>

                        {visibleStandings.map((driver) => (
                            <DriverRow
                                key={driver.driverNumber}
                                driver={driver}
                            />
                        ))}

                        <div className="flex flex-col gap-4 border-t border-white/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8">
                            <p className="text-[8px] font-bold uppercase tracking-[0.18em] text-white/25">
                                Showing {firstVisiblePosition}–
                                {lastVisiblePosition} of{" "}
                                {standings.length} drivers
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

function PanelHeader({
    eyebrow,
    title,
    description,
}: {
    eyebrow: string;
    title: string;
    description: string;
}): React.ReactElement {
    return (
        <div className="border-b border-white/10 px-5 py-6 sm:px-8 sm:py-7">
            <div className="mb-3 flex items-center gap-3">
                <span className="h-2 w-2 bg-[#ff729f]" />

                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#ff729f]">
                    {eyebrow}
                </p>
            </div>

            <h3 className="text-2xl font-black uppercase tracking-tight sm:text-3xl">
                {title}
            </h3>

            <p className="mt-2 max-w-xl text-sm leading-6 text-white/40">
                {description}
            </p>
        </div>
    );
}

function DriverRow({
    driver,
}: {
    driver: F1DriverStanding;
}): React.ReactElement {
    const isLeader = driver.position === 1;
    const isTopThree = driver.position <= 3;

    return (
        <div
            className={[
                "group relative grid grid-cols-[42px_minmax(0,1fr)_82px] items-center gap-3 border-b border-white/[0.06] px-5 py-4 transition-colors duration-200 hover:bg-white/[0.04] sm:grid-cols-[55px_minmax(0,1fr)_150px_90px] sm:px-8 sm:py-5",
                isLeader ? "bg-white/[0.025]" : "",
            ].join(" ")}
        >
            <span
                className="absolute bottom-0 left-0 top-0 w-[3px] opacity-70 transition-opacity duration-200 group-hover:opacity-100"
                style={{
                    backgroundColor: `#${driver.teamColour}`,
                }}
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
                    {String(driver.position).padStart(2, "0")}
                </span>
            </div>

            <div className="flex min-w-0 items-center gap-3">
                <DriverImage driver={driver} />

                <div className="min-w-0">
                    <div className="flex min-w-0 items-center gap-2">
                        <CountryFlag
                            countryCode={driver.countryCode}
                        />

                        <span className="text-xs font-black uppercase tracking-[0.12em] text-[#ff729f]">
                            {driver.acronym}
                        </span>

                        {isLeader && (
                            <span className="hidden border border-[#ee8434]/25 bg-[#ee8434]/5 px-1.5 py-0.5 text-[7px] font-black uppercase tracking-[0.16em] text-[#ee8434] sm:inline-block">
                                Leader
                            </span>
                        )}

                        {!isLeader &&
                            isTopThree && (
                                <span className="hidden bg-white/10 px-1.5 py-0.5 text-[7px] font-black uppercase tracking-[0.16em] text-white/40 sm:inline-block">
                                    Top 3
                                </span>
                            )}
                    </div>

                    <p className="mt-0.5 truncate text-sm font-black uppercase tracking-tight text-white sm:text-base">
                        {driver.driver}
                    </p>

                    <p className="truncate text-[9px] font-bold uppercase tracking-[0.14em] text-white/25 sm:hidden">
                        {driver.team}
                    </p>
                </div>
            </div>

            <div className="hidden min-w-0 sm:block">
                <p className="truncate text-xs font-bold uppercase tracking-[0.1em] text-white/50">
                    {driver.team}
                </p>
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
                    {driver.points}
                </p>

                <p className="mt-0.5 text-[8px] font-bold uppercase tracking-[0.18em] text-white/20">
                    PTS
                </p>
            </div>
        </div>
    );
}

function DriverImage({
    driver,
}: {
    driver: F1DriverStanding;
}): React.ReactElement {
    if (driver.headshotUrl) {
        return (
            <div className="relative hidden h-10 w-10 shrink-0 overflow-hidden border border-white/10 bg-white/[0.06] sm:block">
                <Image
                    src={driver.headshotUrl}
                    alt={driver.driver}
                    fill
                    sizes="40px"
                    className="object-cover object-top grayscale-[15%] transition-all duration-300 group-hover:scale-105 group-hover:grayscale-0"
                />
            </div>
        );
    }

    return (
        <div className="hidden h-10 w-10 shrink-0 items-center justify-center border border-white/10 bg-white/[0.06] sm:flex">
            <span className="text-[10px] font-black text-white/30">
                {driver.acronym}
            </span>
        </div>
    );
}

function CountryFlag({
    countryCode,
}: {
    countryCode: string;
}): React.ReactElement {
    const emoji = countryCodeToEmoji(countryCode);

    return (
        <span
            className="text-sm leading-none"
            role="img"
            aria-label={countryCode}
        >
            {emoji}
        </span>
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
                            <div className="h-2 w-24 bg-white/[0.06]" />

                            <div className="mt-2 h-3 w-40 bg-white/[0.06]" />
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
                Driver standings are not currently available.
            </p>
        </div>
    );
}