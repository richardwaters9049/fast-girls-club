"use client";

import { motion, useReducedMotion } from "framer-motion";

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
    const reduceMotion = useReducedMotion();

    return (
        <motion.div
            className={className}
            initial={
                reduceMotion
                    ? false
                    : {
                          opacity: 0,
                          x: direction === "left" ? -48 : 0,
                          y: direction === "up" ? 42 : 0,
                      }
            }
            whileInView={{ opacity: 1, x: 0, y: 0 }}
            viewport={{ once: true, amount: 0.12 }}
            transition={{
                duration: 0.7,
                delay,
                ease: [0.22, 1, 0.36, 1],
            }}
        >
            {children}
        </motion.div>
    );
}
