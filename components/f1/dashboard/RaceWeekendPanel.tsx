import AnimatedSection from "@/components/ui/AnimatedSection";
import CategoryTag from "@/components/ui/CategoryTag";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";

import { countryCodeToEmoji } from "@/lib/f1/countries";
import type { F1Race } from "@/lib/f1/calendar";

interface RaceWeekendPanelProps {
    race: F1Race | null;
    previousRace: F1Race | null;
    nextRace: F1Race | null;
    status: "completed" | "next" | "upcoming";
}

function formatDate(
    date: string | null | undefined,
): string {
    if (!date) {
        return "TBC";
    }

    const parsedDate = new Date(`${date}T00:00:00`);

    if (Number.isNaN(parsedDate.getTime())) {
        return "TBC";
    }

    return new Intl.DateTimeFormat("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
    }).format(parsedDate);
}

function getStatusLabel(
    status: RaceWeekendPanelProps["status"],
): string {
    if (status === "completed") {
        return "Completed";
    }

    if (status === "next") {
        return "Race weekend";
    }

    return "Upcoming";
}

function getHeadingTitle(
    status: RaceWeekendPanelProps["status"],
): string {
    if (status === "completed") {
        return "Latest stop";
    }

    if (status === "next") {
        return "Race weekend";
    }

    return "The next stop";
}

function RaceLink({
    label,
    race,
}: {
    label: string;
    race: F1Race | null;
}): React.ReactElement {
    if (!race) {
        return (
            <div className="flex min-h-28 flex-col justify-between rounded-2xl border border-white/10 bg-white/[0.025] p-4 opacity-50">
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/35">
                    {label}
                </span>

                <span className="text-sm text-white/40">
                    No race available
                </span>
            </div>
        );
    }

    return (
        <div className="flex min-h-28 flex-col justify-between rounded-2xl border border-white/10 bg-white/[0.025] p-4 transition-colors hover:border-white/20 hover:bg-white/[0.05]">
            <div className="flex items-center justify-between gap-3">
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/35">
                    {label}
                </span>

                <span className="text-xs text-white/45">
                    R{race.round}
                </span>
            </div>

            <div className="space-y-1">
                <div className="flex items-center gap-2">
                    <span className="text-base" aria-hidden="true">
                        {countryCodeToEmoji(race.countryCode)}
                    </span>

                    <span className="truncate text-sm font-semibold text-white">
                        {race.country}
                    </span>
                </div>

                <p className="text-xs text-white/45">
                    {race.name}
                </p>
            </div>
        </div>
    );
}

function TrackMap(): React.ReactElement {
    return (
        <div className="relative flex aspect-[1.5/1] w-full items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-[#151515]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,114,159,0.08),transparent_62%)]" />

            <svg
                viewBox="0 0 420 280"
                className="relative h-full w-full p-5"
                role="img"
                aria-label="Stylised circuit map"
            >
                <path
                    d="M88 194
                        C48 175 42 119 75 84
                        C108 49 161 49 196 73
                        C226 94 246 96 274 76
                        C307 52 354 64 369 98
                        C384 132 367 167 334 181
                        C304 194 274 184 249 164
                        C222 143 199 145 178 169
                        C153 198 120 211 88 194 Z"
                    fill="none"
                    stroke="rgba(255,255,255,0.12)"
                    strokeWidth="22"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />

                <path
                    d="M88 194
                        C48 175 42 119 75 84
                        C108 49 161 49 196 73
                        C226 94 246 96 274 76
                        C307 52 354 64 369 98
                        C384 132 367 167 334 181
                        C304 194 274 184 249 164
                        C222 143 199 145 178 169
                        C153 198 120 211 88 194 Z"
                    fill="none"
                    stroke="#ff729f"
                    strokeWidth="5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />

                <circle
                    cx="88"
                    cy="194"
                    r="7"
                    fill="#ee8434"
                />

                <circle
                    cx="88"
                    cy="194"
                    r="13"
                    fill="none"
                    stroke="#ee8434"
                    strokeOpacity="0.3"
                    strokeWidth="2"
                />

                <path
                    d="M77 194 H99 M88 183 V205"
                    stroke="#1c1c1c"
                    strokeWidth="2"
                    strokeLinecap="round"
                />
            </svg>

            <div className="absolute bottom-4 left-4 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
                <span className="h-1.5 w-1.5 rounded-full bg-[#ee8434]" />
                Circuit overview
            </div>
        </div>
    );
}

export default function RaceWeekendPanel({
    race,
    previousRace,
    nextRace,
    status,
}: RaceWeekendPanelProps): React.ReactElement {
    return (
        <Container
            size="wide"
            className="py-5 md:py-6"
        >
            <AnimatedSection className="space-y-8">
                <SectionHeading
                    eyebrow="Race weekend"
                    title={getHeadingTitle(status)}
                    description="Circuit information, race details and the surrounding championship calendar."
                    action={
                        <CategoryTag
                            accent={
                                status === "completed"
                                    ? "pink"
                                    : "orange"
                            }
                        >
                            {race
                                ? `Round ${race.round}`
                                : "No race"}
                        </CategoryTag>
                    }
                />

                {race ? (
                    <div className="space-y-8">
                        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                            <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-5 sm:p-6 md:p-8">
                                <div className="flex flex-col gap-8">
                                    <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                                        <div className="space-y-4">
                                            <div className="flex flex-wrap items-center gap-3">
                                                <span
                                                    className="text-2xl"
                                                    aria-label="Race event"
                                                    role="img"
                                                >
                                                    🏁
                                                </span>

                                                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
                                                    Round {race.round}
                                                </span>
                                            </div>

                                            <div>
                                                <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                                                    {race.name}
                                                </h2>

                                                <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-white/55">
                                                    <span
                                                        className="text-lg"
                                                        aria-hidden="true"
                                                    >
                                                        {countryCodeToEmoji(
                                                            race.countryCode,
                                                        )}
                                                    </span>

                                                    <span>
                                                        {race.circuit}
                                                    </span>

                                                    <span className="text-white/20">
                                                        /
                                                    </span>

                                                    <span>
                                                        {race.country}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="rounded-2xl border border-white/10 bg-black/10 px-4 py-3 sm:text-right">
                                            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/35">
                                                Race date
                                            </p>

                                            <p className="mt-1 text-sm font-semibold text-white">
                                                {formatDate(
                                                    race.startDate,
                                                )}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid gap-4 sm:grid-cols-3">
                                        <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
                                            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
                                                Location
                                            </p>

                                            <p className="mt-2 text-sm font-medium text-white">
                                                {race.country}
                                            </p>
                                        </div>

                                        <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
                                            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
                                                Circuit
                                            </p>

                                            <p className="mt-2 text-sm font-medium text-white">
                                                {race.circuit}
                                            </p>
                                        </div>

                                        <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
                                            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
                                                Status
                                            </p>

                                            <p className="mt-2 flex items-center gap-2 text-sm font-medium text-white">
                                                <span
                                                    className={[
                                                        "h-2 w-2 rounded-full",
                                                        status ===
                                                            "completed"
                                                            ? "bg-white/30"
                                                            : "bg-[#ee8434]",
                                                    ].join(" ")}
                                                />

                                                {getStatusLabel(
                                                    status,
                                                )}
                                            </p>
                                        </div>
                                    </div>

                                    <TrackMap />
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
                                <RaceLink
                                    label="Previous race"
                                    race={previousRace}
                                />

                                <RaceLink
                                    label="Next race"
                                    race={nextRace}
                                />
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
                                <span className="text-2xl" aria-hidden="true">
                                    🏁
                                </span>

                                <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/35">
                                    Race weekend
                                </p>

                                <p className="mt-2 text-sm leading-6 text-white/60">
                                    Follow the weekend schedule and stay up to
                                    date with the latest session information.
                                </p>
                            </div>

                            <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
                                <span className="text-2xl" aria-hidden="true">
                                    📍
                                </span>

                                <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/35">
                                    Destination
                                </p>

                                <p className="mt-2 text-sm leading-6 text-white/60">
                                    {race.country}
                                </p>
                            </div>

                            <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
                                <span className="text-2xl" aria-hidden="true">
                                    📅
                                </span>

                                <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/35">
                                    Scheduled
                                </p>

                                <p className="mt-2 text-sm leading-6 text-white/60">
                                    {formatDate(
                                        race.startDate,
                                    )}
                                </p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-8">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl" aria-hidden="true">
                                🏁
                            </span>

                            <div>
                                <h2 className="text-xl font-semibold text-white">
                                    No race information available
                                </h2>

                                <p className="mt-1 text-sm text-white/50">
                                    Race weekend data will appear here when
                                    the schedule is available.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </AnimatedSection>
        </Container>
    );
}