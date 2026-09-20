"use client";

import Image from "next/image";
import { useState } from "react";

type DriverPortraitProps = {
    name: string;
    acronym: string;
    headshotUrl: string | null;
    teamColour: string;
    className?: string;
};

export default function DriverPortrait({
    name,
    acronym,
    headshotUrl,
    teamColour,
    className = "h-10 w-10",
}: DriverPortraitProps): React.ReactElement {
    const [failedUrl, setFailedUrl] = useState<string | null>(null);
    const borderColor = teamColour
        ? teamColour.startsWith("#") ? teamColour : `#${teamColour}`
        : undefined;
    const showImage = Boolean(headshotUrl && failedUrl !== headshotUrl);

    return (
        <div
            className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-white/[0.05] text-xs font-black text-white/45 ${className}`}
            style={{ borderColor }}
        >
            {showImage && headshotUrl ? (
                <Image
                    src={headshotUrl}
                    alt={name}
                    fill
                    sizes="40px"
                    className="object-cover"
                    onError={() => setFailedUrl(headshotUrl)}
                />
            ) : (
                <span aria-hidden="true">{(acronym || name).slice(0, 2)}</span>
            )}
        </div>
    );
}
