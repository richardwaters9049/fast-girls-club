"use client";

import { useEffect } from "react";
import { useAnimate } from "framer-motion";

interface ViewportRevealOptions {
    selector?: string;
    delay?: number;
    direction?: "left" | "up";
}

export default function useViewportReveal({
    selector,
    delay = 0,
    direction = "up",
}: ViewportRevealOptions = {}) {
    const [scope, animate] = useAnimate<HTMLDivElement>();

    useEffect(() => {
        if (!scope.current || !window.IntersectionObserver) {
            return;
        }

        const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
        if (preference.matches) return;

        const targets = selector
            ? Array.from(scope.current.querySelectorAll<HTMLElement>(selector))
            : [scope.current];
        const controls: ReturnType<typeof animate>[] = [];
        const observer = new IntersectionObserver((entries) => {
            for (const entry of entries) {
                if (!entry.isIntersecting || preference.matches) continue;
                observer.unobserve(entry.target);
                controls.push(animate(entry.target, {
                    opacity: [0, 1],
                    x: direction === "left" ? [-48, 0] : [0, 0],
                    y: direction === "up" ? [42, 0] : [0, 0],
                }, {
                    duration: 0.7,
                    delay,
                    ease: [0.22, 1, 0.36, 1],
                }));
            }
        }, { threshold: 0 });

        // Start motion only after hydration and intersection. Server-rendered
        // content stays visible without JavaScript, including long WP blocks.
        const finishMotion = () => {
            if (!preference.matches) return;
            observer.disconnect();
            controls.forEach((control) => control.complete());
        };
        preference.addEventListener("change", finishMotion);
        targets.forEach((target) => observer.observe(target));
        return () => {
            preference.removeEventListener("change", finishMotion);
            observer.disconnect();
            controls.forEach((control) => control.complete());
        };
    }, [animate, delay, direction, scope, selector]);

    return scope;
}
