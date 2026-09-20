"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef } from "react";

import { Button } from "@/components/ui/button";
import Container from "@/components/ui/Container";

export type GridPanel =
    | "overview"
    | "race"
    | "live"
    | "championship"
    | "calendar";

interface GridNavigationProps {
    activePanel: GridPanel;
    onPanelChange: (panel: GridPanel) => void;
}

const navigation: {
    id: GridPanel;
    label: string;
}[] = [
        {
            id: "overview",
            label: "Overview",
        },
        {
            id: "race",
            label: "Race",
        },
        {
            id: "live",
            label: "Live",
        },
        {
            id: "championship",
            label: "Championship",
        },
        {
            id: "calendar",
            label: "Calendar",
        },
    ];

export default function GridNavigation({
    activePanel,
    onPanelChange,
}: GridNavigationProps): React.ReactElement {
    const navigationRef = useRef<HTMLElement>(null);
    const reducedMotion = useReducedMotion();

    useEffect(() => {
        const navigationElement = navigationRef.current;
        const activeButton = navigationElement?.querySelector<HTMLButtonElement>(
            `[data-panel="${activePanel}"]`,
        );

        if (!navigationElement || !activeButton) {
            return;
        }

        const centreActiveButton = (): void => {
            if (navigationElement.scrollWidth <= navigationElement.clientWidth) {
                return;
            }

            const buttonBounds = activeButton.getBoundingClientRect();
            const navigationBounds = navigationElement.getBoundingClientRect();
            const left = navigationElement.scrollLeft + buttonBounds.left - navigationBounds.left -
                (navigationElement.clientWidth - buttonBounds.width) / 2;

            navigationElement.scrollTo({
                left,
                behavior: reducedMotion ? "auto" : "smooth",
            });
        };

        centreActiveButton();
        window.addEventListener("resize", centreActiveButton);

        return () => window.removeEventListener("resize", centreActiveButton);
    }, [activePanel, reducedMotion]);

    return (
        <div className="shrink-0 border-b border-white/10 bg-[#1c1c1c]">
            <Container size="wide">
                <nav
                    ref={navigationRef}
                    aria-label="The Grid sections"
                    className="flex items-center gap-1 overflow-x-auto py-1.5"
                >
                    {navigation.map((item) => (
                        <Button
                            key={item.id}
                            data-panel={item.id}
                            type="button"
                            variant="ghost"
                            onClick={() => onPanelChange(item.id)}
                            className={`relative cursor-pointer rounded-none bg-transparent px-4 py-2 text-[10px] font-bold uppercase tracking-[0.16em] hover:bg-transparent ${activePanel === item.id
                                ? "text-white hover:text-white"
                                : "text-white/45 hover:text-white"
                                }`}
                        >
                            {activePanel === item.id && (
                                <motion.span
                                    layoutId="grid-panel-indicator"
                                    className="absolute bottom-[-1px] left-2 right-2 h-0.5 bg-[#ff729f]"
                                    transition={reducedMotion ? { duration: 0 } : {
                                        type: "spring",
                                        stiffness: 400,
                                        damping: 30,
                                    }}
                                />
                            )}

                            {item.label}
                        </Button>
                    ))}
                </nav>
            </Container>
        </div>
    );
}
