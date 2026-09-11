"use client";

import Link, { type LinkProps } from "next/link";
import type { AnchorHTMLAttributes } from "react";
import { cn } from "cn";

interface AnimatedLinkProps
    extends LinkProps,
    Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
    children: React.ReactNode;
    variant?: "default" | "accent";
}

export default function AnimatedLink({
    children,
    className,
    variant = "default",
    ...props
}: AnimatedLinkProps): React.ReactElement {
    return (
        <Link
            className={cn(
                "group inline-flex cursor-pointer items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] transition-colors",
                variant === "accent"
                    ? "text-[#ff729f] hover:text-white"
                    : "text-white/50 hover:text-[#ff729f]",
                className,
            )}
            {...props}
        >
            <span>{children}</span>

            <span className="transition-transform duration-300 group-hover:translate-x-1">
                →
            </span>
        </Link>
    );
}