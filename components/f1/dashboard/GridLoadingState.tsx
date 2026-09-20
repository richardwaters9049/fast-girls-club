"use client";

import { motion, useReducedMotion } from "framer-motion";

interface GridLoadingStateProps {
    label: string;
    description?: string;
}

export default function GridLoadingState({
    label,
    description = "Preparing the race weekend",
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

            <div aria-hidden="true" className="mt-7 flex gap-2.5 border-y border-white/10 px-4 py-5">
                {Array.from({ length: 5 }, (_, index) => (
                    <motion.span
                        key={index}
                        className="h-8 w-5 rounded-full border border-[#ff729f]/60 bg-[#ff729f] shadow-[0_0_18px_rgba(255,114,159,0.4)] sm:h-10 sm:w-6"
                        initial={reducedMotion ? false : { opacity: 0.25, scale: 0.9 }}
                        animate={
                            reducedMotion
                                ? undefined
                                : { opacity: [0.25, 1, 0.25], scale: [0.9, 1, 0.9] }
                        }
                        transition={{
                            duration: 1.5,
                            delay: index * 0.16,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                    />
                ))}
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
