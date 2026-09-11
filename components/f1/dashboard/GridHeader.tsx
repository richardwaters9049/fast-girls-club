"use client";

import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import CategoryTag from "@/components/ui/CategoryTag";
import Container from "@/components/ui/Container";

import type { F1Series } from "@/lib/f1/calendar";

interface GridHeaderProps {
    activeSeries: F1Series;
    onSeriesChange: (series: F1Series) => void;
}

export default function GridHeader({
    activeSeries,
    onSeriesChange,
}: GridHeaderProps): React.ReactElement {
    return (
        <section className="relative overflow-hidden border-b border-white/10">
            <div className="absolute inset-0 bg-[linear-gradient(125deg,#1c1c1c_0%,#211c1f_55%,#332029_100%)]" />

            <div className="absolute right-[-8rem] top-[-10rem] h-[24rem] w-[24rem] rounded-full bg-[#ff729f]/10 blur-3xl" />

            <Container
                size="wide"
                className="relative py-5 md:py-6"
            >
                <div className="flex items-center justify-between gap-6">
                    <motion.div
                        initial={{
                            opacity: 0,
                            x: -20,
                        }}
                        animate={{
                            opacity: 1,
                            x: 0,
                        }}
                        transition={{
                            duration: 0.5,
                        }}
                        className="flex min-w-0 items-center gap-5"
                    >
                        <div className="shrink-0">
                            <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-white/40">
                                Fast Girls
                            </p>

                            <h1 className="mt-0.5 text-4xl font-black uppercase leading-none tracking-[-0.07em] text-white md:text-5xl">
                                The
                                <span className="ml-2 text-[#ff729f]">
                                    Grid.
                                </span>
                            </h1>
                        </div>

                        <div className="hidden h-10 w-px bg-white/10 sm:block" />

                        <div className="hidden items-center gap-3 sm:flex">
                            <CategoryTag accent="pink">
                                2026
                            </CategoryTag>

                            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/45">
                                Motorsport intelligence
                            </span>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{
                            opacity: 0,
                            x: 20,
                        }}
                        animate={{
                            opacity: 1,
                            x: 0,
                        }}
                        transition={{
                            duration: 0.5,
                            delay: 0.1,
                        }}
                        className="shrink-0"
                    >
                        <div className="flex items-center gap-1 border border-white/10 bg-black/15 p-1">
                            {(["f1", "f2", "f3"] as F1Series[]).map(
                                (series) => (
                                    <Button
                                        key={series}
                                        type="button"
                                        variant={
                                            activeSeries === series
                                                ? "default"
                                                : "ghost"
                                        }
                                        onClick={() =>
                                            onSeriesChange(series)
                                        }
                                        className={`cursor-pointer px-4 text-[9px] font-black uppercase tracking-[0.16em] hover:bg-transparent ${activeSeries === series
                                            ? "bg-white text-[#1c1c1c] hover:bg-white hover:text-[#1c1c1c]"
                                            : "text-white/50 hover:text-white"
                                            }`}
                                    >
                                        {series.toUpperCase()}
                                    </Button>
                                ),
                            )}
                        </div>
                    </motion.div>
                </div>
            </Container>
        </section>
    );
}