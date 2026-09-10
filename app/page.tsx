"use client";

import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { useState } from "react";
import newLogo from "@/public/images/F1-images/newlogo3.png";
import F1DataHub from "@/components/f1/F1DataHub";

const HeroScene = dynamic(
    () => import("@/components/3d/HeroScene"),
    {
        ssr: false,
        loading: () => null,
    },
);

const heroTransition = {
    duration: 0.7,
    ease: [0.22, 1, 0.36, 1] as const,
};

export default function Home(): React.ReactElement {
    const [menuOpen, setMenuOpen] = useState<boolean>(false);

    const closeMenu = (): void => {
        setMenuOpen(false);
    };

    return (
        <main className="overflow-hidden bg-[#1c1c1c] text-white">
            {/* HERO */}

            <section className="relative isolate overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(120deg,#1c1c1c_0%,#1c1c1c_42%,#321f28_70%,#ee8434_150%)]" />

                <div className="absolute -right-40 top-20 h-[31.25rem] w-[31.25rem] rounded-full bg-[#ff729f]/15 blur-3xl" />

                <div className="absolute left-0 top-0 h-1 w-full bg-[linear-gradient(90deg,#ff729f,#ee8434)]" />

                <nav className="relative z-30 mx-auto flex w-full max-w-[77.5rem] items-center justify-between px-6 py-7 lg:px-10">
                    <Link
                        href="/"
                        onClick={closeMenu}
                        className="transition-opacity hover:opacity-70"
                    >
                        <Image
                            src={newLogo}
                            alt="Fast Girls"
                            width={80}
                            height={80}
                            loading="eager"
                            style={{
                                width: "auto",
                                height: "auto",
                            }}
                        />
                    </Link>

                    <div className="hidden items-center gap-8 text-xs font-bold uppercase tracking-[0.18em] md:flex">
                        <Link
                            href="#latest"
                            className="transition-colors hover:text-[#ff729f]"
                        >
                            Latest
                        </Link>

                        <Link
                            href="#f1-data"
                            className="transition-colors hover:text-[#ff729f]"
                        >
                            Racing
                        </Link>

                        <Link
                            href="#grid"
                            className="transition-colors hover:text-[#ff729f]"
                        >
                            The Grid
                        </Link>

                        <Link
                            href="#about"
                            className="transition-colors hover:text-[#ff729f]"
                        >
                            About
                        </Link>
                    </div>

                    <button
                        type="button"
                        aria-label={
                            menuOpen
                                ? "Close navigation menu"
                                : "Open navigation menu"
                        }
                        aria-expanded={menuOpen}
                        onClick={() => setMenuOpen(!menuOpen)}
                        className="relative z-50 flex items-center gap-3 border border-white/20 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] transition-colors hover:border-[#ff729f] hover:text-[#ff729f] md:hidden"
                    >
                        <span>{menuOpen ? "Close" : "Menu"}</span>

                        <span className="relative flex h-3 w-4 flex-col justify-between">
                            <span
                                className={`block h-px w-full bg-current transition-transform duration-300 ${menuOpen
                                    ? "translate-y-1.5 rotate-45"
                                    : ""
                                    }`}
                            />

                            <span
                                className={`block h-px w-full bg-current transition-opacity duration-300 ${menuOpen
                                    ? "opacity-0"
                                    : "opacity-100"
                                    }`}
                            />

                            <span
                                className={`block h-px w-full bg-current transition-transform duration-300 ${menuOpen
                                    ? "-translate-y-1.5 -rotate-45"
                                    : ""
                                    }`}
                            />
                        </span>
                    </button>

                    {menuOpen && (
                        <motion.div
                            initial={{
                                opacity: 0,
                                y: -15,
                            }}
                            animate={{
                                opacity: 1,
                                y: 0,
                            }}
                            transition={{
                                duration: 0.25,
                                ease: "easeOut",
                            }}
                            className="absolute left-0 right-0 top-full border-t border-white/10 bg-[#1c1c1c] px-6 py-8 shadow-2xl md:hidden"
                        >
                            <div className="flex flex-col">
                                <Link
                                    href="#latest"
                                    onClick={closeMenu}
                                    className="border-b border-white/10 py-5 text-3xl font-black uppercase tracking-[-0.04em] transition-colors hover:text-[#ff729f]"
                                >
                                    Latest
                                </Link>

                                <Link
                                    href="#f1-data"
                                    onClick={closeMenu}
                                    className="border-b border-white/10 py-5 text-3xl font-black uppercase tracking-[-0.04em] transition-colors hover:text-[#ff729f]"
                                >
                                    Racing
                                </Link>

                                <Link
                                    href="#grid"
                                    onClick={closeMenu}
                                    className="border-b border-white/10 py-5 text-3xl font-black uppercase tracking-[-0.04em] transition-colors hover:text-[#ff729f]"
                                >
                                    The Grid
                                </Link>

                                <Link
                                    href="#about"
                                    onClick={closeMenu}
                                    className="py-5 text-3xl font-black uppercase tracking-[-0.04em] transition-colors hover:text-[#ff729f]"
                                >
                                    About
                                </Link>
                            </div>

                            <div className="mt-8 flex items-center gap-3">
                                <span className="h-2 w-2 bg-[#ff729f]" />

                                <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/35">
                                    Women in Motorsport
                                </span>
                            </div>
                        </motion.div>
                    )}
                </nav>

                <div className="relative mx-auto grid max-w-[77.5rem] items-center px-6 pb-16 pt-8 lg:grid-cols-[0.9fr_1.1fr] lg:px-10 lg:pb-24 lg:pt-12">
                    <div className="relative z-10 max-w-[38rem]">
                        <motion.div
                            initial={{
                                opacity: 0,
                                y: 16,
                            }}
                            animate={{
                                opacity: 1,
                                y: 0,
                            }}
                            transition={heroTransition}
                            className="mb-7 flex items-center gap-3"
                        >
                            <span className="h-2 w-2 bg-[#ff729f]" />

                            <span className="text-xs font-bold uppercase tracking-[0.28em] text-white/60">
                                Women in Motorsport
                            </span>
                        </motion.div>

                        <motion.div
                            initial={{
                                opacity: 0,
                                y: 22,
                            }}
                            animate={{
                                opacity: 1,
                                y: 0,
                            }}
                            transition={{
                                ...heroTransition,
                                delay: 0.1,
                            }}
                        >
                            <Image
                                src={newLogo}
                                alt="Fast Girls Club"
                                width={450}
                                height={160}
                                priority
                                className="h-auto w-[min(450px,90vw)]"
                            />
                        </motion.div>

                        <motion.h1
                            initial={{
                                opacity: 0,
                                y: 22,
                            }}
                            animate={{
                                opacity: 1,
                                y: 0,
                            }}
                            transition={{
                                ...heroTransition,
                                delay: 0.18,
                            }}
                            className="mt-7 max-w-[34rem] text-[clamp(2.5rem,5vw,4.5rem)] font-black uppercase leading-[0.88] tracking-[-0.07em]"
                        >
                            Racing has
                            <br />
                            another{" "}
                            <span className="text-[#ff729f]">
                                story.
                            </span>
                        </motion.h1>

                        <motion.p
                            initial={{
                                opacity: 0,
                                y: 18,
                            }}
                            animate={{
                                opacity: 1,
                                y: 0,
                            }}
                            transition={{
                                ...heroTransition,
                                delay: 0.28,
                            }}
                            className="mt-6 max-w-[30rem] text-base leading-7 text-white/65 md:text-lg"
                        >
                            The people, stories and data behind women
                            shaping the future of motorsport. Follow the
                            racing, know the grid and stay ahead of the
                            story.
                        </motion.p>

                        <motion.div
                            initial={{
                                opacity: 0,
                                y: 18,
                            }}
                            animate={{
                                opacity: 1,
                                y: 0,
                            }}
                            transition={{
                                ...heroTransition,
                                delay: 0.38,
                            }}
                            className="mt-9 flex flex-wrap items-center gap-4"
                        >
                            <Link
                                href="#f1-data"
                                className="group inline-flex items-center gap-4 bg-[#ff729f] px-7 py-4 text-xs font-black uppercase tracking-[0.18em] text-[#1c1c1c] transition-transform duration-300 hover:-translate-y-1"
                            >
                                <span>Enter the F1 Data Hub</span>

                                <span className="transition-transform duration-300 group-hover:translate-x-1">
                                    →
                                </span>
                            </Link>

                            <Link
                                href="#latest"
                                className="border border-white/25 px-7 py-4 text-xs font-black uppercase tracking-[0.18em] transition-all duration-300 hover:border-[#ff729f] hover:text-[#ff729f]"
                            >
                                Read the latest
                            </Link>
                        </motion.div>
                    </div>

                    <motion.div
                        initial={{
                            opacity: 0,
                            scale: 0.96,
                        }}
                        animate={{
                            opacity: 1,
                            scale: 1,
                        }}
                        transition={{
                            duration: 1,
                            delay: 0.2,
                            ease: [0.22, 1, 0.36, 1],
                        }}
                        className="relative mt-8 h-[26rem] lg:mt-0 lg:h-[40rem]"
                    >
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
                    </motion.div>
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

            {/* LATEST / RACE REPORT */}

            <section
                id="latest"
                className="bg-[#e6e6e6] px-6 py-14 text-[#1c1c1c] lg:px-10 lg:py-20"
            >
                <div className="mx-auto max-w-[77.5rem]">
                    <div className="flex flex-col justify-between gap-6 border-b border-[#1c1c1c]/15 pb-8 md:flex-row md:items-end">
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

                        <p className="max-w-[22rem] text-sm leading-6 text-[#1c1c1c]/60">
                            The stories, people and moments shaping
                            women&apos;s motorsport, from the paddock to
                            the podium.
                        </p>
                    </div>

                    <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                        <article className="group relative overflow-hidden bg-[#1c1c1c] text-white transition-transform duration-500 hover:-translate-y-2">
                            <div className="absolute left-0 top-0 z-10 h-1 w-full bg-[linear-gradient(90deg,#ff729f,#ee8434)]" />

                            <div className="relative aspect-[4/3] overflow-hidden bg-[#3a2029]">
                                <Image
                                    src="/images/F1-images/2cars.webp"
                                    alt="Formula 1 cars racing"
                                    fill
                                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                                />

                                <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_45%,rgba(28,28,28,0.7)_100%)]" />

                                <span className="absolute bottom-4 left-5 text-[10px] font-black uppercase tracking-[0.25em] text-white/70">
                                    01 / Racing
                                </span>
                            </div>

                            <div className="p-6">
                                <div className="mb-5 h-px w-10 bg-[#ff729f] transition-all duration-300 group-hover:w-20" />

                                <h3 className="text-2xl font-black uppercase leading-[0.95] tracking-[-0.04em]">
                                    The women changing the grid
                                </h3>

                                <p className="mt-4 text-sm leading-6 text-white/50">
                                    Profiles, stories and the latest
                                    developments from the women pushing
                                    motorsport forward.
                                </p>

                                <span className="mt-6 inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-[#ff729f]">
                                    Read story
                                    <span className="transition-transform duration-300 group-hover:translate-x-1">
                                        →
                                    </span>
                                </span>
                            </div>
                        </article>

                        <article className="group relative overflow-hidden bg-white transition-transform duration-500 hover:-translate-y-2">
                            <div className="absolute left-0 top-0 z-10 h-1 w-full bg-[linear-gradient(90deg,#ee8434,#ff729f)]" />

                            <div className="relative aspect-[4/3] overflow-hidden bg-[#1c1c1c]">
                                <Image
                                    src="/images/F1-images/red-blur.jpg"
                                    alt="Blurred racing scene"
                                    fill
                                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                                />

                                <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_45%,rgba(28,28,28,0.7)_100%)]" />

                                <span className="absolute bottom-4 left-5 text-[10px] font-black uppercase tracking-[0.25em] text-white/75">
                                    02 / Culture
                                </span>
                            </div>

                            <div className="p-6">
                                <div className="mb-5 h-px w-10 bg-[#ee8434] transition-all duration-300 group-hover:w-20" />

                                <h3 className="text-2xl font-black uppercase leading-[0.95] tracking-[-0.04em]">
                                    Beyond the chequered flag
                                </h3>

                                <p className="mt-4 text-sm leading-6 text-black/50">
                                    Motorsport culture, personalities
                                    and everything happening around the
                                    racing world.
                                </p>

                                <span className="mt-6 inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-[#ee8434]">
                                    Explore culture
                                    <span className="transition-transform duration-300 group-hover:translate-x-1">
                                        →
                                    </span>
                                </span>
                            </div>
                        </article>

                        <article className="group relative overflow-hidden bg-[#ff729f] transition-transform duration-500 hover:-translate-y-2">
                            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.12),transparent_50%,rgba(238,132,52,0.18))]" />

                            <div className="relative flex h-full flex-col p-6 md:pt-8">
                                <div className="flex items-center justify-between">
                                    <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#1c1c1c]/60">
                                        Grid guide
                                    </p>

                                    <span className="text-xs font-black text-[#1c1c1c]/40">
                                        03
                                    </span>
                                </div>

                                <h3 className="mt-10 text-4xl font-black uppercase leading-[0.88] tracking-[-0.06em]">
                                    Know
                                    <br />
                                    Your
                                    <br />
                                    Grid.
                                </h3>

                                <p className="mt-8 max-w-[18rem] text-sm leading-6 text-[#1c1c1c]/65">
                                    Drivers, teams, championships and
                                    everything you need to follow the
                                    season.
                                </p>

                                <Link
                                    href="#f1-data"
                                    className="mt-auto pt-10"
                                >
                                    <span className="inline-flex items-center gap-3 border-b-2 border-[#1c1c1c] pb-2 text-xs font-black uppercase tracking-[0.2em] transition-all duration-300 group-hover:gap-5">
                                        View the grid
                                        <span>→</span>
                                    </span>
                                </Link>
                            </div>
                        </article>
                    </div>
                </div>
            </section>

            {/* F1 DATA HUB */}

            <F1DataHub />

            {/* THE GRID */}

            <section
                id="grid"
                className="relative overflow-hidden bg-[#1c1c1c] px-6 py-16 lg:px-10 lg:py-24"
            >
                <div className="absolute right-0 top-0 h-full w-1/2 bg-[linear-gradient(135deg,transparent_0%,rgba(255,114,159,0.08)_55%,rgba(238,132,52,0.06)_100%)]" />

                <div className="absolute left-0 top-1/2 h-px w-full bg-white/5" />

                <div className="relative mx-auto max-w-[77.5rem]">
                    <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
                        <div>
                            <div className="mb-5 flex items-center gap-3">
                                <span className="h-2 w-2 bg-[#ff729f]" />

                                <p className="text-xs font-black uppercase tracking-[0.25em] text-[#ff729f]">
                                    The Grid
                                </p>
                            </div>

                            <h2 className="text-[clamp(4rem,10vw,9rem)] font-black uppercase leading-[0.78] tracking-[-0.08em]">
                                Know
                                <br />
                                the
                                <br />
                                <span className="text-[#ff729f]">
                                    names.
                                </span>
                            </h2>
                        </div>

                        <div className="lg:pb-3">
                            <p className="max-w-[30rem] text-base leading-7 text-white/50 md:text-lg">
                                Drivers. Teams. Championships. Results.
                                The Grid is your starting point for
                                understanding the people competing at
                                the sharp end of modern motorsport.
                            </p>

                            <Link
                                href="#f1-data"
                                className="group mt-8 inline-flex items-center gap-4 border border-white/20 px-6 py-4 text-xs font-black uppercase tracking-[0.18em] transition-all duration-300 hover:border-[#ff729f] hover:bg-[#ff729f] hover:text-[#1c1c1c]"
                            >
                                Open the F1 Data Hub

                                <span className="transition-transform duration-300 group-hover:translate-x-1">
                                    →
                                </span>
                            </Link>
                        </div>
                    </div>

                    <div className="mt-16 grid gap-px border border-white/10 bg-white/10 md:grid-cols-3">
                        <div className="bg-[#1c1c1c] p-6 transition-colors duration-300 hover:bg-white/[0.04]">
                            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-white/30">
                                01
                            </p>

                            <h3 className="mt-12 text-3xl font-black uppercase tracking-[-0.05em]">
                                Drivers
                            </h3>

                            <p className="mt-4 text-sm leading-6 text-white/40">
                                Follow the names behind every lap,
                                result and championship battle.
                            </p>
                        </div>

                        <div className="bg-[#1c1c1c] p-6 transition-colors duration-300 hover:bg-white/[0.04]">
                            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-white/30">
                                02
                            </p>

                            <h3 className="mt-12 text-3xl font-black uppercase tracking-[-0.05em]">
                                Teams
                            </h3>

                            <p className="mt-4 text-sm leading-6 text-white/40">
                                The constructors, garages and people
                                fighting for every point.
                            </p>
                        </div>

                        <div className="bg-[#1c1c1c] p-6 transition-colors duration-300 hover:bg-white/[0.04]">
                            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-white/30">
                                03
                            </p>

                            <h3 className="mt-12 text-3xl font-black uppercase tracking-[-0.05em]">
                                Results
                            </h3>

                            <p className="mt-4 text-sm leading-6 text-white/40">
                                Race data and championship context,
                                without the noise.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ABOUT */}

            <section
                id="racing"
                className="relative overflow-hidden bg-[#1c1c1c] px-6 pb-16 pt-4 lg:px-10 lg:pb-24"
            >
                <div className="absolute right-0 top-0 h-full w-1/3 bg-[linear-gradient(135deg,transparent_0%,rgba(255,114,159,0.05)_100%)]" />

                <div className="relative mx-auto max-w-[77.5rem] border-t border-white/10 pt-12 lg:pt-16">
                    <p className="text-xs font-black uppercase tracking-[0.25em] text-[#ff729f]">
                        Fast Girls Club
                    </p>

                    <div className="mt-5 grid gap-10 lg:grid-cols-[1fr_0.7fr]">
                        <h2 className="text-[clamp(3.5rem,8vw,8rem)] font-black uppercase leading-[0.82] tracking-[-0.07em]">
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
            </section>

            {/* FOOTER */}

            <footer
                id="about"
                className="border-t border-white/10 bg-black px-6 py-12 lg:px-10 lg:py-14"
            >
                <div className="mx-auto max-w-[77.5rem]">
                    <div className="grid gap-10 md:grid-cols-[1fr_auto] md:items-end">
                        <div>
                            <Link
                                href="/"
                                className="inline-block text-2xl font-black uppercase tracking-[-0.06em] transition-opacity hover:opacity-70"
                            >
                                Fast Girls
                                <span className="text-[#ff729f]">.</span>
                            </Link>

                            <p className="mt-3 text-xs uppercase tracking-[0.2em] text-white/30">
                                Women in motorsport
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-x-7 gap-y-3 text-[10px] font-bold uppercase tracking-[0.2em] text-white/35">
                            <Link
                                href="#latest"
                                className="transition-colors hover:text-[#ff729f]"
                            >
                                Latest
                            </Link>

                            <Link
                                href="#f1-data"
                                className="transition-colors hover:text-[#ff729f]"
                            >
                                F1 Data Hub
                            </Link>

                            <Link
                                href="#grid"
                                className="transition-colors hover:text-[#ff729f]"
                            >
                                The Grid
                            </Link>

                            <Link
                                href="#about"
                                className="transition-colors hover:text-[#ff729f]"
                            >
                                About
                            </Link>
                        </div>
                    </div>

                    <div className="mt-10 flex flex-col justify-between gap-4 border-t border-white/10 pt-5 md:flex-row md:items-center">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/20">
                            Racing through a different lens
                        </p>

                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/20">
                            © 2026 Fast Girls Club
                        </p>
                    </div>
                </div>
            </footer>
        </main>
    );
}