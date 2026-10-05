"use client";

import { useEffect } from "react";
import { prefetchGridData } from "@/lib/f1/race-prefetch";

export default function SiteDataPrefetch(): null {
    useEffect(() => {
        // Warm shared non-live data after the page paints, from any entry page.
        const timer = window.setTimeout(() => { void prefetchGridData(); }, 1_000);
        return () => window.clearTimeout(timer);
    }, []);
    return null;
}
