"use client";

import { LatestRaceResults } from "./RaceWeekendPanel";
import AnimatedSection from "@/components/ui/AnimatedSection";
import CategoryTag from "@/components/ui/CategoryTag";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";

import LiveTiming from "../LiveTiming";

import type { F1LiveResponse } from "@/lib/f1/types";

interface LiveTimingPanelProps {
    view: "live" | "previous";
    onViewChange: (view: "live" | "previous") => void;
    data: F1LiveResponse | null;
    loading: boolean;
    error: string | null;
}

export default function LiveTimingPanel({
    view,
    onViewChange,
    data,
    loading,
    error,
}: LiveTimingPanelProps): React.ReactElement {
    const isLive =
        data?.isLive ?? false;

    return (
        <Container
            size="wide"
            className="h-full py-5 md:py-6"
        >
            <AnimatedSection className="flex h-full flex-col overflow-hidden">
                <SectionHeading
                    eyebrow={view === "live" ? "Live data" : "Race archive"}
                    title={view === "live" ? "Live timing" : "Previous race"}
                    description={view === "live" ? "Practice, qualifying, sprint and race timing." : "Full classification from the latest race with published results."}
                    action={
                        <div className="flex flex-wrap items-center gap-2" aria-label="Timing view">
                            <button type="button" aria-pressed={view === "live"} onClick={() => onViewChange("live")} className={`cursor-pointer border px-4 py-2 text-xs font-bold transition-colors duration-150 motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff729f] ${view === "live" ? "border-[#ff729f] bg-[#ff729f] text-black" : "border-white/25 text-white hover:border-[#ff729f] hover:bg-[#ff729f] hover:text-black"}`}>Live</button>
                            <button type="button" aria-pressed={view === "previous"} onClick={() => onViewChange("previous")} className={`cursor-pointer border px-4 py-2 text-xs font-bold transition-colors duration-150 motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff729f] ${view === "previous" ? "border-[#ff729f] bg-[#ff729f] text-black" : "border-white/25 text-white hover:border-[#ff729f] hover:bg-[#ff729f] hover:text-black"}`}>Previous race</button>
                            {view === "live" && isLive && (
                                <CategoryTag accent="pink">Live</CategoryTag>
                            )}
                        </div>
                    }
                />

                <div className="min-h-0 flex-1 overflow-hidden">
                    {view === "previous" ? <LatestRaceResults full /> : <LiveTiming
                        data={data}
                        loading={loading}
                        error={error}
                    />}
                </div>
            </AnimatedSection>
        </Container>
    );
}