"use client";

import Image from "next/image";

import type {
    F1Driver,
    F1LiveResponse,
} from "@/lib/f1/types";

interface LiveTimingProps {
    data: F1LiveResponse | null;
    loading: boolean;
    error: string | null;
}

export default function LiveTiming({
    data,
    loading,
    error,
}: LiveTimingProps): React.ReactElement {
    const session = data?.session ?? null;
    const drivers = data?.drivers ?? [];
    const isLive = data?.isLive ?? false;

    return (
        <div>
            <div className="border-b border-white/10 px-5 py-6 sm:px-8 sm:py-7">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <div className="mb-3 flex items-center gap-3">
                            <span
                                className={[
                                    "h-2 w-2 rounded-full",
                                    isLive
                                        ? "bg-[#ff729f]"
                                        : "bg-white/25",
                                ].join(" ")}
                            />

                            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-white/40">
                                {isLive
                                    ? "Live Timing"
                                    : "Last Session"}
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <h3 className="text-2xl font-black uppercase tracking-tight sm:text-3xl">
                                {session?.circuitName ??
                                    "Formula 1"}
                            </h3>

                            {session && (
                                <CountryFlag
                                    countryCode={
                                        session.countryCode
                                    }
                                />
                            )}
                        </div>

                        {session && (
                            <p className="mt-2 text-xs font-bold uppercase tracking-wider text-white/35">
                                {session.location},{" "}
                                {session.countryName}
                            </p>
                        )}
                    </div>

                    {session && (
                        <SessionInfo
                            session={session}
                            isLive={isLive}
                        />
                    )}
                </div>
            </div>

            {loading && <LoadingState />}

            {!loading && error && (
                <ErrorState message={error} />
            )}

            {!loading && !error && !session && (
                <EmptyState />
            )}

            {!loading && !error && session && (
                <TimingTable
                    drivers={drivers}
                    isLive={isLive}
                />
            )}
        </div>
    );
}

function SessionInfo({
    session,
    isLive,
}: {
    session: NonNullable<F1LiveResponse["session"]>;
    isLive: boolean;
}): React.ReactElement {
    return (
        <div className="grid grid-cols-2 border border-white/10 bg-white/[0.03]">
            <div className="border-r border-white/10 px-5 py-4">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30">
                    Session
                </p>

                <p className="mt-1 text-xs font-black uppercase text-white">
                    {session.sessionName}
                </p>
            </div>

            <div className="px-5 py-4">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30">
                    Status
                </p>

                <p
                    className={[
                        "mt-1 text-xs font-black uppercase",
                        isLive
                            ? "text-[#ff729f]"
                            : "text-white/55",
                    ].join(" ")}
                >
                    {isLive ? "Live" : "Completed"}
                </p>
            </div>
        </div>
    );
}

function TimingTable({
    drivers,
    isLive,
}: {
    drivers: F1Driver[];
    isLive: boolean;
}): React.ReactElement {
    if (drivers.length === 0) {
        return (
            <div className="px-5 py-16 text-center sm:px-8">
                <p className="text-xl font-black uppercase">
                    No timing data
                </p>

                <p className="mt-2 text-sm text-white/40">
                    Timing information is not currently available.
                </p>
            </div>
        );
    }

    return (
        <div>
            <div className="grid grid-cols-[42px_1fr_90px] items-center gap-3 border-b border-white/10 px-5 py-3 text-[9px] font-black uppercase tracking-[0.2em] text-white/25 sm:grid-cols-[55px_1fr_140px_120px_120px] sm:px-8">
                <span>Pos</span>
                <span>Driver</span>
                <span className="hidden sm:block">
                    Team
                </span>
                <span className="hidden sm:block">
                    Gap
                </span>
                <span className="text-right">
                    Fastest
                </span>
            </div>

            {drivers.map((driver) => (
                <DriverRow
                    key={driver.driverNumber}
                    driver={driver}
                    isLive={isLive}
                />
            ))}

            <div className="border-t border-white/10 px-5 py-4 sm:px-8">
                <div className="flex flex-col gap-2 text-[9px] font-bold uppercase tracking-[0.15em] text-white/25 sm:flex-row sm:items-center sm:justify-between">
                    <span>
                        {drivers.length} drivers
                    </span>

                    <span>
                        {isLive
                            ? "Live session data"
                            : "Latest available race data"}
                    </span>
                </div>
            </div>
        </div>
    );
}

function DriverRow({
    driver,
    isLive,
}: {
    driver: F1Driver;
    isLive: boolean;
}): React.ReactElement {
    return (
        <div className="group relative grid grid-cols-[42px_1fr_90px] items-center gap-3 border-b border-white/[0.06] px-5 py-4 transition-colors duration-200 hover:bg-white/[0.035] sm:grid-cols-[55px_1fr_140px_120px_120px] sm:px-8">
            <span
                className="absolute bottom-0 left-0 top-0 w-[3px]"
                style={{
                    backgroundColor: `#${driver.teamColour}`,
                }}
            />

            <div className="pl-1">
                <span
                    className={[
                        "text-lg font-black tracking-tight",
                        driver.position <= 3
                            ? "text-[#ff729f]"
                            : "text-white/50",
                    ].join(" ")}
                >
                    {String(driver.position).padStart(
                        2,
                        "0",
                    )}
                </span>
            </div>

            <div className="flex min-w-0 items-center gap-3">
                <DriverImage driver={driver} />

                <div className="min-w-0">
                    <div className="flex items-center gap-2">
                        <CountryFlag
                            countryCode={
                                driver.countryCode
                            }
                        />

                        <span className="text-[10px] font-black uppercase tracking-wider text-[#ff729f]">
                            {driver.acronym}
                        </span>
                    </div>

                    <p className="truncate text-sm font-black uppercase text-white sm:text-base">
                        {driver.name}
                    </p>

                    <p className="truncate text-[10px] font-bold uppercase tracking-wider text-white/30 sm:hidden">
                        {driver.team}
                    </p>
                </div>
            </div>

            <div className="hidden min-w-0 sm:block">
                <p className="truncate text-xs font-bold uppercase tracking-wider text-white/50">
                    {driver.team}
                </p>
            </div>

            <div className="hidden sm:block">
                <GapDisplay
                    driver={driver}
                    isLive={isLive}
                />
            </div>

            <div className="text-right">
                {driver.fastestLap ? (
                    <div>
                        <p className="text-xs font-black tabular-nums text-white">
                            {driver.fastestLap}
                        </p>

                        <p className="mt-1 text-[8px] font-bold uppercase tracking-wider text-white/25">
                            Lap
                        </p>
                    </div>
                ) : (
                    <span className="text-xs text-white/25">
                        —
                    </span>
                )}
            </div>
        </div>
    );
}

function GapDisplay({
    driver,
    isLive,
}: {
    driver: F1Driver;
    isLive: boolean;
}): React.ReactElement {
    if (
        driver.position === 1 ||
        driver.gapToLeader === "LEADER"
    ) {
        return (
            <span className="text-[10px] font-black uppercase tracking-wider text-[#ff729f]">
                Leader
            </span>
        );
    }

    if (driver.dsq) {
        return (
            <span className="text-[10px] font-black uppercase tracking-wider text-[#ee8434]">
                DSQ
            </span>
        );
    }

    if (driver.dnf) {
        return (
            <span className="text-[10px] font-black uppercase tracking-wider text-[#ee8434]">
                DNF
            </span>
        );
    }

    if (driver.gapToLeader) {
        return (
            <span className="text-xs font-bold tabular-nums text-white/55">
                {driver.gapToLeader}
            </span>
        );
    }

    if (isLive && driver.interval) {
        return (
            <span className="text-xs font-bold tabular-nums text-white/55">
                {driver.interval}
            </span>
        );
    }

    return (
        <span className="text-xs text-white/25">
            —
        </span>
    );
}

function DriverImage({
    driver,
}: {
    driver: F1Driver;
}): React.ReactElement {
    if (driver.headshotUrl) {
        return (
            <div className="relative hidden h-10 w-10 shrink-0 overflow-hidden bg-white/[0.06] sm:block">
                <Image
                    src={driver.headshotUrl}
                    alt={driver.name}
                    fill
                    sizes="40px"
                    className="object-cover object-top"
                />
            </div>
        );
    }

    return (
        <div className="hidden h-10 w-10 shrink-0 items-center justify-center bg-white/[0.06] sm:flex">
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

function countryCodeToEmoji(countryCode: string): string {
    if (!countryCode || countryCode.length !== 3) {
        return "🏁";
    }

    const codes: Record<string, string> = {
        AUS: "🇦🇺",
        AUT: "🇦🇹",
        BEL: "🇧🇪",
        BRA: "🇧🇷",
        CAN: "🇨🇦",
        CHE: "🇨🇭",
        CHN: "🇨🇳",
        DEU: "🇩🇪",
        ESP: "🇪🇸",
        FRA: "🇫🇷",
        GBR: "🇬🇧",
        HUN: "🇭🇺",
        ITA: "🇮🇹",
        JPN: "🇯🇵",
        MEX: "🇲🇽",
        MCO: "🇲🇨",
        NLD: "🇳🇱",
        NZL: "🇳🇿",
        PRT: "🇵🇹",
        SGP: "🇸🇬",
        THA: "🇹🇭",
        USA: "🇺🇸",
    };

    return codes[countryCode] ?? "🏁";
}

function LoadingState(): React.ReactElement {
    return (
        <div className="px-5 py-12 sm:px-8">
            <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((item) => (
                    <div
                        key={item}
                        className="flex items-center gap-4 border-b border-white/[0.06] px-2 py-4"
                    >
                        <div className="h-5 w-7 bg-white/[0.06]" />
                        <div className="h-10 w-10 bg-white/[0.06]" />

                        <div className="flex-1">
                            <div className="h-2 w-24 bg-white/[0.06]" />
                            <div className="mt-2 h-3 w-40 bg-white/[0.06]" />
                        </div>

                        <div className="h-3 w-16 bg-white/[0.06]" />
                    </div>
                ))}
            </div>

            <p className="mt-8 text-center text-xs font-bold uppercase tracking-[0.2em] text-white/25">
                Loading F1 data...
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
                    Timing unavailable
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
                No F1 session
            </p>

            <p className="mt-2 text-sm text-white/40">
                There is currently no Formula 1 session available.
            </p>
        </div>
    );
}