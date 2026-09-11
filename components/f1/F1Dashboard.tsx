"use client";

import { useEffect, useMemo, useState } from "react";

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import AnimatedLink from "@/components/ui/AnimatedLink";
import AnimatedSection from "@/components/ui/AnimatedSection";
import CategoryTag from "@/components/ui/CategoryTag";
import Container from "@/components/ui/Container";
import { Button } from "@/components/ui/button";
import Pagination from "@/components/ui/Pagination";
import SectionHeading from "@/components/ui/SectionHeading";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import ConstructorStandings from "./ConstructorStandings";
import DriverStandings from "./DriverStandings";
import LiveTiming from "./LiveTiming";

import { countryCodeToEmoji } from "@/lib/f1/countries";
import type { F1LiveResponse } from "@/lib/f1/types";

type Series = "f1" | "f2" | "f3";
type CalendarFilter = "all" | "completed" | "upcoming";

interface Race {
    round: number;
    name: string;
    circuit: string;
    location: string;
    country: string;
    countryCode: string;
    startDate: string;
    endDate: string;
}

const CALENDAR_PAGE_SIZE = 6;

const f1Calendar: Race[] = [
    {
        round: 1,
        name: "Australian Grand Prix",
        circuit: "Albert Park Circuit",
        location: "Melbourne",
        country: "Australia",
        countryCode: "AU",
        startDate: "2026-03-06",
        endDate: "2026-03-08",
    },
    {
        round: 2,
        name: "Chinese Grand Prix",
        circuit: "Shanghai International Circuit",
        location: "Shanghai",
        country: "China",
        countryCode: "CN",
        startDate: "2026-03-13",
        endDate: "2026-03-15",
    },
    {
        round: 3,
        name: "Japanese Grand Prix",
        circuit: "Suzuka Circuit",
        location: "Suzuka",
        country: "Japan",
        countryCode: "JP",
        startDate: "2026-03-27",
        endDate: "2026-03-29",
    },
    {
        round: 4,
        name: "Bahrain Grand Prix",
        circuit: "Bahrain International Circuit",
        location: "Sakhir",
        country: "Bahrain",
        countryCode: "BH",
        startDate: "2026-04-10",
        endDate: "2026-04-12",
    },
    {
        round: 5,
        name: "Saudi Arabian Grand Prix",
        circuit: "Jeddah Corniche Circuit",
        location: "Jeddah",
        country: "Saudi Arabia",
        countryCode: "SA",
        startDate: "2026-04-17",
        endDate: "2026-04-19",
    },
    {
        round: 6,
        name: "Miami Grand Prix",
        circuit: "Miami International Autodrome",
        location: "Miami",
        country: "United States",
        countryCode: "US",
        startDate: "2026-05-01",
        endDate: "2026-05-03",
    },
    {
        round: 7,
        name: "Emilia-Romagna Grand Prix",
        circuit: "Imola Circuit",
        location: "Imola",
        country: "Italy",
        countryCode: "IT",
        startDate: "2026-05-22",
        endDate: "2026-05-24",
    },
    {
        round: 8,
        name: "Monaco Grand Prix",
        circuit: "Circuit de Monaco",
        location: "Monte Carlo",
        country: "Monaco",
        countryCode: "MC",
        startDate: "2026-06-04",
        endDate: "2026-06-07",
    },
    {
        round: 9,
        name: "Spanish Grand Prix",
        circuit: "Circuit de Barcelona-Catalunya",
        location: "Barcelona",
        country: "Spain",
        countryCode: "ES",
        startDate: "2026-06-12",
        endDate: "2026-06-14",
    },
    {
        round: 10,
        name: "Canadian Grand Prix",
        circuit: "Circuit Gilles-Villeneuve",
        location: "Montreal",
        country: "Canada",
        countryCode: "CA",
        startDate: "2026-06-26",
        endDate: "2026-06-28",
    },
    {
        round: 11,
        name: "Austrian Grand Prix",
        circuit: "Red Bull Ring",
        location: "Spielberg",
        country: "Austria",
        countryCode: "AT",
        startDate: "2026-07-03",
        endDate: "2026-07-05",
    },
    {
        round: 12,
        name: "British Grand Prix",
        circuit: "Silverstone Circuit",
        location: "Silverstone",
        country: "United Kingdom",
        countryCode: "GB",
        startDate: "2026-07-17",
        endDate: "2026-07-19",
    },
    {
        round: 13,
        name: "Belgian Grand Prix",
        circuit: "Circuit de Spa-Francorchamps",
        location: "Spa",
        country: "Belgium",
        countryCode: "BE",
        startDate: "2026-07-24",
        endDate: "2026-07-26",
    },
    {
        round: 14,
        name: "Hungarian Grand Prix",
        circuit: "Hungaroring",
        location: "Mogyoród",
        country: "Hungary",
        countryCode: "HU",
        startDate: "2026-07-31",
        endDate: "2026-08-02",
    },
    {
        round: 15,
        name: "Dutch Grand Prix",
        circuit: "Circuit Zandvoort",
        location: "Zandvoort",
        country: "Netherlands",
        countryCode: "NL",
        startDate: "2026-08-21",
        endDate: "2026-08-23",
    },
    {
        round: 16,
        name: "Italian Grand Prix",
        circuit: "Monza Circuit",
        location: "Monza",
        country: "Italy",
        countryCode: "IT",
        startDate: "2026-09-04",
        endDate: "2026-09-06",
    },
    {
        round: 17,
        name: "Azerbaijan Grand Prix",
        circuit: "Baku City Circuit",
        location: "Baku",
        country: "Azerbaijan",
        countryCode: "AZ",
        startDate: "2026-09-18",
        endDate: "2026-09-20",
    },
    {
        round: 18,
        name: "Singapore Grand Prix",
        circuit: "Marina Bay Street Circuit",
        location: "Singapore",
        country: "Singapore",
        countryCode: "SG",
        startDate: "2026-10-09",
        endDate: "2026-10-11",
    },
    {
        round: 19,
        name: "United States Grand Prix",
        circuit: "Circuit of the Americas",
        location: "Austin",
        country: "United States",
        countryCode: "US",
        startDate: "2026-10-23",
        endDate: "2026-10-25",
    },
    {
        round: 20,
        name: "Mexico City Grand Prix",
        circuit: "Autódromo Hermanos Rodríguez",
        location: "Mexico City",
        country: "Mexico",
        countryCode: "MX",
        startDate: "2026-10-30",
        endDate: "2026-11-01",
    },
    {
        round: 21,
        name: "São Paulo Grand Prix",
        circuit: "Interlagos Circuit",
        location: "São Paulo",
        country: "Brazil",
        countryCode: "BR",
        startDate: "2026-11-06",
        endDate: "2026-11-08",
    },
    {
        round: 22,
        name: "Las Vegas Grand Prix",
        circuit: "Las Vegas Street Circuit",
        location: "Las Vegas",
        country: "United States",
        countryCode: "US",
        startDate: "2026-11-19",
        endDate: "2026-11-21",
    },
    {
        round: 23,
        name: "Qatar Grand Prix",
        circuit: "Lusail International Circuit",
        location: "Lusail",
        country: "Qatar",
        countryCode: "QA",
        startDate: "2026-11-27",
        endDate: "2026-11-29",
    },
    {
        round: 24,
        name: "Abu Dhabi Grand Prix",
        circuit: "Yas Marina Circuit",
        location: "Abu Dhabi",
        country: "United Arab Emirates",
        countryCode: "AE",
        startDate: "2026-12-04",
        endDate: "2026-12-06",
    },
];

const f2Calendar: Race[] = [
    {
        round: 1,
        name: "Australian Grand Prix",
        circuit: "Albert Park Circuit",
        location: "Melbourne",
        country: "Australia",
        countryCode: "AU",
        startDate: "2026-03-06",
        endDate: "2026-03-08",
    },
    {
        round: 2,
        name: "Miami Grand Prix",
        circuit: "Miami International Autodrome",
        location: "Miami",
        country: "United States",
        countryCode: "US",
        startDate: "2026-05-01",
        endDate: "2026-05-03",
    },
    {
        round: 3,
        name: "Canadian Grand Prix",
        circuit: "Circuit Gilles-Villeneuve",
        location: "Montreal",
        country: "Canada",
        countryCode: "CA",
        startDate: "2026-05-22",
        endDate: "2026-05-24",
    },
    {
        round: 4,
        name: "Monaco Grand Prix",
        circuit: "Circuit de Monaco",
        location: "Monte Carlo",
        country: "Monaco",
        countryCode: "MC",
        startDate: "2026-06-04",
        endDate: "2026-06-07",
    },
    {
        round: 5,
        name: "Spanish Grand Prix",
        circuit: "Circuit de Barcelona-Catalunya",
        location: "Barcelona",
        country: "Spain",
        countryCode: "ES",
        startDate: "2026-06-12",
        endDate: "2026-06-14",
    },
    {
        round: 6,
        name: "Austrian Grand Prix",
        circuit: "Red Bull Ring",
        location: "Spielberg",
        country: "Austria",
        countryCode: "AT",
        startDate: "2026-06-26",
        endDate: "2026-06-28",
    },
    {
        round: 7,
        name: "British Grand Prix",
        circuit: "Silverstone Circuit",
        location: "Silverstone",
        country: "United Kingdom",
        countryCode: "GB",
        startDate: "2026-07-03",
        endDate: "2026-07-05",
    },
    {
        round: 8,
        name: "Belgian Grand Prix",
        circuit: "Circuit de Spa-Francorchamps",
        location: "Spa",
        country: "Belgium",
        countryCode: "BE",
        startDate: "2026-07-17",
        endDate: "2026-07-19",
    },
    {
        round: 9,
        name: "Hungarian Grand Prix",
        circuit: "Hungaroring",
        location: "Mogyoród",
        country: "Hungary",
        countryCode: "HU",
        startDate: "2026-07-24",
        endDate: "2026-07-26",
    },
    {
        round: 10,
        name: "Italian Grand Prix",
        circuit: "Monza Circuit",
        location: "Monza",
        country: "Italy",
        countryCode: "IT",
        startDate: "2026-09-04",
        endDate: "2026-09-06",
    },
    {
        round: 11,
        name: "Madrid Grand Prix",
        circuit: "Madrid Street Circuit",
        location: "Madrid",
        country: "Spain",
        countryCode: "ES",
        startDate: "2026-09-11",
        endDate: "2026-09-13",
    },
    {
        round: 12,
        name: "Azerbaijan Grand Prix",
        circuit: "Baku City Circuit",
        location: "Baku",
        country: "Azerbaijan",
        countryCode: "AZ",
        startDate: "2026-09-25",
        endDate: "2026-09-27",
    },
    {
        round: 13,
        name: "Qatar Grand Prix",
        circuit: "Lusail International Circuit",
        location: "Lusail",
        country: "Qatar",
        countryCode: "QA",
        startDate: "2026-11-27",
        endDate: "2026-11-29",
    },
    {
        round: 14,
        name: "Abu Dhabi Grand Prix",
        circuit: "Yas Marina Circuit",
        location: "Abu Dhabi",
        country: "United Arab Emirates",
        countryCode: "AE",
        startDate: "2026-12-04",
        endDate: "2026-12-06",
    },
];

const f3Calendar: Race[] = [
    ...f2Calendar,
];

const seriesData: Record<
    Series,
    {
        label: string;
        fullLabel: string;
        calendar: Race[];
    }
> = {
    f1: {
        label: "F1",
        fullLabel: "Formula 1",
        calendar: f1Calendar,
    },
    f2: {
        label: "F2",
        fullLabel: "Formula 2",
        calendar: f2Calendar,
    },
    f3: {
        label: "F3",
        fullLabel: "Formula 3",
        calendar: f3Calendar,
    },
};

function formatRaceDate(race: Race): string {
    const start = new Date(`${race.startDate}T12:00:00`);
    const end = new Date(`${race.endDate}T12:00:00`);

    const startMonth = start.toLocaleDateString(
        "en-GB",
        {
            month: "short",
        },
    );

    const endMonth = end.toLocaleDateString(
        "en-GB",
        {
            month: "short",
        },
    );

    if (startMonth === endMonth) {
        return `${start.getDate()}–${end.getDate()} ${endMonth}`;
    }

    return `${start.getDate()} ${startMonth}–${end.getDate()} ${endMonth}`;
}

function getRaceStatus(
    race: Race,
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

function RaceFlag({
    countryCode,
}: {
    countryCode: string;
}): React.ReactElement {
    return (
        <span
            aria-hidden="true"
            className="text-xl"
        >
            {countryCodeToEmoji(countryCode)}
        </span>
    );
}

function StatCard({
    label,
    value,
    detail,
    accent = false,
}: {
    label: string;
    value: string;
    detail: string;
    accent?: boolean;
}): React.ReactElement {
    return (
        <article
            className={`relative overflow-hidden border p-5 ${accent
                ? "border-[#ff729f]/30 bg-[#ff729f]/[0.06]"
                : "border-white/10 bg-white/[0.035]"
                }`}
        >
            <div
                className={`absolute left-0 top-0 h-0.5 w-10 ${accent
                    ? "bg-[#ff729f]"
                    : "bg-white/20"
                    }`}
            />

            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/55">
                {label}
            </p>

            <p className="mt-3 text-3xl font-black tracking-[-0.04em] text-white md:text-4xl">
                {value}
            </p>

            <p className="mt-2 text-sm font-medium text-white/55">
                {detail}
            </p>
        </article>
    );
}

interface RaceFocusProps {
    race: Race | null;
    previousRace: Race | null;
    nextRace: Race | null;
    now: number;
}

function RaceFocus({
    race,
    previousRace,
    nextRace,
    now,
}: RaceFocusProps): React.ReactElement {
    if (!race) {
        return (
            <section className="border border-white/10 bg-white/[0.03] p-7">
                <p className="text-base text-white/70">
                    No race data is currently available.
                </p>
            </section>
        );
    }

    const status = getRaceStatus(
        race,
        now,
    );

    return (
        <section className="overflow-hidden border border-white/10 bg-[#151515]">
            <div className="grid lg:grid-cols-[1.55fr_0.45fr]">
                <div className="relative overflow-hidden border-b border-white/10 p-6 md:p-8 lg:border-b-0 lg:border-r lg:p-10">
                    <div className="pointer-events-none absolute right-[-8rem] top-[-8rem] h-[22rem] w-[22rem] rounded-full bg-[#ff729f]/[0.08] blur-3xl" />

                    <div className="relative">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div className="flex flex-wrap items-center gap-3">
                                <CategoryTag accent="white">
                                    Round {race.round}
                                </CategoryTag>

                                <span className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.12em] text-white/65">
                                    <RaceFlag
                                        countryCode={
                                            race.countryCode
                                        }
                                    />

                                    {race.country}
                                </span>
                            </div>

                            <CategoryTag
                                accent={
                                    status === "next"
                                        ? "pink"
                                        : "white"
                                }
                            >
                                {status === "next"
                                    ? "Race Weekend"
                                    : status === "completed"
                                        ? "Completed"
                                        : "Upcoming"}
                            </CategoryTag>
                        </div>

                        <div className="mt-10">
                            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-white/45">
                                {race.location}
                            </p>

                            <h2 className="mt-3 max-w-3xl text-4xl font-black uppercase leading-[0.92] tracking-[-0.055em] text-white md:text-6xl">
                                {race.name}
                                <span className="text-[#ff729f]">
                                    .
                                </span>
                            </h2>

                            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2">
                                <span className="text-base font-medium text-white/70">
                                    {race.circuit}
                                </span>

                                <span className="hidden h-1 w-1 rounded-full bg-white/30 sm:block" />

                                <span className="text-sm font-medium text-white/50">
                                    {formatRaceDate(race)}
                                </span>
                            </div>
                        </div>

                        <div className="mt-8 grid grid-cols-1 gap-px border border-white/10 bg-white/10 sm:grid-cols-2">
                            <div className="bg-[#151515] p-5">
                                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/40">
                                    Circuit
                                </p>

                                <p className="mt-2 text-sm font-semibold text-white/80">
                                    {race.circuit}
                                </p>
                            </div>

                            <div className="bg-[#151515] p-5">
                                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/40">
                                    Location
                                </p>

                                <p className="mt-2 text-sm font-semibold text-white/80">
                                    {race.location},{" "}
                                    {race.country}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-[#121212]">
                    <div className="border-b border-white/10 p-6">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
                            Previous
                        </p>

                        {previousRace ? (
                            <div className="mt-5">
                                <div className="flex items-center gap-3">
                                    <RaceFlag
                                        countryCode={
                                            previousRace.countryCode
                                        }
                                    />

                                    <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/45">
                                        Round{" "}
                                        {previousRace.round}
                                    </span>
                                </div>

                                <p className="mt-3 text-base font-semibold leading-5 text-white/80">
                                    {previousRace.name}
                                </p>

                                <p className="mt-2 text-sm text-white/40">
                                    {formatRaceDate(
                                        previousRace,
                                    )}
                                </p>
                            </div>
                        ) : (
                            <p className="mt-5 text-sm text-white/50">
                                No previous race
                            </p>
                        )}
                    </div>

                    <div className="p-6">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#ff729f]">
                            Next
                        </p>

                        {nextRace ? (
                            <div className="mt-5">
                                <div className="flex items-center gap-3">
                                    <RaceFlag
                                        countryCode={
                                            nextRace.countryCode
                                        }
                                    />

                                    <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/45">
                                        Round{" "}
                                        {nextRace.round}
                                    </span>
                                </div>

                                <p className="mt-3 text-base font-semibold leading-5 text-white/80">
                                    {nextRace.name}
                                </p>

                                <p className="mt-2 text-sm text-white/40">
                                    {formatRaceDate(
                                        nextRace,
                                    )}
                                </p>
                            </div>
                        ) : (
                            <p className="mt-5 text-sm text-white/50">
                                Season complete
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}

function CalendarSection({
    calendar,
    now,
    seriesLabel,
}: {
    calendar: Race[];
    now: number;
    seriesLabel: string;
}): React.ReactElement {
    const [filter, setFilter] =
        useState<CalendarFilter>("all");

    const [currentPage, setCurrentPage] =
        useState(1);

    const filteredCalendar = useMemo(
        () => {
            if (filter === "completed") {
                return calendar.filter(
                    (race) =>
                        getRaceStatus(
                            race,
                            now,
                        ) === "completed",
                );
            }

            if (filter === "upcoming") {
                return calendar.filter(
                    (race) =>
                        getRaceStatus(
                            race,
                            now,
                        ) !== "completed",
                );
            }

            return calendar;
        },
        [calendar, filter, now],
    );

    const totalPages = Math.max(
        1,
        Math.ceil(
            filteredCalendar.length /
            CALENDAR_PAGE_SIZE,
        ),
    );

    const safeCurrentPage = Math.min(
        currentPage,
        totalPages,
    );

    const visibleRaces =
        filteredCalendar.slice(
            (safeCurrentPage - 1) *
            CALENDAR_PAGE_SIZE,
            safeCurrentPage *
            CALENDAR_PAGE_SIZE,
        );

    const changeFilter = (
        value: string,
    ): void => {
        setFilter(
            value as CalendarFilter,
        );
        setCurrentPage(1);
    };

    return (
        <div>
            <SectionHeading
                eyebrow="Season index"
                title={`${seriesLabel} calendar`}
                description="Browse the season without filling the screen with every round."
                accent="orange"
                action={
                    <Select
                        value={filter}
                        onValueChange={(
                            value,
                        ) =>
                            changeFilter(
                                String(
                                    value,
                                ),
                            )
                        }
                    >
                        <SelectTrigger
                            size="sm"
                            className="w-full cursor-pointer border-white/15 bg-white/[0.04] text-sm font-semibold text-white hover:border-white/30 md:w-40"
                        >
                            <SelectValue />
                        </SelectTrigger>

                        <SelectContent>
                            <SelectItem value="all">
                                All rounds
                            </SelectItem>

                            <SelectItem value="upcoming">
                                Upcoming
                            </SelectItem>

                            <SelectItem value="completed">
                                Completed
                            </SelectItem>
                        </SelectContent>
                    </Select>
                }
            />

            <div className="overflow-hidden border border-white/10">
                <div className="hidden grid-cols-[5rem_3rem_1fr_10rem] gap-4 border-b border-white/10 bg-white/[0.035] px-5 py-3 text-[9px] font-bold uppercase tracking-[0.18em] text-white/35 md:grid">
                    <span>Round</span>
                    <span>Flag</span>
                    <span>Grand Prix</span>
                    <span>Date</span>
                </div>

                <Accordion className="w-full">
                    {visibleRaces.map(
                        (race) => {
                            const status =
                                getRaceStatus(
                                    race,
                                    now,
                                );

                            return (
                                <AccordionItem
                                    key={
                                        race.round
                                    }
                                    value={`round-${race.round}`}
                                    className="border-white/10 px-5"
                                >
                                    <AccordionTrigger className="cursor-pointer py-4 hover:bg-white/[0.02] hover:no-underline">
                                        <div className="grid w-full grid-cols-[2.5rem_2rem_1fr] items-center gap-3 pr-4 text-left md:grid-cols-[4rem_3rem_1fr_10rem]">
                                            <span className="text-[10px] font-black uppercase tracking-[0.12em] text-white/45">
                                                R
                                                {String(
                                                    race.round,
                                                ).padStart(
                                                    2,
                                                    "0",
                                                )}
                                            </span>

                                            <RaceFlag
                                                countryCode={
                                                    race.countryCode
                                                }
                                            />

                                            <div className="min-w-0">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span className="truncate text-sm font-semibold text-white/85 md:text-base">
                                                        {
                                                            race.name
                                                        }
                                                    </span>

                                                    {status ===
                                                        "next" && (
                                                            <CategoryTag accent="pink">
                                                                Next
                                                            </CategoryTag>
                                                        )}
                                                </div>

                                                <p className="mt-1 truncate text-xs font-medium text-white/40">
                                                    {
                                                        race.circuit
                                                    }
                                                </p>
                                            </div>

                                            <span className="hidden text-sm font-medium text-white/40 md:block">
                                                {formatRaceDate(
                                                    race,
                                                )}
                                            </span>
                                        </div>
                                    </AccordionTrigger>

                                    <AccordionContent>
                                        <div className="grid gap-5 border-t border-white/10 py-5 md:grid-cols-3 md:pl-[7rem]">
                                            <div>
                                                <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/35">
                                                    Date
                                                </p>

                                                <p className="mt-2 text-sm font-semibold text-white/70">
                                                    {formatRaceDate(
                                                        race,
                                                    )}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/35">
                                                    Circuit
                                                </p>

                                                <p className="mt-2 text-sm font-semibold text-white/70">
                                                    {
                                                        race.circuit
                                                    }
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/35">
                                                    Location
                                                </p>

                                                <p className="mt-2 text-sm font-semibold text-white/70">
                                                    {
                                                        race.location
                                                    }
                                                    ,{" "}
                                                    {
                                                        race.country
                                                    }
                                                </p>
                                            </div>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            );
                        },
                    )}
                </Accordion>
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

function DashboardNavigation(): React.ReactElement {
    return (
        <div className="sticky top-0 z-30 border-b border-white/10 bg-[#1c1c1c]/95 backdrop-blur-md">
            <Container size="wide">
                <nav className="flex items-center gap-1 overflow-x-auto py-2.5">
                    <a
                        href="#overview"
                        className="cursor-pointer whitespace-nowrap rounded-md px-3 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-white/55 transition-colors hover:bg-white/[0.04] hover:text-white"
                    >
                        Overview
                    </a>

                    <a
                        href="#race-weekend"
                        className="cursor-pointer whitespace-nowrap rounded-md px-3 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-white/55 transition-colors hover:bg-white/[0.04] hover:text-white"
                    >
                        Race
                    </a>

                    <a
                        href="#live"
                        className="cursor-pointer whitespace-nowrap rounded-md px-3 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-white/55 transition-colors hover:bg-white/[0.04] hover:text-white"
                    >
                        Live
                    </a>

                    <a
                        href="#championship"
                        className="cursor-pointer whitespace-nowrap rounded-md px-3 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-white/55 transition-colors hover:bg-white/[0.04] hover:text-white"
                    >
                        Championship
                    </a>

                    <a
                        href="#calendar"
                        className="cursor-pointer whitespace-nowrap rounded-md px-3 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-white/55 transition-colors hover:bg-white/[0.04] hover:text-white"
                    >
                        Calendar
                    </a>
                </nav>
            </Container>
        </div>
    );
}

export default function F1Dashboard(): React.ReactElement {
    const [activeSeries, setActiveSeries] =
        useState<Series>("f1");

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
        useMemo<Race | null>(
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
                            ) ===
                            "next",
                    ) ?? null;

                if (currentRace) {
                    return currentRace;
                }

                return (
                    calendar.at(
                        -1,
                    ) ?? null
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

    const liveSessionName =
        liveData?.session
            ?.sessionName ??
        "No live session";

    const liveStatus =
        activeSeries === "f1" &&
            liveData?.isLive
            ? "LIVE"
            : "READY";

    return (
        <main className="bg-[#1c1c1c] text-white">
            <section className="relative overflow-hidden border-b border-white/10">
                <div className="absolute inset-0 bg-[linear-gradient(130deg,#1c1c1c_0%,#1c1c1c_44%,#2a2025_75%,#3b222d_100%)]" />

                <div className="absolute right-[-12rem] top-[-12rem] h-[36rem] w-[36rem] rounded-full bg-[#ff729f]/10 blur-3xl" />

                <div className="absolute bottom-[-12rem] left-[20%] h-[22rem] w-[22rem] rounded-full bg-[#ee8434]/5 blur-3xl" />

                <Container
                    className="relative py-10 md:py-14 lg:py-16"
                    size="wide"
                >
                    <AnimatedSection>
                        <div className="flex flex-col justify-between gap-10 lg:flex-row lg:items-end">
                            <div className="max-w-4xl">
                                <div className="flex flex-wrap items-center gap-3">
                                    <CategoryTag accent="pink">
                                        2026 Season
                                    </CategoryTag>

                                    <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/40">
                                        FGC / Motorsport Intelligence
                                    </span>
                                </div>

                                <div className="mt-7">
                                    <p className="text-[11px] font-bold uppercase tracking-[0.34em] text-white/35">
                                        The
                                    </p>

                                    <h1 className="mt-1 text-[clamp(4.5rem,11vw,9rem)] font-black uppercase leading-[0.74] tracking-[-0.085em] text-white">
                                        Grid
                                        <span className="text-[#ff729f]">
                                            .
                                        </span>
                                    </h1>
                                </div>

                                <p className="mt-8 max-w-2xl text-base font-medium leading-7 text-white/65 md:text-lg">
                                    Motorsport data, live racing and
                                    championship intelligence. Everything
                                    you need to follow the season in one
                                    place.
                                </p>
                            </div>

                            <div className="flex flex-col gap-3 lg:items-end">
                                <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-white/35">
                                    Series
                                </span>

                                <div className="flex items-center gap-1 border border-white/10 bg-black/10 p-1">
                                    {(
                                        Object.keys(
                                            seriesData,
                                        ) as Series[]
                                    ).map(
                                        (
                                            series,
                                        ) => (
                                            <Button
                                                key={
                                                    series
                                                }
                                                type="button"
                                                variant={
                                                    activeSeries ===
                                                        series
                                                        ? "default"
                                                        : "ghost"
                                                }
                                                onClick={() =>
                                                    setActiveSeries(
                                                        series,
                                                    )
                                                }
                                                className={`cursor-pointer px-5 text-[10px] font-black uppercase tracking-[0.16em] ${activeSeries ===
                                                    series
                                                    ? "bg-white text-[#1c1c1c] hover:bg-white/90"
                                                    : "text-white/50 hover:text-white"
                                                    }`}
                                            >
                                                {
                                                    seriesData[
                                                        series
                                                    ].label
                                                }
                                            </Button>
                                        ),
                                    )}
                                </div>

                                <div className="flex items-center gap-2">
                                    <span
                                        className={`h-2 w-2 ${liveStatus ===
                                            "LIVE"
                                            ? "bg-[#ff729f]"
                                            : "bg-white/30"
                                            }`}
                                    />

                                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/45">
                                        {liveStatus ===
                                            "LIVE"
                                            ? "Live feed active"
                                            : "Live feed ready"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </AnimatedSection>
                </Container>
            </section>

            <DashboardNavigation />

            <div id="overview">
                <Container
                    className="py-6 md:py-8"
                    size="wide"
                >
                    <AnimatedSection>
                        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                            <StatCard
                                label="Series"
                                value={
                                    activeSeriesData.label
                                }
                                detail={
                                    activeSeriesData.fullLabel
                                }
                                accent
                            />

                            <StatCard
                                label="Rounds"
                                value={String(
                                    calendar.length,
                                )}
                                detail={`${completedCount} completed`}
                            />

                            <StatCard
                                label="Remaining"
                                value={String(
                                    remainingCount,
                                )}
                                detail="Rounds on the calendar"
                            />

                            <StatCard
                                label="Live feed"
                                value={liveStatus}
                                detail={
                                    activeSeries ===
                                        "f1"
                                        ? liveSessionName
                                        : "Series calendar"
                                }
                                accent={
                                    liveStatus ===
                                    "LIVE"
                                }
                            />
                        </div>
                    </AnimatedSection>
                </Container>
            </div>

            <div id="race-weekend">
                <Container
                    className="pb-8 md:pb-10"
                    size="wide"
                >
                    <AnimatedSection>
                        <SectionHeading
                            eyebrow="Race weekend"
                            title="The next stop"
                            description="The race currently defining the calendar position."
                            action={
                                <AnimatedLink
                                    href="#calendar"
                                    variant="accent"
                                >
                                    Browse calendar
                                </AnimatedLink>
                            }
                        />

                        <RaceFocus
                            race={
                                displayedRace
                            }
                            previousRace={
                                previousRace
                            }
                            nextRace={
                                nextRace
                            }
                            now={
                                currentTime
                            }
                        />
                    </AnimatedSection>
                </Container>
            </div>

            {activeSeries === "f1" && (
                <div id="live">
                    <Container
                        className="pb-8 md:pb-10"
                        size="wide"
                    >
                        <AnimatedSection>
                            <SectionHeading
                                eyebrow="Live data"
                                title="Live timing"
                                description="Current session positions, gaps and track information."
                                action={
                                    <CategoryTag
                                        accent={
                                            liveStatus ===
                                                "LIVE"
                                                ? "pink"
                                                : "white"
                                        }
                                    >
                                        {
                                            liveStatus
                                        }
                                    </CategoryTag>
                                }
                            />

                            <LiveTiming
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
                        </AnimatedSection>
                    </Container>
                </div>
            )}

            {activeSeries === "f1" && (
                <div id="championship">
                    <Container
                        className="pb-8 md:pb-10"
                        size="wide"
                    >
                        <AnimatedSection>
                            <div className="grid gap-8 lg:grid-cols-2">
                                <div>
                                    <SectionHeading
                                        eyebrow="Championship"
                                        title="Drivers"
                                        description="Current driver standings."
                                        accent="orange"
                                    />

                                    <DriverStandings />
                                </div>

                                <div>
                                    <SectionHeading
                                        eyebrow="Constructors"
                                        title="Teams"
                                        description="Current team standings."
                                    />

                                    <ConstructorStandings />
                                </div>
                            </div>
                        </AnimatedSection>
                    </Container>
                </div>
            )}

            <div id="calendar">
                <Container
                    className="pb-12 md:pb-14"
                    size="wide"
                >
                    <AnimatedSection>
                        <CalendarSection
                            calendar={
                                calendar
                            }
                            now={
                                currentTime
                            }
                            seriesLabel={
                                activeSeriesData.fullLabel
                            }
                        />
                    </AnimatedSection>
                </Container>
            </div>

            <section className="border-t border-white/10 bg-[#151515]">
                <Container
                    className="py-10 md:py-12"
                    size="wide"
                >
                    <AnimatedSection>
                        <div className="flex flex-col justify-between gap-7 lg:flex-row lg:items-end">
                            <div className="max-w-3xl">
                                <CategoryTag accent="pink">
                                    The Grid
                                </CategoryTag>

                                <h2 className="mt-5 text-4xl font-black uppercase leading-[0.9] tracking-[-0.06em] text-white md:text-5xl">
                                    Motorsport,
                                    <br />
                                    without the
                                    <br />
                                    <span className="text-[#ff729f]">
                                        noise.
                                    </span>
                                </h2>

                                <p className="mt-5 max-w-2xl text-base font-medium leading-7 text-white/55">
                                    One focused place for the information
                                    that matters on race weekend.
                                </p>
                            </div>

                            <AnimatedLink
                                href="/"
                                variant="accent"
                            >
                                Back to Fast Girls Club
                            </AnimatedLink>
                        </div>
                    </AnimatedSection>
                </Container>
            </section>
        </main>
    );
}