import type { Metadata } from "next";
import Link from "next/link";

import BlogCard from "@/components/blog/BlogCard";
import BlogDashboardControls from "@/components/blog/BlogDashboardControls";
import BlogPagination from "@/components/blog/BlogPagination";

import {
    getBlogCategories,
    getBlogPosts,
} from "@/lib/wordpress/client";

import type {
    BlogDateRange,
    BlogSort,
} from "@/lib/wordpress/types";

export const metadata: Metadata = {
    title: "News | Fast Girls Club",
    description:
        "Explore the latest Fast Girls Club motorsport stories, news and articles.",
};

const PAGE_SIZE = 4;

interface BlogPageProps {
    searchParams: Promise<
        Record<
            string,
            string | string[] | undefined
        >
    >;
}

function getFirstValue(
    value:
        | string
        | string[]
        | undefined,
): string {
    if (Array.isArray(value)) {
        return value[0] ?? "";
    }

    return value ?? "";
}

function getDateRange(
    value: string,
): BlogDateRange {
    if (
        value === "7d" ||
        value === "30d" ||
        value === "year"
    ) {
        return value;
    }

    return "all";
}

function getSort(
    value: string,
): BlogSort {
    return value === "oldest"
        ? "oldest"
        : "newest";
}

function getPage(
    value: string,
): number {
    const parsed = Number(value);

    if (
        !Number.isInteger(parsed) ||
        parsed < 1
    ) {
        return 1;
    }

    return parsed;
}

export default async function BlogPage({
    searchParams,
}: BlogPageProps): Promise<React.ReactElement> {
    const params =
        await searchParams;

    const query =
        getFirstValue(params.q);

    const category =
        getFirstValue(
            params.category,
        );

    const dateRange =
        getDateRange(
            getFirstValue(params.range),
        );

    const sort =
        getSort(
            getFirstValue(params.sort),
        );

    const requestedPage =
        getPage(
            getFirstValue(params.page),
        );

    const categories =
        await getBlogCategories();

    const selectedCategory =
        categories.find(
            (item) =>
                item.slug ===
                category,
        );

    const result =
        await getBlogPosts({
            page: requestedPage,
            perPage: PAGE_SIZE,
            query,
            categoryId:
                selectedCategory?.id,
            dateRange,
            sort,
        });

    const totalPages =
        result.totalPages;

    const currentPage =
        totalPages > 0
            ? Math.min(
                requestedPage,
                totalPages,
            )
            : 1;

    const hasFilters =
        Boolean(
            query ||
            category ||
            dateRange !==
            "all" ||
            sort !==
            "newest",
        );

    return (
        <main className="min-h-screen bg-[#e6e6e6] text-[#1c1c1c]">
            <section className="relative overflow-hidden bg-[#1c1c1c] px-6 py-10 text-white lg:px-10 lg:py-14">
                <div className="absolute -right-40 -top-40 h-[34rem] w-[34rem] rounded-full bg-[#ff729f]/10 blur-3xl" />

                <div className="absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-[#ff729f]/60 to-transparent" />

                <div className="relative mx-auto max-w-[77.5rem]">
                    <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
                        <div className="max-w-4xl">
                            <Link
                                href="/"
                                className="inline-flex text-[9px] font-black uppercase tracking-[0.2em] text-white/35 transition-colors hover:text-[#ff729f]"
                            >
                                ← Fast Girls
                                Club
                            </Link>

                            <div className="mt-10">
                                <div className="flex items-center gap-3">
                                    <span className="h-2 w-2 bg-[#ff729f]" />

                                    <p className="text-[9px] font-black uppercase tracking-[0.25em] text-white/40">
                                        Editorial
                                        desk
                                    </p>
                                </div>

                                <h1 className="mt-5 text-[clamp(4rem,9vw,8rem)] font-black uppercase leading-[0.8] tracking-[-0.08em]">
                                    News
                                    <span className="text-[#ff729f]">
                                        .
                                    </span>
                                </h1>

                                <p className="mt-7 max-w-2xl text-sm leading-7 text-white/45 md:text-base">
                                    Stories,
                                    drivers,
                                    teams and
                                    racing
                                    culture from
                                    the Fast Girls
                                    Club.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 border border-white/10 bg-white/[0.03] md:min-w-[25rem]">
                            <div className="border-r border-white/10 p-4 md:p-5">
                                <p className="text-[8px] font-bold uppercase tracking-[0.18em] text-white/30">
                                    Stories
                                </p>

                                <p className="mt-3 text-2xl font-black tracking-[-0.04em] text-[#ff729f]">
                                    {
                                        result.total
                                    }
                                </p>
                            </div>

                            <div className="border-r border-white/10 p-4 md:p-5">
                                <p className="text-[8px] font-bold uppercase tracking-[0.18em] text-white/30">
                                    Categories
                                </p>

                                <p className="mt-3 text-2xl font-black tracking-[-0.04em] text-[#ee8434]">
                                    {
                                        categories.length
                                    }
                                </p>
                            </div>

                            <div className="p-4 md:p-5">
                                <p className="text-[8px] font-bold uppercase tracking-[0.18em] text-white/30">
                                    Page
                                </p>

                                <p className="mt-3 text-2xl font-black tracking-[-0.04em]">
                                    {currentPage}
                                    <span className="text-white/25">
                                        /
                                        {
                                            totalPages ||
                                            1
                                        }
                                    </span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <BlogDashboardControls
                query={query}
                category={category}
                dateRange={
                    dateRange
                }
                sort={sort}
                categories={
                    categories
                }
            />

            <section className="px-6 py-8 lg:px-10 lg:py-12">
                <div className="mx-auto max-w-[77.5rem]">
                    <div className="mb-7 flex flex-col justify-between gap-4 border-b border-[#1c1c1c]/10 pb-5 sm:flex-row sm:items-end">
                        <div>
                            <p className="text-[9px] font-black uppercase tracking-[0.22em] text-[#ee8434]">
                                {hasFilters
                                    ? "Filtered results"
                                    : "Latest stories"}
                            </p>

                            <h2 className="mt-2 text-3xl font-black uppercase tracking-[-0.05em] md:text-4xl">
                                {query
                                    ? `Search: ${query}`
                                    : selectedCategory
                                        ? selectedCategory.name
                                        : "The latest"}
                            </h2>
                        </div>

                        <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#1c1c1c]/35">
                            {result.total}{" "}
                            {result.total ===
                                1
                                ? "story"
                                : "stories"}
                        </p>
                    </div>

                    {result.posts.length >
                        0 ? (
                        <>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                                {result.posts.map(
                                    (
                                        post,
                                        index,
                                    ) => (
                                        <BlogCard
                                            key={
                                                post.id
                                            }
                                            post={
                                                post
                                            }
                                            index={
                                                index
                                            }
                                        />
                                    ),
                                )}
                            </div>

                            <BlogPagination
                                currentPage={
                                    currentPage
                                }
                                totalPages={
                                    totalPages
                                }
                                query={
                                    query
                                }
                                category={
                                    category
                                }
                                dateRange={
                                    dateRange
                                }
                                sort={
                                    sort
                                }
                            />
                        </>
                    ) : (
                        <div className="border border-[#1c1c1c]/10 bg-white px-6 py-20 text-center">
                            <p className="text-[9px] font-black uppercase tracking-[0.24em] text-[#ee8434]">
                                No matches
                            </p>

                            <h2 className="mt-4 text-4xl font-black uppercase tracking-[-0.06em]">
                                Nothing found.
                            </h2>

                            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[#1c1c1c]/50">
                                Try another search
                                term or remove
                                one of the filters
                                to see more Fast
                                Girls Club
                                stories.
                            </p>

                            <Link
                                href="/blog"
                                className="mt-8 inline-flex bg-[#1c1c1c] px-6 py-3 text-[9px] font-black uppercase tracking-[0.18em] text-white transition-colors hover:bg-[#ff729f] hover:text-[#1c1c1c]"
                            >
                                Reset dashboard
                            </Link>
                        </div>
                    )}
                </div>
            </section>
        </main>
    );
}