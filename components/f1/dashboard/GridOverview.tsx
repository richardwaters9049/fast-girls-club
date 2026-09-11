import AnimatedSection from "@/components/ui/AnimatedSection";
import CategoryTag from "@/components/ui/CategoryTag";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";

import type { F1Race } from "@/lib/f1/calendar";

interface GridOverviewProps {
    seriesLabel: string;
    rounds: number;
    completed: number;
    remaining: number;
    liveStatus: string;
    liveSession: string;
    nextRace: F1Race | null;
    onRaceClick: () => void;
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
            <span
                className={`absolute left-0 top-0 h-0.5 w-10 ${accent
                    ? "bg-[#ff729f]"
                    : "bg-white/20"
                    }`}
            />

            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">
                {label}
            </p>

            <p className="mt-3 text-3xl font-black tracking-[-0.05em] text-white md:text-4xl">
                {value}
            </p>

            <p className="mt-2 text-sm font-medium text-white/55">
                {detail}
            </p>
        </article>
    );
}

export default function GridOverview({
    seriesLabel,
    rounds,
    completed,
    remaining,
    liveStatus,
    liveSession,
    nextRace,
    onRaceClick,
}: GridOverviewProps): React.ReactElement {
    return (
        <Container
            size="wide"
            className="py-8 md:py-10"
        >
            <AnimatedSection>
                <SectionHeading
                    eyebrow="Overview"
                    title="Your view of the season"
                    description="The essential information first. Choose another panel when you want to go deeper."
                />

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <StatCard
                        label="Series"
                        value={seriesLabel}
                        detail="Current series"
                        accent
                    />

                    <StatCard
                        label="Rounds"
                        value={String(rounds)}
                        detail={`${completed} completed`}
                    />

                    <StatCard
                        label="Remaining"
                        value={String(remaining)}
                        detail="Still on the calendar"
                    />

                    <StatCard
                        label="Live feed"
                        value={liveStatus}
                        detail={liveSession}
                        accent={liveStatus === "LIVE"}
                    />
                </div>

                {nextRace && (
                    <button
                        type="button"
                        onClick={onRaceClick}
                        className="group mt-6 block w-full cursor-pointer border border-white/10 bg-[#151515] p-6 text-left transition-colors hover:border-[#ff729f]/35 md:p-8"
                    >
                        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
                            <div>
                                <div className="flex items-center gap-3">
                                    <CategoryTag accent="pink">
                                        Next race
                                    </CategoryTag>

                                    <span className="text-sm font-medium text-white/50">
                                        Round{" "}
                                        {nextRace.round}
                                    </span>
                                </div>

                                <h3 className="mt-5 text-3xl font-black uppercase tracking-[-0.05em] text-white md:text-5xl">
                                    {nextRace.name}
                                </h3>

                                <p className="mt-3 text-base font-medium text-white/60">
                                    {nextRace.circuit} ·{" "}
                                    {nextRace.location},{" "}
                                    {nextRace.country}
                                </p>
                            </div>

                            <div className="shrink-0">
                                <p className="text-sm font-bold text-white/65">
                                    Open race weekend
                                </p>

                                <p className="mt-1 text-sm text-[#ff729f]">
                                    {nextRace.startDate}
                                </p>
                            </div>
                        </div>
                    </button>
                )}
            </AnimatedSection>
        </Container>
    );
}