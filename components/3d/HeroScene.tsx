"use client";

import { useCallback, useState } from "react";

import Scene from "./Scene";

export default function HeroScene(): React.ReactElement {
    const [ready, setReady] = useState(false);
    const [interactive, setInteractive] = useState(false);
    const handleReady = useCallback(() => setReady(true), []);

    return (
        <div className="absolute inset-0">
            <div
                className={`absolute inset-0 transition-opacity duration-500 ease-out ${ready ? "opacity-100" : "pointer-events-none opacity-0"} ${interactive ? "" : "pointer-events-none"}`}
            >
                <Scene onReady={handleReady} ready={ready} interactive={interactive} />
            </div>

            {!ready && (
                <div role="status" className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-center">
                    <span className="text-[10px] font-bold uppercase tracking-[0.26em] text-white/50">
                        Preparing the car
                    </span>
                    <span aria-hidden="true" className="h-0.5 w-28 bg-[linear-gradient(90deg,#ff729f,#ee8434)] motion-safe:animate-pulse" />
                </div>
            )}

            {ready && !interactive && (
                <button
                    type="button"
                    onClick={() => setInteractive(true)}
                    aria-label="Activate car controls. Drag to rotate and pinch to zoom."
                    className="absolute inset-0 z-10 cursor-pointer touch-pan-y text-left"
                >
                    <span className="absolute left-6 top-5 flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.2em] text-white/80 lg:top-20">
                        <span aria-hidden="true" className="h-px w-5 bg-[#ee8434]" />
                        <span className="lg:hidden">Tap to rotate · pinch to zoom</span>
                        <span className="hidden lg:inline">Click to rotate · drag to turn</span>
                    </span>
                </button>
            )}

            {ready && interactive && (
                <div className="absolute left-6 right-6 top-5 z-10 flex items-center justify-between gap-3 text-[9px] font-bold uppercase tracking-[0.18em] text-white/80 lg:top-20">
                    <span className="pointer-events-none">Drag to rotate · pinch to zoom</span>
                    <button
                        type="button"
                        onClick={() => setInteractive(false)}
                        className="rounded-full border border-white/30 bg-black/55 px-3 py-1.5 text-white transition-colors hover:border-[#ff729f] hover:text-[#ff729f]"
                    >
                        Done
                    </button>
                </div>
            )}
        </div>
    );
}
