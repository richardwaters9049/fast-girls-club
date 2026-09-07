"use client";

import gsap from "gsap";
import dynamic from "next/dynamic";
import { useEffect, useRef } from "react";

const Scene = dynamic(() => import("./Scene"), {
    ssr: false,
    loading: () => null,
});

export default function HeroScene(): React.ReactElement {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) {
            return;
        }

        gsap.fromTo(
            containerRef.current,
            {
                opacity: 0,
                scale: 0.94,
                x: 35,
            },
            {
                opacity: 1,
                scale: 1,
                x: 0,
                duration: 1.2,
                ease: "power3.out",
            },
        );
    }, []);

    return (
        <div
            ref={containerRef}
            className="absolute inset-0 opacity-0"
        >
            <Scene />
        </div>
    );
}