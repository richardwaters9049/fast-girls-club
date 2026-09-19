"use client";

import { ArrowRight, ChevronDown, Search, SlidersHorizontal, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import BlogReveal from "@/components/blog/BlogReveal";
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

function buildUrl(
    pathname: string,
    values: {
        query: string;
        category: string;
        dateRange: BlogDateRange;
        sort: BlogSort;
    },
): string {
    const params = new URLSearchParams();

    if (values.query) params.set("q", values.query);
    if (values.category) params.set("category", values.category);
    if (values.dateRange !== "all") params.set("range", values.dateRange);
    if (values.sort !== "newest") params.set("sort", values.sort);

    const queryString = params.toString();
    return `${queryString ? `${pathname}?${queryString}` : pathname}#stories`;
}

export default function BlogDashboardControls({
    query,
    category,
    dateRange,
    sort,
    categories,
}: BlogDashboardControlsProps): React.ReactElement {
    const pathname = usePathname();
    const router = useRouter();
    const featuredCategories = categories.slice(0, 3);
    const moreCategories = categories.slice(3);
    const moreCategorySelected = moreCategories.some(
        (item) => item.slug === category,
    );
    const hasFilters = Boolean(
        query || category || dateRange !== "all" || sort !== "newest",
    );

    const navigate = (updates: Partial<{
        query: string;
        category: string;
        dateRange: BlogDateRange;
        sort: BlogSort;
    }>): void => {
        router.push(buildUrl(pathname, {
            query,
            category,
            dateRange,
            sort,
            ...updates,
        }));
    };

    const handleSearch = (event: React.FormEvent<HTMLFormElement>): void => {
        event.preventDefault();
        const value = String(
            new FormData(event.currentTarget).get("search") ?? "",
        ).trim();
        navigate({ query: value });
    };

    return (
        <section
            aria-label="Find stories"
            className="relative border-b border-[#1c1c1c]/10 bg-white px-6 py-7 lg:px-10 lg:py-9"
        >
            <BlogReveal className="mx-auto max-w-[77.5rem]" delay={0.1}>
                <div className="mb-5 flex items-center gap-3">
                    <SlidersHorizontal aria-hidden="true" className="h-4 w-4 text-[#d45580]" />
                    <h2 className="text-[10px] font-black uppercase tracking-[0.24em] text-[#1c1c1c]/65">
                        Find your next story
                    </h2>
                    <span className="h-px flex-1 bg-[#1c1c1c]/10" />
                </div>

                <div className="grid gap-4 lg:grid-cols-[1.4fr_0.6fr] lg:items-center">
                    <form onSubmit={handleSearch} role="search" className="flex min-w-0 border border-[#1c1c1c]/15 bg-[#f4f2f1] focus-within:border-[#d45580]">
                        <label htmlFor="blog-search" className="sr-only">Search stories</label>
                        <Search aria-hidden="true" className="ml-4 mt-[1.1rem] h-5 w-5 shrink-0 text-[#1c1c1c]/40" />
                        <input
                            id="blog-search"
                            name="search"
                            type="search"
                            key={query}
                            defaultValue={query}
                            placeholder="Search stories, drivers, teams…"
                            autoComplete="off"
                            className="h-14 min-w-0 flex-1 bg-transparent px-4 text-sm text-[#1c1c1c] outline-none placeholder:text-[#1c1c1c]/40"
                        />
                        <button
                            type="submit"
                            className="m-1 flex cursor-pointer items-center gap-2 bg-[#1c1c1c] px-5 text-[10px] font-black uppercase tracking-[0.15em] text-white transition-colors hover:bg-[#d45580] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d45580]"
                        >
                            Search <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
                        </button>
                    </form>

                    <div className="flex flex-wrap gap-2 sm:flex-nowrap">
                        <div className="min-w-[9rem] flex-1">
                            <label htmlFor="blog-date" className="mb-1.5 block cursor-pointer text-[9px] font-black uppercase tracking-[0.17em] text-[#1c1c1c]/50">
                                Published
                            </label>
                            <div className="relative">
                                <select
                                    id="blog-date"
                                    value={dateRange}
                                    onChange={(event) => navigate({ dateRange: event.target.value as BlogDateRange })}
                                    className="h-10 w-full cursor-pointer appearance-none border border-[#1c1c1c]/15 bg-white pl-3 pr-8 text-xs font-bold text-[#1c1c1c] transition-colors hover:border-[#d45580]/60 focus-visible:outline-2 focus-visible:outline-[#d45580]"
                                >
                                    <option value="all">Any time</option>
                                    <option value="7d">Past 7 days</option>
                                    <option value="30d">Past 30 days</option>
                                    <option value="year">This year</option>
                                </select>
                                <ChevronDown aria-hidden="true" className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#1c1c1c]/55" />
                            </div>
                        </div>

                        <div className="min-w-[9rem] flex-1">
                            <label htmlFor="blog-sort" className="mb-1.5 block cursor-pointer text-[9px] font-black uppercase tracking-[0.17em] text-[#1c1c1c]/50">
                                Sort by
                            </label>
                            <div className="relative">
                                <select
                                    id="blog-sort"
                                    value={sort}
                                    onChange={(event) => navigate({ sort: event.target.value as BlogSort })}
                                    className="h-10 w-full cursor-pointer appearance-none border border-[#1c1c1c]/15 bg-white pl-3 pr-8 text-xs font-bold text-[#1c1c1c] transition-colors hover:border-[#d45580]/60 focus-visible:outline-2 focus-visible:outline-[#d45580]"
                                >
                                    <option value="newest">Newest first</option>
                                    <option value="oldest">Oldest first</option>
                                </select>
                                <ChevronDown aria-hidden="true" className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#1c1c1c]/55" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex flex-col gap-3 border-t border-[#1c1c1c]/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="mr-2 text-[9px] font-black uppercase tracking-[0.18em] text-[#1c1c1c]/45">Topics</span>

                        <Link
                            href={buildUrl(pathname, { query, category: "", dateRange, sort })}
                            aria-current={!category ? "page" : undefined}
                            className={`border px-4 py-2 text-[10px] font-black uppercase tracking-[0.12em] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d45580] ${!category ? "border-[#1c1c1c] bg-[#1c1c1c] text-white" : "border-[#1c1c1c]/15 text-[#1c1c1c]/65 hover:border-[#d45580]"}`}
                        >
                            All stories
                        </Link>

                        {featuredCategories.map((item) => (
                            <Link
                                key={item.id}
                                href={buildUrl(pathname, { query, category: item.slug, dateRange, sort })}
                                aria-current={category === item.slug ? "page" : undefined}
                                className={`border px-4 py-2 text-[10px] font-black uppercase tracking-[0.12em] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d45580] ${category === item.slug ? "border-[#ff729f] bg-[#ff729f] text-[#1c1c1c]" : "border-[#1c1c1c]/15 text-[#1c1c1c]/65 hover:border-[#d45580]"}`}
                            >
                                {item.name}
                            </Link>
                        ))}

                        {moreCategories.length > 0 && (
                            <label className="sr-only" htmlFor="blog-more-topics">More topics</label>
                        )}
                        {moreCategories.length > 0 && (
                            <div className="relative inline-flex max-w-full">
                                <select
                                    id="blog-more-topics"
                                    aria-label="More topics"
                                    value={moreCategorySelected ? category : ""}
                                    onChange={(event) => navigate({ category: event.target.value })}
                                    className={`h-[2.15rem] max-w-full cursor-pointer appearance-none border pl-3 pr-8 text-[10px] font-black uppercase tracking-[0.12em] focus-visible:outline-2 focus-visible:outline-[#d45580] ${moreCategorySelected ? "border-[#ff729f] bg-[#ff729f] text-[#1c1c1c]" : "border-[#1c1c1c]/15 bg-white text-[#1c1c1c]/65"}`}
                                >
                                    <option value="">More topics</option>
                                    {moreCategories.map((item) => (
                                        <option key={item.id} value={item.slug}>{item.name}</option>
                                    ))}
                                </select>
                                <ChevronDown aria-hidden="true" className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#1c1c1c]/55" />
                            </div>
                        )}
                    </div>

                    {hasFilters && (
                        <Link
                            href="/blog#stories"
                            className="inline-flex shrink-0 items-center gap-2 self-start text-[10px] font-black uppercase tracking-[0.14em] text-[#b34d70] transition-colors hover:text-[#1c1c1c] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d45580]"
                        >
                            <X aria-hidden="true" className="h-3.5 w-3.5" />
                            Clear filters
                        </Link>
                    )}
                </div>
            </BlogReveal>
        </section>
    );
}
