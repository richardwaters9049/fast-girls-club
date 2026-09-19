"use client";

import Scene from "./Scene";

export default function HeroScene(): React.ReactElement {
    return (
        <div className="absolute inset-0">
            <Scene />

            <div
                aria-hidden="true"
                className="pointer-events-none absolute left-6 top-20 z-10 hidden items-center gap-2 text-[9px] font-bold uppercase tracking-[0.24em] text-white/55 lg:flex"
            >
                <span className="h-px w-5 bg-[#ee8434]" />
                Drag to rotate
            </div>
        </div>
    );
}
