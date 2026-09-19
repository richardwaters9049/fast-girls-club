"use client";

import { motion, type Variants, useReducedMotion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import gridPreview from "@/public/images/F1-images/enter-the-grid.webp";

const EASE = [0.22, 1, 0.36, 1] as const;

const revealVariants: Variants = {
    hidden: {
        opacity: 0,
        y: 54,
    },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.75,
            ease: EASE,
        },
    },
};

const values = [
    {
        number: "01",
        title: "Celebrate",
        copy: "We put the women changing motorsport in the spotlight — from the drivers on the grid to the people shaping everything behind it.",
    },
    {
        number: "02",
        title: "Explain",
        copy: "We make racing easier to follow without flattening what makes it fascinating. No gatekeeping, no assumed knowledge and no silly questions.",
    },
    {
        number: "03",
        title: "Connect",
        copy: "We are building a place where new fans and lifelong race lovers can share the noise, nerves and joy of a weekend at full speed.",
    },
];

export default function AboutPage(): React.ReactElement {
    const reduceMotion = useReducedMotion();
    const initialState = reduceMotion ? false : "hidden";

    return (
        <main className="overflow-hidden bg-[#1c1c1c] text-white">
            <section className="relative isolate min-h-[46rem] overflow-hidden border-b border-white/10">
                <div className="absolute inset-0 -z-30 bg-[linear-gradient(125deg,#1c1c1c_0%,#1c1c1c_48%,#38212b_78%,#6f372e_140%)]" />

                <div className="absolute -right-40 top-20 -z-20 h-[34rem] w-[34rem] rounded-full bg-[#ff729f]/15 blur-3xl" />

                <div
                    aria-hidden="true"
                    className="absolute -bottom-12 -right-6 -z-10 hidden text-[clamp(14rem,28vw,28rem)] font-black uppercase leading-none tracking-[-0.12em] text-white/[0.025] md:block"
                >
                    FGC
                </div>

                <div className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,#ff729f,#ee8434,transparent_85%)]" />

                <Header />

                <div className="relative mx-auto flex min-h-[39rem] max-w-[77.5rem] flex-col justify-center px-6 py-20 lg:px-10 lg:py-28">
                    <motion.div
                        initial={
                            reduceMotion
                                ? false
                                : {
                                      opacity: 0,
                                      x: -45,
                                  }
                        }
                        animate={{
                            opacity: 1,
                            x: 0,
                        }}
                        transition={{
                            duration: 0.65,
                            ease: EASE,
                        }}
                        className="flex items-center gap-3"
                    >
                        <span className="h-2 w-2 bg-[#ff729f] shadow-[0_0_20px_rgba(255,114,159,0.65)]" />

                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60">
                            About Fast Girls Club
                        </p>

                        <span className="h-px w-12 bg-[#ee8434]" />
                    </motion.div>

                    <motion.h1
                        initial={
                            reduceMotion
                                ? false
                                : {
                                      opacity: 0,
                                      y: 65,
                                  }
                        }
                        animate={{
                            opacity: 1,
                            y: 0,
                        }}
                        transition={{
                            delay: 0.08,
                            duration: 0.9,
                            ease: EASE,
                        }}
                        className="mt-8 max-w-[65rem] text-[clamp(4rem,11vw,9.75rem)] font-black uppercase leading-[0.77] tracking-[-0.075em]"
                    >
                        Racing is
                        <br />
                        <span className="text-[#ff729f]">better</span> with
                        <br />
                        more women
                        <span className="text-[#ee8434]">.</span>
                    </motion.h1>

                    <motion.div
                        initial={
                            reduceMotion
                                ? false
                                : {
                                      opacity: 0,
                                      y: 24,
                                  }
                        }
                        animate={{
                            opacity: 1,
                            y: 0,
                        }}
                        transition={{
                            delay: 0.32,
                            duration: 0.7,
                            ease: EASE,
                        }}
                        className="mt-10 flex max-w-[47rem] flex-col gap-5 border-l border-[#ff729f]/50 pl-6 sm:flex-row sm:items-end sm:justify-between"
                    >
                        <p className="max-w-[34rem] text-base leading-7 text-white/65 md:text-lg md:leading-8">
                            Fast Girls Club is an independent space for
                            women who love racing, want to understand it,
                            or are simply curious about where to begin.
                        </p>

                        <p className="text-[9px] font-black uppercase tracking-[0.25em] text-[#ffaf72]">
                            Est. for the next generation
                        </p>
                    </motion.div>
                </div>
            </section>

            <div className="border-b border-[#1c1c1c]/10 bg-[#ff729f] text-[#1c1c1c]">
                <div className="mx-auto flex max-w-[77.5rem] items-center gap-5 overflow-hidden px-6 py-4 text-[10px] font-black uppercase tracking-[0.25em] lg:px-10">
                    <span className="whitespace-nowrap">Stories</span>
                    <span className="h-1 w-1 shrink-0 bg-[#1c1c1c]" />
                    <span className="whitespace-nowrap">Racing</span>
                    <span className="h-px min-w-12 flex-1 bg-[#1c1c1c]/30" />
                    <span className="whitespace-nowrap">Culture</span>
                    <span className="h-1 w-1 shrink-0 bg-[#1c1c1c]" />
                    <span className="whitespace-nowrap">Community</span>
                </div>
            </div>

            <section className="relative isolate bg-[#e8e6e3] px-6 py-20 text-[#1c1c1c] lg:px-10 lg:py-28">
                <div className="absolute right-0 top-0 -z-10 h-full w-2/5 bg-[linear-gradient(145deg,transparent,rgba(255,114,159,0.1))]" />

                <div className="mx-auto grid max-w-[77.5rem] gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-20">
                    <motion.div
                        variants={revealVariants}
                        initial={initialState}
                        whileInView="visible"
                        viewport={{
                            amount: 0.25,
                            once: true,
                        }}
                    >
                        <div className="flex items-center gap-3">
                            <span className="h-2 w-2 bg-[#ee8434]" />
                            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[#b95322]">
                                Why we&apos;re here
                            </p>
                        </div>

                        <h2 className="mt-6 text-[clamp(3.5rem,7vw,7rem)] font-black uppercase leading-[0.82] tracking-[-0.07em]">
                            A different
                            <br />
                            lens on
                            <br />
                            <span className="text-[#d94f7d]">the grid.</span>
                        </h2>

                        <p className="mt-8 max-w-[31rem] text-base leading-7 text-[#1c1c1c]/65 md:text-lg md:leading-8">
                            Motorsport has never lacked brilliant women. It
                            has often lacked the space, attention and
                            storytelling they deserve. We are here to help
                            change that — one story, race and new fan at a
                            time.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={
                            reduceMotion
                                ? false
                                : {
                                      opacity: 0,
                                      x: 70,
                                      scale: 0.97,
                                  }
                        }
                        whileInView={{
                            opacity: 1,
                            x: 0,
                            scale: 1,
                        }}
                        viewport={{
                            amount: 0.25,
                            once: true,
                        }}
                        transition={{
                            duration: 0.85,
                            ease: EASE,
                        }}
                        className="relative aspect-[4/5] overflow-hidden bg-[#1c1c1c] sm:aspect-[16/11] lg:aspect-[4/5]"
                    >
                        <Image
                            src={gridPreview}
                            alt="A Formula 1 car racing through a neon-lit data tunnel"
                            fill
                            placeholder="blur"
                            sizes="(max-width: 1023px) 100vw, 50vw"
                            className="object-cover object-center"
                        />

                        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_30%,rgba(28,28,28,0.88)_100%)]" />

                        <div className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,#ff729f,#ee8434)]" />

                        <div className="absolute bottom-0 left-0 max-w-[25rem] p-7 text-white md:p-9">
                            <p className="text-[9px] font-black uppercase tracking-[0.26em] text-[#ffafc8]">
                                Our point of view
                            </p>
                            <p className="mt-4 text-2xl font-black uppercase leading-[0.95] tracking-[-0.04em] md:text-4xl">
                                Serious about racing. Never too serious about
                                ourselves.
                            </p>
                        </div>
                    </motion.div>
                </div>
            </section>

            <section className="relative border-y border-white/10 bg-[#151515] px-6 py-20 lg:px-10 lg:py-28">
                <div className="mx-auto max-w-[77.5rem]">
                    <motion.div
                        variants={revealVariants}
                        initial={initialState}
                        whileInView="visible"
                        viewport={{
                            amount: 0.4,
                            once: true,
                        }}
                        className="flex flex-col justify-between gap-5 border-b border-white/10 pb-8 md:flex-row md:items-end"
                    >
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[#ff729f]">
                                What drives us
                            </p>
                            <h2 className="mt-4 text-5xl font-black uppercase tracking-[-0.06em] md:text-7xl">
                                Our values<span className="text-[#ee8434]">.</span>
                            </h2>
                        </div>

                        <p className="max-w-[25rem] text-sm leading-6 text-white/45">
                            The principles behind every story we publish and
                            every space we create.
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-3">
                        {values.map((value, index) => (
                            <motion.article
                                key={value.number}
                                initial={
                                    reduceMotion
                                        ? false
                                        : {
                                              opacity: 0,
                                              y: 70,
                                          }
                                }
                                whileInView={{
                                    opacity: 1,
                                    y: 0,
                                }}
                                viewport={{
                                    amount: 0.3,
                                    once: true,
                                }}
                                transition={{
                                    delay: index * 0.12,
                                    duration: 0.7,
                                    ease: EASE,
                                }}
                                className="group relative border-b border-white/10 py-9 md:border-b-0 md:border-r md:px-8 md:py-12 md:first:pl-0 md:last:border-r-0 md:last:pr-0"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-black tracking-[0.2em] text-[#ff729f]">
                                        {value.number}
                                    </span>
                                    <span className="h-px w-10 bg-white/15 transition-all duration-500 group-hover:w-20 group-hover:bg-[#ee8434]" />
                                </div>

                                <h3 className="mt-16 text-4xl font-black uppercase tracking-[-0.055em] transition-colors duration-300 group-hover:text-[#ff729f]">
                                    {value.title}
                                    <span className="text-[#ee8434]">.</span>
                                </h3>

                                <p className="mt-5 max-w-[20rem] text-sm leading-6 text-white/50">
                                    {value.copy}
                                </p>
                            </motion.article>
                        ))}
                    </div>
                </div>
            </section>

            <section className="relative isolate overflow-hidden bg-[#ff729f] px-6 py-20 text-[#1c1c1c] lg:px-10 lg:py-28">
                <div
                    aria-hidden="true"
                    className="absolute -bottom-10 -right-6 -z-10 text-[clamp(10rem,25vw,24rem)] font-black uppercase leading-none tracking-[-0.1em] text-white/10"
                >
                    Fast
                </div>

                <motion.div
                    variants={revealVariants}
                    initial={initialState}
                    whileInView="visible"
                    viewport={{
                        amount: 0.35,
                        once: true,
                    }}
                    className="relative mx-auto max-w-[77.5rem]"
                >
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#1c1c1c]/55">
                        The manifesto
                    </p>

                    <blockquote className="mt-7 max-w-[69rem] text-[clamp(3.2rem,8vw,8rem)] font-black uppercase leading-[0.82] tracking-[-0.07em]">
                        We don&apos;t wait for permission to take up space.
                    </blockquote>

                    <div className="mt-10 flex flex-col justify-between gap-7 border-t border-[#1c1c1c]/20 pt-7 md:flex-row md:items-center">
                        <p className="max-w-[34rem] text-base font-medium leading-7 text-[#1c1c1c]/65">
                            This is a placeholder manifesto for the community
                            we want to build: informed, welcoming, ambitious
                            and loud enough to be heard over the engines.
                        </p>

                        <span className="text-[10px] font-black uppercase tracking-[0.24em]">
                            Fast women. Faster future.
                        </span>
                    </div>
                </motion.div>
            </section>

            <section className="bg-[#e8e6e3] px-6 py-20 text-[#1c1c1c] lg:px-10 lg:py-28">
                <motion.div
                    variants={revealVariants}
                    initial={initialState}
                    whileInView="visible"
                    viewport={{
                        amount: 0.35,
                        once: true,
                    }}
                    className="mx-auto flex max-w-[77.5rem] flex-col justify-between gap-10 md:flex-row md:items-end"
                >
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[#c85f22]">
                            Start your engines
                        </p>
                        <h2 className="mt-5 text-[clamp(3.5rem,7vw,7rem)] font-black uppercase leading-[0.84] tracking-[-0.07em]">
                            Find your place
                            <br />
                            on the grid<span className="text-[#d94f7d]">.</span>
                        </h2>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <Link
                            href="/blog"
                            className="bg-[#1c1c1c] px-7 py-4 text-xs font-black uppercase tracking-[0.18em] text-white transition hover:-translate-y-1 hover:bg-[#d94f7d] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#d94f7d]"
                        >
                            Read the stories
                        </Link>

                        <Link
                            href="/f1"
                            className="border border-[#1c1c1c]/25 px-7 py-4 text-xs font-black uppercase tracking-[0.18em] transition hover:-translate-y-1 hover:border-[#d94f7d] hover:text-[#d94f7d] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#d94f7d]"
                        >
                            Enter the Grid →
                        </Link>
                    </div>
                </motion.div>
            </section>

            <Footer />
        </main>
    );
}
