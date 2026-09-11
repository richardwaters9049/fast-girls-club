"use client";

import Image from "next/image";
import {
    useMemo,
    useState,
} from "react";

import CategoryTag from "@/components/ui/CategoryTag";
import Pagination from "@/components/ui/Pagination";

import { countryCodeToEmoji } from "@/lib/f1/countries";
import type {
    F1Driver,
    F1LiveResponse,
} from "@/lib/f1/types";

const PAGE_SIZE = 5;

interface LiveTimingProps {
    data: F1LiveResponse | null;
    loading: boolean;
    error: string | null;
}

function DriverAvatar({
    driver,
}: {
    driver: F1Driver;
}): React.ReactElement {
    if (!driver.headshotUrl) {
        return (
            <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-xs font-black text-white/45"
                style={{
                    borderColor: driver.teamColour
                        ? `#${driver.teamColour}`
                        : undefined,
                }}
            >
                {driver.acronym.slice(
                    0,
                    2,
                )}
            </div>
        );
    }

    return (
        <div
            className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-white/10 bg-white/[0.05]"
            style={{
                borderColor: driver.teamColour
                    ? `#${driver.teamColour}`
                    : undefined,
            }}
        >
            <Image
                src={
                    driver.headshotUrl
                }
                alt={driver.name}
                fill
                sizes="40px"
                className="object-cover"
            />
        </div>
    );
}

function DriverRow({
    driver,
    isLeader,
}: {
    driver: F1Driver;
    isLeader: boolean;
}): React.ReactElement {
    return (
        <div
            className={`grid grid-cols-[2.5rem_2.5rem_1fr_auto] items-center gap-3 border-b border-white/5 px-4 py-3 last:border-b-0 md:grid-cols-[3rem_3rem_1fr_7rem_6rem] md:px-5 ${isLeader
                ? "bg-[#ff729f]/[0.06]"
                : "bg-transparent"
                }`}
        >
            <span
                className={`text-sm font-black ${isLeader
                    ? "text-[#ff729f]"
                    : "text-white/45"
                    }`}
            >
                {String(
                    driver.position,
                ).padStart(
                    2,
                    "0",
                )}
            </span>

            <DriverAvatar driver={driver} />

            <div className="min-w-0">
                <div className="flex min-w-0 items-center gap-2">
                    <span className="truncate text-sm font-bold text-white md:text-base">
                        {driver.name}
                    </span>

                    <span className="hidden text-[10px] font-black tracking-[0.12em] text-white/30 sm:inline">
                        {driver.acronym}
                    </span>
                </div>

                <div className="mt-1 flex items-center gap-2">
                    <span
                        className="h-1.5 w-1.5 shrink-0"
                        style={{
                            backgroundColor:
                                driver.teamColour
                                    ? `#${driver.teamColour}`
                                    : "#ffffff",
                        }}
                    />

                    <span className="truncate text-xs font-medium text-white/50">
                        {driver.team}
                    </span>
                </div>
            </div>

            <div className="hidden items-center gap-2 sm:flex">
                <span className="text-base">
                    {countryCodeToEmoji(
                        driver.countryCode,
                    )}
                </span>

                <span className="text-xs font-medium text-white/50">
                    {driver.nationality}
                </span>
            </div>

            <div className="text-right">
                <p className="text-sm font-bold text-white/85 md:text-base">
                    {driver.interval ??
                        driver.gapToLeader ??
                        "Leader"}
                </p>

                <p className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.14em] text-white/30">
                    {driver.fastestLap ??
                        "Position"}
                </p>
            </div>
        </div>
    );
}

function LoadingState(): React.ReactElement {
    return (
        <div className="border border-white/10 bg-white/[0.025] p-6">
            <div className="space-y-3">
                {Array.from({
                    length: 5,
                }).map(
                    (_, index) => (
                        <div
                            key={
                                index
                            }
                            className="h-16 animate-pulse bg-white/[0.04]"
                        />
                    ),
                )}
            </div>
        </div>
    );
}

function EmptyState(): React.ReactElement {
    return (
        <div className="flex h-full min-h-52 items-center justify-center border border-white/10 bg-white/[0.025] p-8 text-center">
            <div>
                <CategoryTag accent="white">
                    No timing
                </CategoryTag>

                <p className="mt-4 text-base font-semibold text-white/70">
                    No live driver data is
                    currently available.
                </p>

                <p className="mt-2 text-sm text-white/45">
                    The Grid will continue checking
                    for the next update.
                </p>
            </div>
        </div>
    );
}

function ErrorState({
    message,
}: {
    message: string;
}): React.ReactElement {
    return (
        <div className="flex h-full min-h-52 items-center justify-center border border-[#ff729f]/20 bg-[#ff729f]/[0.04] p-8 text-center">
            <div>
                <CategoryTag accent="pink">
                    Timing unavailable
                </CategoryTag>

                <p className="mt-4 text-base font-semibold text-white">
                    {message}
                </p>
            </div>
        </div>
    );
}

export default function LiveTiming({
    data,
    loading,
    error,
}: LiveTimingProps): React.ReactElement {
    const [
        currentPage,
        setCurrentPage,
    ] = useState(1);

    const drivers =
        data?.drivers ?? [];

    const totalPages =
        Math.max(
            1,
            Math.ceil(
                drivers.length /
                PAGE_SIZE,
            ),
        );

    const safeCurrentPage =
        Math.min(
            currentPage,
            totalPages,
        );

    const visibleDrivers =
        useMemo(
            () =>
                drivers.slice(
                    (safeCurrentPage -
                        1) *
                    PAGE_SIZE,
                    safeCurrentPage *
                    PAGE_SIZE,
                ),
            [
                drivers,
                safeCurrentPage,
            ],
        );

    if (
        loading &&
        !data
    ) {
        return <LoadingState />;
    }

    if (error && !data) {
        return (
            <ErrorState
                message={error}
            />
        );
    }

    if (
        !drivers.length
    ) {
        return <EmptyState />;
    }

    return (
        <div className="flex h-full flex-col overflow-hidden border border-white/10 bg-[#151515]">
            <div className="grid grid-cols-[2.5rem_1fr_auto] items-center gap-3 border-b border-white/10 bg-white/[0.035] px-4 py-3 md:grid-cols-[3rem_1fr_7rem_6rem] md:px-5">
                <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/45">
                    Pos
                </span>

                <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/45">
                    Driver
                </span>

                <span className="hidden text-[9px] font-bold uppercase tracking-[0.18em] text-white/45 md:block">
                    Nation
                </span>

                <span className="text-right text-[9px] font-bold uppercase tracking-[0.18em] text-white/45">
                    Gap
                </span>
            </div>

            <div className="min-h-0 flex-1 overflow-hidden">
                {visibleDrivers.map(
                    (
                        driver,
                        index,
                    ) => (
                        <DriverRow
                            key={`${driver.driverNumber}-${driver.acronym}`}
                            driver={
                                driver
                            }
                            isLeader={
                                driver.position ===
                                1 ||
                                (safeCurrentPage ===
                                    1 &&
                                    index ===
                                    0)
                            }
                        />
                    ),
                )}
            </div>

            <Pagination
                currentPage={
                    safeCurrentPage
                }
                totalPages={
                    totalPages
                }
                onPageChange={
                    setCurrentPage
                }
            />
        </div>
    );
}