"use client";

import Link from "next/link";
import { Search, X } from "lucide-react";
import {
    motion,
} from "framer-motion";
import {
    usePathname,
    useRouter,
} from "next/navigation";

import type {
    BlogDateRange,
    BlogSort,
    WordPressCategory,
} from "@/lib/wordpress/types";

interface BlogDashboardControlsProps {
    query: string;
    category: string;
    dateRange: BlogDateRange;
    sort: BlogSort;
    categories: WordPressCategory[];
}

const dateFilters: Array<{
    value: BlogDateRange;
    label: string;
}> = [
        {
            value: "all",
            label: "Any date",
        },
        {
            value: "7d",
            label: "7 days",
        },
        {
            value: "30d",
            label: "30 days",
        },
        {
            value: "year",
            label: "This year",
        },
    ];

function buildUrl(
    pathname: string,
    values: {
        query?: string;
        category?: string;
        dateRange?: BlogDateRange;
        sort?: BlogSort;
    },
): string {
    const params =
        new URLSearchParams();

    if (values.query) {
        params.set(
            "q",
            values.query,
        );
    }

    if (values.category) {
        params.set(
            "category",
            values.category,
        );
    }

    if (
        values.dateRange &&
        values.dateRange !== "all"
    ) {
        params.set(
            "range",
            values.dateRange,
        );
    }

    if (
        values.sort &&
        values.sort !== "newest"
    ) {
        params.set(
            "sort",
            values.sort,
        );
    }

    const queryString =
        params.toString();

    return queryString
        ? `${pathname}?${queryString}`
        : pathname;
}

export default function BlogDashboardControls({
    query,
    category,
    dateRange,
    sort,
    categories,
}: BlogDashboardControlsProps): React.ReactElement {
    const pathname =
        usePathname();

    const router = useRouter();

    const handleSearch = (
        event: React.FormEvent<HTMLFormElement>,
    ): void => {
        event.preventDefault();

        const formData =
            new FormData(
                event.currentTarget,
            );

        const value =
            String(
                formData.get("search") ??
                "",
            ).trim();

        router.replace(
            buildUrl(pathname, {
                query: value,
                category,
                dateRange,
                sort,
            }),
        );
    };

    return (
        <section className="relative border-y border-[#1c1c1c]/10 bg-white">
            <div className="mx-auto max-w-[77.5rem] px-6 py-6 lg:px-10">
                <div className="grid gap-5 lg:grid-cols-[1.4fr_0.6fr]">
                    <form
                        onSubmit={
                            handleSearch
                        }
                        className="relative"
                    >
                        <Search
                            aria-hidden="true"
                            className="absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#1c1c1c]/35"
                        />

                        <input
                            name="search"
                            type="search"
                            defaultValue={query}
                            placeholder="Search drivers, cars, teams, races..."
                            autoComplete="off"
                            className="h-14 w-full border border-[#1c1c1c]/12 bg-[#f7f7f7] pl-12 pr-5 text-sm font-semibold tracking-[0.02em] text-[#1c1c1c] outline-none transition-colors placeholder:text-[#1c1c1c]/35 focus:border-[#ff729f]"
                        />
                    </form>

                    <div className="grid grid-cols-2 border border-[#1c1c1c]/10 bg-[#1c1c1c]">
                        <Link
                            href={buildUrl(
                                pathname,
                                {
                                    query,
                                    category,
                                    dateRange,
                                    sort: "newest",
                                },
                            )}
                            className={`flex items-center justify-center px-4 py-3 text-[9px] font-black uppercase tracking-[0.18em] transition-colors ${sort ===
                                "newest"
                                ? "bg-[#ff729f] text-[#1c1c1c]"
                                : "text-white/50 hover:text-white"
                                }`}
                        >
                            Newest
                        </Link>

                        <Link
                            href={buildUrl(
                                pathname,
                                {
                                    query,
                                    category,
                                    dateRange,
                                    sort: "oldest",
                                },
                            )}
                            className={`flex items-center justify-center px-4 py-3 text-[9px] font-black uppercase tracking-[0.18em] transition-colors ${sort ===
                                "oldest"
                                ? "bg-[#ee8434] text-[#1c1c1c]"
                                : "text-white/50 hover:text-white"
                                }`}
                        >
                            Oldest
                        </Link>
                    </div>
                </div>

                <div className="mt-6">
                    <div className="mb-3 flex items-center justify-between gap-4">
                        <p className="text-[9px] font-black uppercase tracking-[0.22em] text-[#1c1c1c]/40">
                            Categories
                        </p>

                        <span className="text-[8px] font-bold uppercase tracking-[0.18em] text-[#1c1c1c]/30">
                            Filter by subject
                        </span>
                    </div>

                    <div className="flex gap-2 overflow-x-auto pb-1">
                        <Link
                            href={buildUrl(
                                pathname,
                                {
                                    query,
                                    category: "",
                                    dateRange,
                                    sort,
                                },
                            )}
                            className="relative shrink-0"
                        >
                            <span
                                className={`relative z-10 block px-4 py-2 text-[9px] font-black uppercase tracking-[0.16em] transition-colors ${!category
                                    ? "text-[#1c1c1c]"
                                    : "border border-[#1c1c1c]/10 text-[#1c1c1c]/45 hover:text-[#1c1c1c]"
                                    }`}
                            >
                                All
                            </span>

                            {!category && (
                                <motion.span
                                    layoutId="blog-category-active"
                                    className="absolute inset-0 bg-[#ff729f]"
                                />
                            )}
                        </Link>

                        {categories
                            .slice(0, 10)
                            .map(
                                (
                                    item,
                                ) => {
                                    const active =
                                        category ===
                                        item.slug;

                                    return (
                                        <Link
                                            key={
                                                item.id
                                            }
                                            href={buildUrl(
                                                pathname,
                                                {
                                                    query,
                                                    category:
                                                        item.slug,
                                                    dateRange,
                                                    sort,
                                                },
                                            )}
                                            className="relative shrink-0"
                                        >
                                            <span
                                                className={`relative z-10 flex items-center gap-2 px-4 py-2 text-[9px] font-black uppercase tracking-[0.16em] transition-colors ${active
                                                    ? "text-[#1c1c1c]"
                                                    : "border border-[#1c1c1c]/10 text-[#1c1c1c]/45 hover:text-[#1c1c1c]"
                                                    }`}
                                            >
                                                {
                                                    item.name
                                                }

                                                <span className="text-[8px] opacity-40">
                                                    {
                                                        item.count
                                                    }
                                                </span>
                                            </span>

                                            {active && (
                                                <motion.span
                                                    layoutId="blog-category-active"
                                                    className="absolute inset-0 bg-[#ff729f]"
                                                />
                                            )}
                                        </Link>
                                    );
                                },
                            )}
                    </div>
                </div>

                <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
                    <div>
                        <p className="mb-3 text-[9px] font-black uppercase tracking-[0.22em] text-[#1c1c1c]/40">
                            Date range
                        </p>

                        <div className="flex gap-2 overflow-x-auto pb-1">
                            {dateFilters.map(
                                (filter) => {
                                    const active =
                                        dateRange ===
                                        filter.value;

                                    return (
                                        <Link
                                            key={
                                                filter.value
                                            }
                                            href={buildUrl(
                                                pathname,
                                                {
                                                    query,
                                                    category,
                                                    dateRange:
                                                        filter.value,
                                                    sort,
                                                },
                                            )}
                                            className={`shrink-0 border px-4 py-2 text-[9px] font-black uppercase tracking-[0.16em] transition-colors ${active
                                                ? "border-[#1c1c1c] bg-[#1c1c1c] text-white"
                                                : "border-[#1c1c1c]/10 text-[#1c1c1c]/45 hover:border-[#1c1c1c]/30 hover:text-[#1c1c1c]"
                                                }`}
                                        >
                                            {
                                                filter.label
                                            }
                                        </Link>
                                    );
                                },
                            )}
                        </div>
                    </div>

                    {(query ||
                        category ||
                        dateRange !==
                        "all" ||
                        sort !==
                        "newest") && (
                            <Link
                                href="/blog"
                                className="inline-flex items-center justify-center gap-2 border border-[#1c1c1c]/10 px-4 py-2 text-[9px] font-black uppercase tracking-[0.18em] text-[#1c1c1c]/50 transition-colors hover:border-[#ff729f] hover:text-[#1c1c1c]"
                            >
                                <X className="h-3 w-3" />
                                Clear filters
                            </Link>
                        )}
                </div>
            </div>
        </section>
    );
}