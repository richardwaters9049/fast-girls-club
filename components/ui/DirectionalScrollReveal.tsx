"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef, useState, type ReactNode } from "react";

export default function DirectionalScrollReveal({ children, direction, className, delay = 0 }: {
    children: ReactNode;
    direction: "left" | "bottom" | "right";
    className?: string;
    delay?: number;
}): React.ReactElement {
    const target = useRef<HTMLDivElement>(null);
    // Observe a stationary wrapper so the moving card cannot toggle its own
    // visibility at the viewport edge.
    const inView = useInView(target, { amount: 0.08 });
    const reduceMotion = useReducedMotion();
    const [focused, setFocused] = useState(false);
    const visible = inView || reduceMotion || focused;
    const offset = direction === "bottom" ? { x: 0, y: 80 } : { x: direction === "left" ? -90 : 90, y: 0 };

    return (
        <div ref={target} className={className}
            onFocusCapture={() => setFocused(true)}
            onBlurCapture={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
            }}
        >
            <motion.div
                className="h-full"
                initial={reduceMotion ? false : { opacity: 0, ...offset }}
                animate={visible ? { opacity: 1, x: 0, y: 0 } : { opacity: 0, ...offset }}
                transition={{ duration: reduceMotion ? 0 : 0.65, delay: visible && !reduceMotion ? delay : 0, ease: [0.22, 1, 0.36, 1] }}
            >
                {children}
            </motion.div>
        </div>
    );
}
