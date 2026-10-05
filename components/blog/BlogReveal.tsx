"use client";

import useViewportReveal from "./useViewportReveal";

interface BlogRevealProps {
    children: React.ReactNode;
    className?: string;
    delay?: number;
    direction?: "left" | "up";
}

export default function BlogReveal({
    children,
    className,
    delay = 0,
    direction = "up",
}: BlogRevealProps): React.ReactElement {
    const scope = useViewportReveal({ delay, direction });

    return (
        <div ref={scope} className={className}>
            {children}
        </div>
    );
}
