import type { HTMLAttributes } from "react";
import { cn } from "cn";

interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
    size?: "default" | "wide" | "narrow";
}

export default function Container({
    className,
    size = "default",
    ...props
}: ContainerProps): React.ReactElement {
    const sizes = {
        default: "max-w-7xl",
        wide: "max-w-[82rem]",
        narrow: "max-w-5xl",
    };

    return (
        <div
            className={cn(
                "mx-auto w-full px-5 md:px-8 lg:px-10",
                sizes[size],
                className,
            )}
            {...props}
        />
    );
}