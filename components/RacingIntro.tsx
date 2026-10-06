"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { AnimatePresence, animate, motion, useMotionValue, useTransform } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { loadRaceCalendar, loadDriverStandings, loadConstructorStandings, prefetchGridData } from "@/lib/f1/race-prefetch";
import logo from "@/public/images/F1-images/newlogo3.png";
import styles from "./RacingIntro.module.css";
import IntroCar, { INTRO_DRIVE_DURATION_MS } from "./3d/IntroCar";

// Keep this within the loaded app, not sessionStorage: Render can sleep while
// a browser tab survives. A new document must get its own opening sequence.
let introPlayedInDocument = false;

export default function RacingIntro({ carReady, articleSlugs, onComplete }: {
    carReady: boolean;
    articleSlugs: string[];
    onComplete: () => void;
}): React.ReactElement {
    const router = useRouter();
    const [visible, setVisible] = useState(false);
    const [minimumElapsed, setMinimumElapsed] = useState(false);
    const [dataReady, setDataReady] = useState(false);
    const [lightsOut, setLightsOut] = useState(false);
    const skipRef = useRef<HTMLButtonElement>(null);
    const finishing = useRef(false);
    const driveProgress = useMotionValue(0);
    const carX = useTransform(driveProgress, (progress) => `calc(${progress * 100}vw - ${(1 - progress) * 100}%)`);
    // One shallow outward arc between the bottom corners, without looping inward.
    const carY = useTransform(driveProgress, (progress) => -192 * progress * (1 - progress));

    const dismiss = useCallback(() => {
        setVisible(false);
        introPlayedInDocument = true;
    }, []);

    const startFinish = useCallback(() => {
        if (finishing.current) return;
        finishing.current = true;
        setLightsOut(true);
    }, []);

    useEffect(() => {
        let cancelled = false;
        // Start all main routes immediately; warm every published article supplied
        // by the server, including cards that aren't visible on the home page.
        ["/about", "/blog", "/f1", ...articleSlugs.map((slug) => `/blog/${slug}`)]
            .forEach((href) => router.prefetch(href));
        void prefetchGridData();
        void Promise.allSettled([loadRaceCalendar(), loadDriverStandings(), loadConstructorStandings()])
            .then(() => { if (!cancelled) setDataReady(true); });
        return () => { cancelled = true; };
    }, [articleSlugs, router]);

    useEffect(() => {
        const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
        if (preference.matches || introPlayedInDocument) {
            introPlayedInDocument = true;
            onComplete();
            return;
        }
        const open = window.setTimeout(() => setVisible(true), 0);
        const onPreference = () => { if (preference.matches) dismiss(); };
        preference.addEventListener("change", onPreference);
        const minimum = window.setTimeout(() => setMinimumElapsed(true), 1400);
        const maximum = window.setTimeout(startFinish, 2200);
        return () => {
            window.clearTimeout(open);
            window.clearTimeout(minimum);
            window.clearTimeout(maximum);
            preference.removeEventListener("change", onPreference);
        };
    }, [dismiss, onComplete, startFinish]);

    useEffect(() => {
        if (!visible || !minimumElapsed || !carReady || !dataReady) return;
        const timer = window.setTimeout(startFinish, 0);
        return () => window.clearTimeout(timer);
    }, [carReady, dataReady, minimumElapsed, startFinish, visible]);

    useEffect(() => {
        if (!lightsOut || !visible) return;
        const drive = animate(driveProgress, 1, {
            duration: INTRO_DRIVE_DURATION_MS / 1000,
            ease: [0.3, 0, 0.65, 1],
            onComplete: dismiss,
        });
        const timer = window.setTimeout(dismiss, INTRO_DRIVE_DURATION_MS + 250);
        return () => { drive.stop(); window.clearTimeout(timer); };
    }, [dismiss, driveProgress, lightsOut, visible]);

    useEffect(() => {
        if (!visible) return;
        const previousOverflow = document.body.style.overflow;
        const previousFocus = document.activeElement;
        document.body.style.overflow = "hidden";
        skipRef.current?.focus({ preventScroll: true });
        return () => {
            document.body.style.overflow = previousOverflow;
            if (previousFocus instanceof HTMLElement && previousFocus !== document.body) previousFocus.focus({ preventScroll: true });
        };
    }, [visible]);

    return (
        <>
            <noscript><style>{`.${styles.overlay}{display:none!important}`}</style></noscript>
            <AnimatePresence onExitComplete={onComplete}>
                {visible && (
                    <motion.div
                        className={`${styles.overlay} fixed inset-0 z-[200] flex flex-col items-center justify-center overflow-hidden bg-[#1c1c1c] px-6 text-white`}
                        role="dialog"
                        aria-modal="true"
                        aria-label="Fast Girls Club starting grid"
                        initial={false}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                        onKeyDown={(event) => {
                            if (event.key === "Escape") dismiss();
                            if (event.key === "Tab") { event.preventDefault(); skipRef.current?.focus(); }
                        }}
                    >
                        <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_35%,#68284055,transparent_65%)]" />
                        <div aria-hidden="true" className={`${styles.track} absolute inset-x-0 bottom-0 h-1/2`} />
                        <motion.div className="relative flex flex-col items-center" animate={lightsOut ? { scale: 1.03, opacity: 1 } : { scale: 1, opacity: 1 }} transition={{ duration: 0.4 }}>
                            <Image src={logo} alt="Fast Girls Club" priority sizes="240px" className="h-auto w-48 sm:w-60" />
                            <p className="mt-8 text-[10px] font-bold uppercase tracking-[0.35em] text-white/60">Meet you on the grid</p>
                            <div aria-hidden="true" className="mt-8 flex gap-3 rounded-full border border-white/10 bg-black/30 p-4 sm:gap-4">
                                {[0, 1, 2, 3, 4].map((light) => (
                                    <motion.span key={light} className="h-6 w-6 rounded-full bg-[#ff729f] shadow-[0_0_20px_#ff729f88] sm:h-8 sm:w-8"
                                        initial={{ opacity: 0.12 }} animate={{ opacity: lightsOut ? 0.12 : 1 }} transition={{ delay: lightsOut ? 0 : 0.15 + light * 0.22, duration: 0.18 }} />
                                ))}
                            </div>
                        </motion.div>
                        <div aria-hidden="true" className={styles.runway}>
                            <motion.div className={styles.car} style={{ x: carX, y: carY }} data-driving={lightsOut}>
                                <IntroCar driving={lightsOut} progress={driveProgress} />
                            </motion.div>
                        </div>
                        <button ref={skipRef} onClick={dismiss} className="absolute bottom-6 right-6 border-0 bg-transparent p-0 text-[10px] font-bold tracking-[0.12em] text-white/60 underline decoration-white/30 underline-offset-4 outline-none transition-colors hover:text-[#ff729f] focus-visible:text-[#ff729f] focus-visible:decoration-[#ff729f]">Skip Intro →</button>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
