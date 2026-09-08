"use client";

import dynamic from "next/dynamic";

const Scene = dynamic(() => import("./Scene"), {
    ssr: false,
    loading: () => null,
});

export default function HeroScene(): React.ReactElement {
    return (
        <div className="absolute inset-0">
            <Scene />
        </div>
    );
}