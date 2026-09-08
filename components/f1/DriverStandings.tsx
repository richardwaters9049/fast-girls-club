"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import type {
    F1DriverStanding,
    F1DriverStandingsResponse,
} from "@/lib/f1/types";

export default function DriverStandings(): React.ReactElement {
    const [standings, setStandings] = useState<F1DriverStanding[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        async function loadStandings(): Promise<void> {
            try {
                setLoading(true);
                setError(null);

                const response = await fetch("/api/f1/drivers");

                if (!response.ok) {
                    throw new Error("Failed to load driver standings");
                }

                const data: F1DriverStandingsResponse =
                    await response.json();

                if (!cancelled) {
                    setStandings(data.standings);
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

    return (
        <div>
            <PanelHeader
                eyebrow="2026 Championship"
                title="Driver Standings"
                description="The fight for the Formula 1 World Drivers' Championship."
            />

            {loading && <LoadingState />}

            {!loading && error && <ErrorState message={error} />}

            {!loading && !error && standings.length === 0 && (
                <EmptyState />
            )}

            {!loading && !error && standings.length > 0 && (
                <div>
                    <div className="grid grid-cols-[48px_1fr_90px] items-center gap-3 border-b border-white/10 px-5 py-3 text-[9px] font-black uppercase tracking-[0.2em] text-white/25 sm:grid-cols-[55px_1fr_150px_90px] sm:px-8">
                        <span>Pos</span>
                        <span>Driver</span>
                        <span className="hidden sm:block">Team</span>
                        <span className="text-right">Points</span>
                    </div>

                    {standings.map((driver) => (
                        <DriverRow
                            key={driver.driverNumber}
                            driver={driver}
                        />
                    ))}

                    <div className="border-t border-white/10 px-5 py-4 sm:px-8">
                        <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-white/25">
                            {standings.length} drivers in championship
                        </p>
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
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#ff729f]">
                {eyebrow}
            </p>

            <h3 className="mt-2 text-2xl font-black uppercase tracking-tight sm:text-3xl">
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
    return (
        <div className="group relative grid grid-cols-[48px_1fr_90px] items-center gap-3 border-b border-white/[0.06] px-5 py-4 transition-colors duration-200 hover:bg-white/[0.035] sm:grid-cols-[55px_1fr_150px_90px] sm:px-8">
            <span
                className="absolute bottom-0 left-0 top-0 w-[3px] opacity-70"
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
                    {String(driver.position).padStart(2, "0")}
                </span>
            </div>

            <div className="flex min-w-0 items-center gap-3">
                <DriverImage driver={driver} />

                <div className="min-w-0">
                    <div className="flex items-center gap-2">
                        <CountryFlag
                            countryCode={driver.countryCode}
                        />

                        <span className="text-xs font-black uppercase tracking-wider text-[#ff729f]">
                            {driver.acronym}
                        </span>

                        {driver.position <= 3 && (
                            <span className="hidden bg-white/10 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider text-white/50 sm:inline-block">
                                Top 3
                            </span>
                        )}
                    </div>

                    <p className="truncate text-sm font-black uppercase text-white sm:text-base">
                        {driver.driver}
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

            <div className="text-right">
                <p className="text-sm font-black tabular-nums text-white sm:text-base">
                    {driver.points}
                </p>

                <p className="text-[9px] font-bold uppercase tracking-wider text-white/25">
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
            <div className="relative hidden h-10 w-10 shrink-0 overflow-hidden bg-white/[0.06] sm:block">
                <Image
                    src={driver.headshotUrl}
                    alt={driver.driver}
                    fill
                    sizes="40px"
                    className="object-cover object-top grayscale-[15%] transition-all duration-300 group-hover:grayscale-0"
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
                Driver standings are not currently available.
            </p>
        </div>
    );
}