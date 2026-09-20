"use client";

import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
    motion,
    type Variants,
    useAnimation,
    useInView,
    useMotionValueEvent,
    useReducedMotion,
    useScroll,
    useTransform,
} from "framer-motion";
import { useEffect, useRef } from "react";
import ReactDOM from "react-dom";

import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import LatestPosts from "@/components/stories/LatestPosts";
import { prefetchRaceTabData } from "@/lib/f1/race-prefetch";
import {
    HERO_CAR_ENVIRONMENT_PATH,
    HERO_CAR_LIVERY_PATH,
    HERO_CAR_MODEL_PATH,
} from "@/lib/hero-car-assets";
import gridPreview from "@/public/images/F1-images/enter-the-grid.webp";
import newLogo from "@/public/images/F1-images/newlogo3.png";

const HeroScene = dynamic(
    () => import("@/components/3d/HeroScene"),
    {
        ssr: false,
        loading: () => null,
    },
);

const GRID_TEXT_VARIANTS: Variants = {
    hiddenBelow: {
        opacity: 0,
        scale: 0.96,
        y: 120,
        filter: "blur(10px)",
    },
    visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        filter: "blur(0px)",
        transition: {
            duration: 0.8,
            ease: "easeOut",
        },
    },
    exitUp: {
        opacity: 0,
        scale: 0.98,
        y: -120,
        filter: "blur(8px)",
        transition: {
            duration: 0.55,
            ease: "easeIn",
        },
    },
    exitDown: {
        opacity: 0,
        scale: 0.98,
        y: 120,
        filter: "blur(8px)",
        transition: {
            duration: 0.55,
            ease: "easeIn",
        },
    },
};

const GRID_DETAILS_VARIANTS: Variants = {
    hiddenBelow: {
        opacity: 0,
        x: -80,
    },
    visible: {
        opacity: 1,
        x: 0,
        transition: {
            delay: 0.12,
            duration: 0.65,
            ease: "easeOut",
        },
    },
    exitUp: {
        opacity: 0,
        x: 80,
        transition: {
            duration: 0.45,
            ease: "easeIn",
        },
    },
    exitDown: {
        opacity: 0,
        x: -80,
        transition: {
            duration: 0.45,
            ease: "easeIn",
        },
    },
};

export default function Home(): React.ReactElement {
    ReactDOM.preload(HERO_CAR_MODEL_PATH, { as: "fetch", crossOrigin: "anonymous" });
    ReactDOM.preload(HERO_CAR_LIVERY_PATH, { as: "image" });
    ReactDOM.preload(HERO_CAR_ENVIRONMENT_PATH, { as: "fetch", crossOrigin: "anonymous" });

    const heroSectionRef = useRef<HTMLElement>(null);
    const gridSectionRef = useRef<HTMLElement>(null);
    const gridHasEnteredRef = useRef(false);
    const scrollDirectionRef = useRef<"down" | "up">("down");
    const reduceMotion = useReducedMotion();
    const gridIsInView = useInView(gridSectionRef, {
        amount: 0.25,
    });
    const gridTextControls = useAnimation();
    const gridDetailsControls = useAnimation();
    const { scrollY } = useScroll();
    const { scrollYProgress: heroScrollProgress } = useScroll({
        target: heroSectionRef,
        offset: ["start start", "end start"],
    });
    const heroContentOpacity = useTransform(
        heroScrollProgress,
        [0, 0.42, 0.82],
        [1, 1, 0],
    );
    const heroContentX = useTransform(
        heroScrollProgress,
        [0, 0.42, 0.82],
        [0, 0, -90],
    );
    const heroContentY = useTransform(
        heroScrollProgress,
        [0, 0.42, 0.82],
        [0, 0, -35],
    );

    useEffect(() => {
        void prefetchRaceTabData();
    }, []);

    useMotionValueEvent(scrollY, "change", (currentScrollY) => {
        const previousScrollY = scrollY.getPrevious();

        if (previousScrollY === undefined) {
            return;
        }

        scrollDirectionRef.current =
            currentScrollY > previousScrollY ? "down" : "up";
    });

    useEffect(() => {
        if (reduceMotion) {
            gridTextControls.set("visible");
            gridDetailsControls.set("visible");
            return;
        }

        if (gridIsInView) {
            gridHasEnteredRef.current = true;
            void gridTextControls.start("visible");
            void gridDetailsControls.start("visible");
            return;
        }

        if (!gridHasEnteredRef.current) {
            gridTextControls.set("hiddenBelow");
            gridDetailsControls.set("hiddenBelow");
            return;
        }

        const exitState =
            scrollDirectionRef.current === "down" ? "exitUp" : "exitDown";

        void gridTextControls.start(exitState);
        void gridDetailsControls.start(exitState);
    }, [
        gridDetailsControls,
        gridIsInView,
        gridTextControls,
        reduceMotion,
    ]);

    return (
        <>
            <Header />

            <main className="overflow-hidden bg-[#1c1c1c] text-white">
            <section
                ref={heroSectionRef}
                className="relative isolate overflow-hidden"
            >
                <div className="absolute inset-0 bg-[linear-gradient(120deg,#1c1c1c_0%,#1c1c1c_42%,#321f28_70%,#ee8434_150%)]" />

                <div className="absolute -right-40 top-20 h-[31.25rem] w-[31.25rem] rounded-full bg-[#ff729f]/15 blur-3xl" />

                <div className="absolute left-0 top-0 h-1 w-full bg-[linear-gradient(90deg,#ff729f,#ee8434)]" />

                <div className="relative mx-auto grid max-w-[77.5rem] items-center px-6 pb-16 pt-8 lg:grid-cols-[0.85fr_1.15fr] lg:px-10 lg:pb-24 lg:pt-12">
                    <motion.div
                        style={
                            reduceMotion
                                ? undefined
                                : {
                                      opacity: heroContentOpacity,
                                      x: heroContentX,
                                      y: heroContentY,
                                  }
                        }
                        className="relative z-10 max-w-[36.25rem]"
                    >
                        <motion.div
                            initial={{
                                opacity: 0,
                                x: -40,
                            }}
                            animate={{
                                opacity: 1,
                                x: 0,
                            }}
                            transition={{
                                duration: 0.8,
                                ease: [0.22, 1, 0.36, 1],
                            }}
                            className="mb-6 flex items-center gap-3"
                        >
                            <span className="h-2 w-2 bg-[#ff729f]" />

                            <span className="text-xs font-bold uppercase tracking-[0.28em] text-white/60">
                                Women in Motorsport
                            </span>
                        </motion.div>

                        <motion.img
                            initial={{
                                opacity: 0,
                                y: 20,
                            }}
                            animate={{
                                opacity: 1,
                                y: 0,
                            }}
                            transition={{
                                duration: 0.7,
                                delay: 0.35,
                            }}
                            src={newLogo.src}
                            alt="Fast Girls Club"
                            className="h-auto w-[450px] max-w-full"
                        />

                        <motion.p
                            initial={{
                                opacity: 0,
                                y: 20,
                            }}
                            animate={{
                                opacity: 1,
                                y: 0,
                            }}
                            transition={{
                                duration: 0.7,
                                delay: 0.35,
                            }}
                            className="mt-8 max-w-[26.25rem] text-base leading-7 text-white/65 md:text-lg"
                        >
                            Women in motorsport, racing news and the
                            grid guide. Built for the women driving
                            the future of racing.
                        </motion.p>

                        <motion.div
                            initial={{
                                opacity: 0,
                                y: 20,
                            }}
                            animate={{
                                opacity: 1,
                                y: 0,
                            }}
                            transition={{
                                duration: 0.7,
                                delay: 0.5,
                            }}
                            className="mt-9 flex flex-wrap items-center gap-4"
                        >
                            <Link
                                href="/f1"
                                className="bg-[#ff729f] px-7 py-4 text-xs font-black uppercase tracking-[0.18em] text-[#1c1c1c] transition-transform hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ff729f]"
                            >
                                Explore the grid
                            </Link>

                            <Link
                                href="#latest"
                                className="border border-white/25 px-7 py-4 text-xs font-black uppercase tracking-[0.18em] transition-colors hover:border-[#ff729f] hover:text-[#ff729f] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ff729f]"
                            >
                                Latest racing
                            </Link>
                        </motion.div>
                    </motion.div>

                    <div className="relative mt-8 h-[26.25rem] lg:mt-0 lg:h-[40rem]">
                        <div className="absolute right-0 top-1/2 h-[17.5rem] w-[17.5rem] -translate-y-1/2 rounded-full bg-[#ff729f]/10 blur-3xl lg:h-[26.25rem] lg:w-[26.25rem]" />

                        <div className="absolute right-0 top-1/2 h-px w-full -translate-y-1/2 bg-white/10" />

                        <div className="absolute right-0 top-8 text-[10px] font-bold uppercase tracking-[0.3em] text-white/30">
                            FGC / 001
                        </div>

                        <HeroScene />

                        <div className="absolute bottom-0 right-0 z-10 text-right">
                            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/35">
                                Full throttle
                            </p>

                            <p className="mt-1 text-sm font-black uppercase tracking-[0.12em] text-[#ff729f]">
                                No limits
                            </p>
                        </div>
                    </div>
                </div>

                <div className="relative z-10 border-y border-white/10 bg-black/20">
                    <div className="mx-auto flex max-w-[77.5rem] items-center justify-between gap-6 overflow-hidden px-6 py-5 lg:px-10">
                        <span className="whitespace-nowrap text-[10px] font-bold uppercase tracking-[0.3em] text-white/35">
                            Motorsport
                        </span>

                        <span className="h-px flex-1 bg-white/10" />

                        <span className="whitespace-nowrap text-[10px] font-bold uppercase tracking-[0.3em] text-white/35">
                            Women
                        </span>

                        <span className="h-px flex-1 bg-white/10" />

                        <span className="whitespace-nowrap text-[10px] font-bold uppercase tracking-[0.3em] text-white/35">
                            Racing
                        </span>

                        <span className="h-px flex-1 bg-white/10" />

                        <span className="whitespace-nowrap text-[10px] font-bold uppercase tracking-[0.3em] text-white/35">
                            Culture
                        </span>
                    </div>
                </div>
            </section>

            <section
                id="latest"
                className="relative isolate scroll-mt-24 overflow-hidden bg-[#e6e6e6] px-6 py-8 text-[#1c1c1c] lg:px-10 lg:py-14"
            >
                <div
                    aria-hidden="true"
                    className="absolute inset-y-0 right-0 -z-10 w-2/5 bg-[linear-gradient(135deg,transparent_15%,rgba(255,114,159,0.08)_100%)]"
                />

                <div
                    aria-hidden="true"
                    className="absolute -right-8 top-3 -z-10 hidden text-[clamp(10rem,19vw,18rem)] font-black uppercase leading-none tracking-[-0.1em] text-[#1c1c1c]/[0.025] lg:block"
                >
                    Race
                </div>

                <div className="absolute left-0 top-0 h-1 w-full bg-[linear-gradient(90deg,#ff729f,#ee8434,transparent_82%)]" />

                <div className="relative mx-auto max-w-[77.5rem]">
                    <div className="flex flex-col justify-between gap-5 border-b border-[#1c1c1c]/15 pb-6 md:flex-row md:items-end">
                        <motion.div
                            initial={
                                reduceMotion
                                    ? false
                                    : {
                                          opacity: 0,
                                          x: -90,
                                      }
                            }
                            whileInView={{
                                opacity: 1,
                                x: 0,
                            }}
                            viewport={{
                                amount: 0.45,
                                once: false,
                            }}
                            transition={{
                                duration: 0.75,
                                ease: [0.22, 1, 0.36, 1],
                            }}
                        >
                            <div className="mb-3 flex items-center gap-3">
                                <span className="h-2 w-2 bg-[#ee8434]" />

                                <p className="text-xs font-black uppercase tracking-[0.25em] text-[#c85f22]">
                                    The latest
                                </p>

                                <span className="h-px w-10 bg-[#ff729f]" />
                            </div>

                            <h2 className="text-5xl font-black uppercase leading-[0.84] tracking-[-0.065em] md:text-7xl">
                                Race
                                <br />
                                <span className="relative inline-block">
                                    Report
                                    <span className="absolute -bottom-3 left-1 h-1 w-24 bg-[linear-gradient(90deg,#ff729f,#ee8434)] md:w-36" />
                                </span>
                                <span className="text-[#ff729f]">.</span>
                            </h2>
                        </motion.div>

                        <motion.div
                            initial={
                                reduceMotion
                                    ? false
                                    : {
                                          opacity: 0,
                                          x: -60,
                                      }
                            }
                            whileInView={{
                                opacity: 1,
                                x: 0,
                            }}
                            viewport={{
                                amount: 0.6,
                                once: false,
                            }}
                            transition={{
                                delay: 0.12,
                                duration: 0.65,
                                ease: [0.22, 1, 0.36, 1],
                            }}
                            className="max-w-[20rem]"
                        >
                            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#ff729f]">
                                Fast stories. Fresh perspective.
                            </p>

                            <p className="mt-3 text-sm leading-6 text-[#1c1c1c]/65">
                                The stories, people and moments shaping
                                women&apos;s motorsport.
                            </p>
                        </motion.div>
                    </div>

                    <LatestPosts />
                </div>
            </section>

            <section
                id="f1-data"
                ref={gridSectionRef}
                className="relative isolate overflow-hidden bg-[#151515] px-6 py-24 md:py-32 lg:px-10 lg:py-40"
            >
                <Image
                    src={gridPreview}
                    alt=""
                    fill
                    placeholder="blur"
                    sizes="100vw"
                    className="-z-30 object-cover object-center"
                />

                <div className="absolute inset-0 -z-20 bg-black/55 md:bg-black/35" />

                <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(21,21,21,0.98)_0%,rgba(21,21,21,0.9)_38%,rgba(21,21,21,0.34)_72%,rgba(21,21,21,0.5)_100%)]" />

                <div className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,#ff729f,#ee8434,transparent_88%)]" />

                <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#151515] to-transparent" />

                <div className="relative mx-auto max-w-[77.5rem]">
                    <motion.div
                        variants={GRID_TEXT_VARIANTS}
                        initial={reduceMotion ? "visible" : "hiddenBelow"}
                        animate={gridTextControls}
                        className="max-w-[47rem]"
                    >
                        <div className="flex flex-wrap items-center gap-3">
                            <span className="h-2.5 w-2.5 bg-[#ff729f] shadow-[0_0_24px_rgba(255,114,159,0.85)]" />

                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/80">
                                FGC / The Grid
                            </span>

                            <span className="h-px w-8 bg-[#ee8434]" />

                            <span className="text-[10px] font-black uppercase tracking-[0.24em] text-[#ffaf72]">
                                Current season
                            </span>
                        </div>

                        <h2
                            className="mt-7 text-[clamp(3.75rem,10vw,8.5rem)] font-black uppercase leading-[0.78] tracking-[-0.075em]"
                            style={{
                                textShadow:
                                    "0 5px 34px rgba(0, 0, 0, 0.8)",
                            }}
                        >
                            Enter
                            <br />
                            <span className="text-[#ff729f]">
                                The Grid
                            </span>
                            <span className="text-[#ee8434]">.</span>
                        </h2>

                        <p className="mt-7 text-sm font-black uppercase tracking-[0.24em] text-[#ffaf72] md:text-base">
                            Lights out. Data on.
                        </p>

                        <p className="mt-5 max-w-[35rem] text-base font-medium leading-7 text-white/85 drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)] md:text-lg md:leading-8">
                            Live timing, championship standings and every
                            race on the calendar. Your complete Formula 1
                            season starts here.
                        </p>
                    </motion.div>

                    <motion.div
                        variants={GRID_DETAILS_VARIANTS}
                        initial={reduceMotion ? "visible" : "hiddenBelow"}
                        animate={gridDetailsControls}
                        className="mt-9 flex max-w-[46rem] flex-col gap-6"
                    >
                        <div className="flex flex-wrap gap-2">
                            {[
                                "Live Timing",
                                "Drivers",
                                "Constructors",
                                "Race Calendar",
                            ].map((item) => (
                                <span
                                    key={item}
                                    className="border border-white/25 bg-black/40 px-3 py-2 text-[9px] font-black uppercase tracking-[0.16em] text-white/80 backdrop-blur-sm"
                                >
                                    {item}
                                </span>
                            ))}
                        </div>

                        <Link
                            href="/f1"
                            className="group inline-flex w-fit items-center gap-5 bg-[#ff729f] px-7 py-4 text-xs font-black uppercase tracking-[0.2em] text-[#1c1c1c] shadow-[0_12px_40px_rgba(255,114,159,0.28)] transition hover:-translate-y-1 hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                        >
                            Enter the Grid
                            <span
                                aria-hidden="true"
                                className="text-lg leading-none transition-transform group-hover:translate-x-1"
                            >
                                →
                            </span>
                        </Link>
                    </motion.div>
                </div>
            </section>

            <section
                id="racing"
                className="relative isolate overflow-hidden bg-[#1c1c1c] px-6 py-10 lg:px-10 lg:py-16"
            >
                <div className="absolute right-0 top-0 -z-20 h-full w-1/2 bg-[linear-gradient(135deg,transparent_0%,rgba(255,114,159,0.11)_100%)]" />

                <div className="absolute -left-24 bottom-0 -z-20 h-72 w-72 rounded-full bg-[#ee8434]/10 blur-3xl" />

                <div
                    aria-hidden="true"
                    className="absolute -right-8 top-1/2 -z-10 hidden -translate-y-1/2 text-[clamp(9rem,20vw,19rem)] font-black uppercase leading-none tracking-[-0.1em] text-white/[0.025] lg:block"
                >
                    Future
                </div>

                <div className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,#ff729f,#ee8434,transparent_82%)]" />

                <div className="relative mx-auto max-w-[77.5rem]">
                    <motion.div
                        initial={
                            reduceMotion
                                ? false
                                : {
                                      opacity: 0,
                                      x: -55,
                                  }
                        }
                        whileInView={{
                            opacity: 1,
                            x: 0,
                        }}
                        viewport={{
                            amount: 0.55,
                            once: false,
                        }}
                        transition={{
                            duration: 0.6,
                            ease: [0.22, 1, 0.36, 1],
                        }}
                        className="flex items-center gap-3"
                    >
                        <span className="h-2 w-2 bg-[#ee8434] shadow-[0_0_18px_rgba(238,132,52,0.55)]" />

                        <p className="text-xs font-black uppercase tracking-[0.25em] text-[#ff729f]">
                            Fast Girls Club
                        </p>

                        <span className="h-px w-10 bg-[#ee8434]" />
                    </motion.div>

                    <div className="mt-5 grid gap-10 lg:grid-cols-[1fr_0.7fr]">
                        <motion.h2
                            initial={
                                reduceMotion
                                    ? false
                                    : {
                                          opacity: 0,
                                          x: -110,
                                      }
                            }
                            whileInView={{
                                opacity: 1,
                                x: 0,
                            }}
                            viewport={{
                                amount: 0.3,
                                once: false,
                            }}
                            transition={{
                                duration: 0.8,
                                ease: [0.22, 1, 0.36, 1],
                            }}
                            className="text-[clamp(3.5rem,8vw,8rem)] font-black uppercase leading-[0.82] tracking-[-0.055em]"
                        >
                            Fast
                            <br />
                            Women.
                            <br />
                            <span className="text-[#ff729f]">Faster</span>
                            <br />
                            Future.
                        </motion.h2>

                        <motion.div
                            initial={
                                reduceMotion
                                    ? false
                                    : {
                                          opacity: 0,
                                          y: 85,
                                      }
                            }
                            whileInView={{
                                opacity: 1,
                                y: 0,
                            }}
                            viewport={{
                                amount: 0.45,
                                once: false,
                            }}
                            transition={{
                                delay: 0.14,
                                duration: 0.7,
                                ease: [0.22, 1, 0.36, 1],
                            }}
                            className="flex items-end"
                        >
                            <div className="max-w-[27.5rem] border-l border-[#ff729f]/45 pl-6">
                                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#ffaf72]">
                                    Driven differently
                                </p>

                                <p className="mt-4 text-base leading-7 text-white/65 md:text-lg">
                                Fast Girls Club exists to put women in
                                motorsport front and centre. From the
                                paddock to the podium, this is racing
                                through a different lens.
                                </p>

                                <div className="mt-6 flex items-center gap-3 text-[9px] font-black uppercase tracking-[0.22em] text-white/35">
                                    <span>Racing</span>
                                    <span className="h-1 w-1 bg-[#ff729f]" />
                                    <span>Culture</span>
                                    <span className="h-1 w-1 bg-[#ee8434]" />
                                    <span>Community</span>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            <Footer />
            </main>
        </>
    );
}
