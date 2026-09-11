"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface AnimatedSectionProps {
    children: ReactNode;
    className?: string;
    delay?: number;
}

export default function AnimatedSection({
    children,
    className = "",
    delay = 0,
}: AnimatedSectionProps): React.ReactElement {
    return (
        <motion.section
            initial={{
                opacity: 0,
                y: 18,
            }}
            whileInView={{
                opacity: 1,
                y: 0,
            }}
            viewport={{
                once: true,
                amount: 0.08,
            }}
            transition={{
                duration: 0.55,
                delay,
                ease: [0.22, 1, 0.36, 1],
            }}
            className={className}
        >
            {children}
        </motion.section>
    );
}