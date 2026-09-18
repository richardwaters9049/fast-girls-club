"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";

import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import LatestPosts from "@/components/stories/LatestPosts";
import newLogo from "@/public/images/F1-images/newlogo3.png";

const HeroScene = dynamic(
    () => import("@/components/3d/HeroScene"),
    {
        ssr: false,
        loading: () => null,
    },
);

export default function Home(): React.ReactElement {
    return (
        <main className="overflow-hidden bg-[#1c1c1c] text-white">
            <section className="relative isolate overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(120deg,#1c1c1c_0%,#1c1c1c_42%,#321f28_70%,#ee8434_150%)]" />

                <div className="absolute -right-40 top-20 h-[31.25rem] w-[31.25rem] rounded-full bg-[#ff729f]/15 blur-3xl" />

                <div className="absolute left-0 top-0 h-1 w-full bg-[linear-gradient(90deg,#ff729f,#ee8434)]" />

                <Header />

                <div className="relative mx-auto grid max-w-[77.5rem] items-center px-6 pb-16 pt-8 lg:grid-cols-[0.85fr_1.15fr] lg:px-10 lg:pb-24 lg:pt-12">
                    <div className="relative z-10 max-w-[36.25rem]">
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
                                className="bg-[#ff729f] px-7 py-4 text-xs font-black uppercase tracking-[0.18em] text-[#1c1c1c] transition-transform hover:-translate-y-1"
                            >
                                Explore the grid
                            </Link>

                            <Link
                                href="#latest"
                                className="border border-white/25 px-7 py-4 text-xs font-black uppercase tracking-[0.18em] transition-colors hover:border-[#ff729f] hover:text-[#ff729f]"
                            >
                                Latest racing
                            </Link>
                        </motion.div>
                    </div>

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
                className="bg-[#e6e6e6] px-6 py-8 text-[#1c1c1c] lg:px-10 lg:py-14"
            >
                <div className="mx-auto max-w-[77.5rem]">
                    <div className="flex flex-col justify-between gap-5 border-b border-[#1c1c1c]/15 pb-6 md:flex-row md:items-end">
                        <div>
                            <p className="mb-3 text-xs font-black uppercase tracking-[0.25em] text-[#ee8434]">
                                The latest
                            </p>

                            <h2 className="text-5xl font-black uppercase tracking-[-0.06em] md:text-7xl">
                                Race
                                <br />
                                Report
                                <span className="text-[#ff729f]">.</span>
                            </h2>
                        </div>

                        <p className="max-w-[20rem] text-sm leading-6 text-[#1c1c1c]/60">
                            The stories, people and moments shaping
                            women&apos;s motorsport.
                        </p>
                    </div>

                    <LatestPosts />
                </div>
            </section>

            <section
                id="f1-data"
                className="relative overflow-hidden bg-[#151515] px-6 py-12 lg:px-10 lg:py-20"
            >
                <div className="absolute -right-32 -top-32 h-[32rem] w-[32rem] rounded-full bg-[#ff729f]/10 blur-3xl" />

                <div className="absolute bottom-0 left-0 h-px w-full bg-[linear-gradient(90deg,transparent,#ff729f,transparent)] opacity-30" />

                <div className="relative mx-auto max-w-[77.5rem]">
                    <div className="flex flex-col justify-between gap-5 border-b border-white/10 pb-7 md:flex-row md:items-end">
                        <div>
                            <div className="flex items-center gap-3">
                                <span className="h-2 w-2 bg-[#ff729f]" />

                                <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-white/45">
                                    FGC / The Grid
                                </p>
                            </div>

                            <h2 className="mt-4 text-5xl font-black uppercase tracking-[-0.06em] md:text-7xl">
                                Enter
                                <br />
                                The Grid
                                <span className="text-[#ff729f]">.</span>
                            </h2>

                            <p className="mt-5 max-w-[32rem] text-sm leading-6 text-white/45 md:text-base">
                                Your complete F1 season hub. Follow the
                                racing, explore the championship and keep
                                up with every round of the current calendar.
                            </p>
                        </div>

                        <Link
                            href="/f1"
                            className="inline-flex items-center self-start border border-white/20 px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-colors hover:border-[#ff729f] hover:text-[#ff729f] md:self-auto"
                        >
                            Open the Grid →
                        </Link>
                    </div>

                    <Link
                        href="/f1"
                        className="group mt-8 block"
                    >
                        <div className="relative overflow-hidden border border-white/10 bg-[#1c1c1c] transition-transform duration-500 group-hover:-translate-y-1">
                            <div className="absolute left-0 top-0 h-1 w-full bg-[linear-gradient(90deg,#ff729f,#ee8434)]" />

                            <div className="relative grid gap-10 p-6 md:p-8 lg:grid-cols-[1fr_0.8fr] lg:items-center lg:p-12">
                                <div className="relative z-10">
                                    <div className="flex items-center gap-3">
                                        <span className="border border-[#ff729f]/30 bg-[#ff729f]/10 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#ff729f]">
                                            Current season
                                        </span>

                                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/25">
                                            F1 / Live / Data
                                        </span>
                                    </div>

                                    <h3 className="mt-8 max-w-[30rem] text-4xl font-black uppercase leading-[0.9] tracking-[-0.06em] sm:text-5xl md:text-6xl">
                                        Everything
                                        <br />
                                        starts
                                        <br />
                                        <span className="text-[#ff729f]">
                                            here.
                                        </span>
                                    </h3>

                                    <p className="mt-7 max-w-[28rem] text-sm leading-6 text-white/45 md:text-base">
                                        Explore live timing, driver
                                        standings, constructor
                                        championships and the complete
                                        race calendar in one dedicated
                                        racing hub.
                                    </p>

                                    <div className="mt-8 flex flex-wrap gap-2">
                                        {[
                                            "Live Timing",
                                            "Drivers",
                                            "Teams",
                                            "Race Calendar",
                                        ].map((item) => (
                                            <span
                                                key={item}
                                                className="border border-white/10 px-3 py-2 text-[9px] font-bold uppercase tracking-[0.14em] text-white/40"
                                            >
                                                {item}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="relative flex min-h-[18rem] items-center justify-center overflow-hidden border border-white/10 bg-[#121212] md:min-h-[24rem]">
                                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,114,159,0.12),transparent_65%)]" />

                                    <div className="absolute left-1/2 top-1/2 h-px w-[150%] -translate-x-1/2 -translate-y-1/2 rotate-[-24deg] bg-white/10" />

                                    <div className="absolute left-1/2 top-1/2 h-px w-[150%] -translate-x-1/2 -translate-y-1/2 rotate-[24deg] bg-white/10" />

                                    <div className="absolute left-8 top-8 text-[10px] font-bold uppercase tracking-[0.25em] text-white/25">
                                        FGC / 026
                                    </div>

                                    <div className="absolute bottom-8 right-8 text-right">
                                        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/25">
                                            Championship
                                        </p>

                                        <p className="mt-2 text-sm font-black uppercase tracking-[0.15em] text-[#ee8434]">
                                            Full season
                                        </p>
                                    </div>

                                    <div className="relative">
                                        <span className="block text-[11rem] font-black leading-none tracking-[-0.16em] text-white/[0.04] sm:text-[15rem]">
                                            01
                                        </span>

                                        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-5xl font-black uppercase tracking-[-0.08em] text-white/90 sm:text-6xl">
                                            F1
                                        </span>
                                    </div>

                                    <div className="absolute bottom-8 left-8 flex items-center gap-3">
                                        <span className="h-2 w-2 bg-[#ff729f]" />

                                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/35">
                                            The Grid awaits
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col justify-between gap-4 border-t border-white/10 bg-black/20 px-6 py-5 md:flex-row md:items-center md:px-8">
                                <div className="flex items-center gap-3">
                                    <span className="h-2 w-2 bg-[#ff729f]" />

                                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/35">
                                        Your F1 season starts here
                                    </span>
                                </div>

                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/45 transition-colors group-hover:text-[#ff729f]">
                                    Enter the Grid →
                                </span>
                            </div>
                        </div>
                    </Link>
                </div>
            </section>

            <section
                id="racing"
                className="relative overflow-hidden bg-[#1c1c1c] px-6 py-10 lg:px-10 lg:py-16"
            >
                <div className="absolute right-0 top-0 h-full w-1/3 bg-[linear-gradient(135deg,transparent_0%,rgba(255,114,159,0.08)_100%)]" />

                <div className="relative mx-auto max-w-[77.5rem]">
                    <p className="text-xs font-black uppercase tracking-[0.25em] text-[#ff729f]">
                        Fast Girls Club
                    </p>

                    <div className="mt-5 grid gap-10 lg:grid-cols-[1fr_0.7fr]">
                        <h2 className="text-[clamp(3.5rem,8vw,8rem)] font-black uppercase leading-[0.82]">
                            Fast
                            <br />
                            Women.
                            <br />
                            <span className="text-[#ff729f]">
                                Faster
                            </span>
                            <br />
                            Future.
                        </h2>

                        <div className="flex items-end">
                            <p className="max-w-[27.5rem] text-base leading-7 text-white/50 md:text-lg">
                                Fast Girls Club exists to put women in
                                motorsport front and centre. From the
                                paddock to the podium, this is racing
                                through a different lens.
                            </p>
                        </div>
                    </div>
                </div>
            </section >

            <Footer />
        </main >
    );
}
