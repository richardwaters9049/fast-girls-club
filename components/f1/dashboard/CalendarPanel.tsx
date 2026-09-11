"use client";

import { useMemo, useState } from "react";

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import AnimatedSection from "@/components/ui/AnimatedSection";
import CategoryTag from "@/components/ui/CategoryTag";
import Container from "@/components/ui/Container";
import Pagination from "@/components/ui/Pagination";
import SectionHeading from "@/components/ui/SectionHeading";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import { countryCodeToEmoji } from "@/lib/f1/countries";
import type { F1Race } from "@/lib/f1/calendar";

type CalendarFilter =
    | "all"
    | "completed"
    | "upcoming";

const PAGE_SIZE = 6;

function formatRaceDate(race: F1Race): string {
    const start = new Date(
        `${race.startDate}T12:00:00`,
    );

    const end = new Date(
        `${race.endDate}T12:00:00`,
    );

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

function getStatus(
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

export default function CalendarPanel({
    calendar,
    seriesLabel,
    now,
}: {
    calendar: F1Race[];
    seriesLabel: string;
    now: number;
}): React.ReactElement {
    const [filter, setFilter] =
        useState<CalendarFilter>("all");

    const [currentPage, setCurrentPage] =
        useState(1);

    const filteredCalendar = useMemo(
        () => {
            if (
                filter ===
                "completed"
            ) {
                return calendar.filter(
                    (race) =>
                        getStatus(
                            race,
                            now,
                        ) ===
                        "completed",
                );
            }

            if (
                filter ===
                "upcoming"
            ) {
                return calendar.filter(
                    (race) =>
                        getStatus(
                            race,
                            now,
                        ) !==
                        "completed",
                );
            }

            return calendar;
        },
        [
            calendar,
            filter,
            now,
        ],
    );

    const totalPages =
        Math.max(
            1,
            Math.ceil(
                filteredCalendar.length /
                PAGE_SIZE,
            ),
        );

    const safeCurrentPage =
        Math.min(
            currentPage,
            totalPages,
        );

    const visibleRaces =
        filteredCalendar.slice(
            (safeCurrentPage -
                1) *
            PAGE_SIZE,
            safeCurrentPage *
            PAGE_SIZE,
        );

    const handleFilterChange =
        (value: string): void => {
            setFilter(
                value as CalendarFilter,
            );

            setCurrentPage(1);
        };

    return (
        <Container
            size="wide"
            className="py-8 md:py-10"
        >
            <AnimatedSection>
                <SectionHeading
                    eyebrow="Season index"
                    title={`${seriesLabel} calendar`}
                    description="Six rounds at a time, with expandable race details."
                    accent="orange"
                    action={
                        <Select
                            value={filter}
                            onValueChange={(
                                value,
                            ) =>
                                handleFilterChange(
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
                    <Accordion className="w-full">
                        {visibleRaces.map(
                            (race) => {
                                const status =
                                    getStatus(
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
                                        <AccordionTrigger className="cursor-pointer py-5 hover:bg-white/[0.025] hover:no-underline">
                                            <div className="grid w-full grid-cols-[3rem_2.5rem_1fr] items-center gap-3 pr-4 text-left md:grid-cols-[5rem_3rem_1fr_10rem]">
                                                <span className="text-[11px] font-black tracking-[0.12em] text-white/45">
                                                    R
                                                    {String(
                                                        race.round,
                                                    ).padStart(
                                                        2,
                                                        "0",
                                                    )}
                                                </span>

                                                <span className="text-xl">
                                                    {countryCodeToEmoji(
                                                        race.countryCode,
                                                    )}
                                                </span>

                                                <div className="min-w-0">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <span className="truncate text-sm font-semibold text-white/90 md:text-base">
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

                                                    <p className="mt-1 truncate text-sm font-medium text-white/45">
                                                        {
                                                            race.circuit
                                                        }
                                                    </p>
                                                </div>

                                                <span className="hidden text-sm font-medium text-white/45 md:block">
                                                    {formatRaceDate(
                                                        race,
                                                    )}
                                                </span>
                                            </div>
                                        </AccordionTrigger>

                                        <AccordionContent>
                                            <div className="grid gap-5 border-t border-white/10 py-5 md:grid-cols-3 md:pl-[7.5rem]">
                                                <div>
                                                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/35">
                                                        Date
                                                    </p>

                                                    <p className="mt-2 text-sm font-semibold text-white/75">
                                                        {formatRaceDate(
                                                            race,
                                                        )}
                                                    </p>
                                                </div>

                                                <div>
                                                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/35">
                                                        Circuit
                                                    </p>

                                                    <p className="mt-2 text-sm font-semibold text-white/75">
                                                        {
                                                            race.circuit
                                                        }
                                                    </p>
                                                </div>

                                                <div>
                                                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/35">
                                                        Location
                                                    </p>

                                                    <p className="mt-2 text-sm font-semibold text-white/75">
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
            </AnimatedSection>
        </Container>
    );
}