"use client";

import { motion, useReducedMotion } from "framer-motion";

interface GridLoadingStateProps {
    label: string;
    description?: string;
    phase?: "red" | "yellow" | "green";
}

const lights = [
    {
        phase: "red",
        colour: "bg-[#ff596c]",
        glow: "shadow-[0_0_22px_rgba(255,89,108,0.65)]",
    },
    {
        phase: "yellow",
        colour: "bg-[#f4bd50]",
        glow: "shadow-[0_0_22px_rgba(244,189,80,0.65)]",
    },
    {
        phase: "green",
        colour: "bg-[#68d49b]",
        glow: "shadow-[0_0_22px_rgba(104,212,155,0.65)]",
    },
] as const;

export default function GridLoadingState({
    label,
    description = "Preparing the race weekend",
    phase = "red",
}: GridLoadingStateProps): React.ReactElement {
    const reducedMotion = useReducedMotion();

    return (
        <section
            role="status"
            aria-live="polite"
            className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center"
        >
            <p className="text-[10px] font-black uppercase tracking-[0.32em] text-[#ff729f]">
                The Grid
            </p>

            <div aria-hidden="true" className="mt-7 flex gap-4 rounded-full border border-white/15 bg-black/35 px-5 py-4 shadow-[inset_0_2px_10px_rgba(0,0,0,0.45)]">
                {lights.map((light) => {
                    const active = phase === light.phase;

                    return (
                        <motion.span
                            key={light.phase}
                            className={`h-8 w-8 rounded-full border border-white/20 ${light.colour} ${active ? light.glow : ""} sm:h-10 sm:w-10`}
                            initial={false}
                            animate={{ opacity: active ? 1 : 0.18, scale: active ? 1 : 0.9 }}
                            transition={{ duration: reducedMotion ? 0 : 0.22, ease: "easeOut" }}
                        />
                    );
                })}
            </div>

            <p className="mt-7 text-sm font-semibold uppercase tracking-[0.16em] text-white/80">
                {label}
            </p>
            <p className="mt-2 text-xs text-white/40">
                {description}
            </p>
        </section>
    );
}
