"use client";

import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import Container from "@/components/ui/Container";

export type GridPanel =
    | "overview"
    | "race"
    | "live"
    | "drivers"
    | "teams"
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
            id: "drivers",
            label: "Drivers",
        },
        {
            id: "teams",
            label: "Teams",
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
    return (
        <div className="shrink-0 border-b border-white/10 bg-[#1c1c1c]">
            <Container size="wide">
                <nav
                    aria-label="The Grid sections"
                    className="flex items-center gap-1 overflow-x-auto py-1.5"
                >
                    {navigation.map((item) => (
                        <Button
                            key={item.id}
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
                                    transition={{
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