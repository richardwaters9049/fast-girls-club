"use client";

import { createContext, useContext, useState } from "react";
import { usePathname } from "next/navigation";

const SiteEntryContext = createContext<string | null>(null);

// The root layout persists during client navigation. Capture the page the
// visitor actually landed on, before a later route mounts the homepage intro.
export default function SiteEntryProvider({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [entryPathname] = useState(pathname);
    return <SiteEntryContext.Provider value={entryPathname}>{children}</SiteEntryContext.Provider>;
}

export function useSiteEntryPathname(): string | null {
    return useContext(SiteEntryContext);
}
