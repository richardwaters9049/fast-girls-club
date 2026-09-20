"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import type { KeyboardEvent } from "react";

import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import type {
    F1ConstructorStandingsResponse,
    F1Driver,
    F1DriverStandingsResponse,
} from "@/lib/f1/types";

import ConstructorStandings from "../ConstructorStandings";
import DriverStandings from "../DriverStandings";

type ChampionshipView = "drivers" | "teams";

const views: { id: ChampionshipView; label: string; detail: string }[] = [
    { id: "drivers", label: "Drivers", detail: "Individual title" },
    { id: "teams", label: "Teams", detail: "Constructor title" },
];

export default function ChampionshipPanel({
    liveDrivers,
    driverStandings,
    constructorStandings,
    driverError,
    constructorError,
}: {
    liveDrivers: F1Driver[];
    driverStandings: F1DriverStandingsResponse | null;
    constructorStandings: F1ConstructorStandingsResponse | null;
    driverError: string | null;
    constructorError: string | null;
}): React.ReactElement {
    const [activeView, setActiveView] = useState<ChampionshipView>("drivers");
    const reducedMotion = useReducedMotion();

    const handleViewKeyDown = (
        event: KeyboardEvent<HTMLButtonElement>,
        index: number,
    ): void => {
        const nextIndex = event.key === "ArrowRight"
            ? (index + 1) % views.length
            : event.key === "ArrowLeft"
                ? (index - 1 + views.length) % views.length
                : event.key === "Home"
                    ? 0
                    : event.key === "End"
                        ? views.length - 1
                        : null;

        if (nextIndex === null) {
            return;
        }

        event.preventDefault();
        const nextView = views[nextIndex].id;
        setActiveView(nextView);
        document.getElementById(`championship-${nextView}-tab`)?.focus();
    };

    return (
        <Container size="wide" className="py-8 md:py-12">
            <motion.section
                initial={reducedMotion ? false : { opacity: 0, y: 14 }}
                whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
                <SectionHeading
                    eyebrow="Season standings"
                    title="Championship"
                    description="Two titles, one season. Follow the drivers on track and the teams behind them."
                />

                <div
                    role="tablist"
                    aria-label="Championship standings"
                    className="grid w-full grid-cols-2 gap-2 sm:max-w-xl"
                >
                    {views.map((view, index) => {
                        const isActive = activeView === view.id;

                        return (
                            <button
                                key={view.id}
                                id={`championship-${view.id}-tab`}
                                type="button"
                                role="tab"
                                aria-selected={isActive}
                                aria-controls={`championship-${view.id}-panel`}
                                tabIndex={isActive ? 0 : -1}
                                onClick={() => setActiveView(view.id)}
                                onKeyDown={(event) => handleViewKeyDown(event, index)}
                                className={`relative flex min-h-16 cursor-pointer items-center gap-3 overflow-hidden border px-3 py-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff729f] sm:min-h-20 sm:px-5 ${isActive
                                    ? "border-[#ff729f]/45 bg-[#ff729f]/10 text-white"
                                    : "border-white/10 bg-white/[0.025] text-white/55 hover:border-white/25 hover:bg-white/[0.05] hover:text-white"
                                    }`}
                            >
                                <span aria-hidden="true" className={`text-xs font-bold tabular-nums ${isActive ? "text-[#ff729f]" : "text-white/30"}`}>
                                    0{index + 1}
                                </span>

                                <span className="min-w-0">
                                    <span className="block text-sm font-bold uppercase tracking-[0.08em] sm:text-base">
                                        {view.label}
                                    </span>
                                    <span className="mt-1 hidden text-[10px] font-medium uppercase tracking-[0.12em] text-white/40 sm:block">
                                        {view.detail}
                                    </span>
                                </span>

                                {isActive && (
                                    <motion.span
                                        layoutId="championship-active-line"
                                        className="absolute inset-x-0 bottom-0 h-0.5 bg-[#ff729f]"
                                        transition={reducedMotion ? { duration: 0 } : { type: "spring", stiffness: 400, damping: 34 }}
                                    />
                                )}
                            </button>
                        );
                    })}
                </div>

                <motion.section
                    id="championship-drivers-panel"
                    role="tabpanel"
                    aria-labelledby="championship-drivers-tab"
                    hidden={activeView !== "drivers"}
                    initial={false}
                    animate={reducedMotion ? { opacity: 1, y: 0 } : { opacity: activeView === "drivers" ? 1 : 0, y: activeView === "drivers" ? 0 : 10 }}
                    transition={{ duration: reducedMotion ? 0 : 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className="mt-6 overflow-hidden border border-white/10 bg-white/[0.025]"
                >
                    <DriverStandings
                        liveDrivers={liveDrivers}
                        data={driverStandings}
                        error={driverError}
                    />
                </motion.section>

                <motion.section
                    id="championship-teams-panel"
                    role="tabpanel"
                    aria-labelledby="championship-teams-tab"
                    hidden={activeView !== "teams"}
                    initial={false}
                    animate={reducedMotion ? { opacity: 1, y: 0 } : { opacity: activeView === "teams" ? 1 : 0, y: activeView === "teams" ? 0 : 10 }}
                    transition={{ duration: reducedMotion ? 0 : 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className="mt-6 overflow-hidden border border-white/10 bg-white/[0.025]"
                >
                    <ConstructorStandings
                        data={constructorStandings}
                        error={constructorError}
                    />
                </motion.section>
            </motion.section>
        </Container>
    );
}
