import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import BlogCard from "@/components/blog/BlogCard";
import BlogDashboardControls from "@/components/blog/BlogDashboardControls";
import BlogLeadStory from "@/components/blog/BlogLeadStory";
import BlogPagination from "@/components/blog/BlogPagination";
import BlogReveal from "@/components/blog/BlogReveal";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";

import {
    getBlogCategories,
    getBlogPosts,
} from "@/lib/wordpress/client";

import type {
    BlogDateRange,
    BlogSort,
} from "@/lib/wordpress/types";

export const metadata: Metadata = {
    title: "News",
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

function buildBlogUrl(values: {
    query: string;
    category: string;
    dateRange: BlogDateRange;
    sort: BlogSort;
    page?: number;
}): string {
    const params = new URLSearchParams();

    if (values.query) params.set("q", values.query);
    if (values.category) params.set("category", values.category);
    if (values.dateRange !== "all") params.set("range", values.dateRange);
    if (values.sort !== "newest") params.set("sort", values.sort);
    if (values.page && values.page > 1) params.set("page", String(values.page));

    const queryString = params.toString();
    return queryString ? `/blog?${queryString}` : "/blog";
}

export default async function BlogPage({
    searchParams,
}: BlogPageProps): Promise<React.ReactElement> {
    const params =
        await searchParams;

    const query =
        getFirstValue(params.q).trim();

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

    if (category && !selectedCategory) {
        redirect(buildBlogUrl({
            query,
            category: "",
            dateRange,
            sort,
        }));
    }

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

    if (result.page !== requestedPage) {
        redirect(buildBlogUrl({
            query,
            category,
            dateRange,
            sort,
            page: result.page,
        }));
    }

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
            <Header />
            <section className="relative isolate overflow-hidden bg-[#1c1c1c] px-6 py-14 text-white lg:px-10 lg:py-20">
                <div aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,#ff729f,#ee8434,transparent_85%)]" />
                <div className="absolute inset-0 -z-20 bg-[linear-gradient(115deg,#1c1c1c_35%,#37232b_75%,#52312c_130%)]" />
                <div className="absolute -right-24 -top-32 -z-10 h-[32rem] w-[32rem] rounded-full bg-[#ff729f]/10 blur-3xl" />
                <div aria-hidden="true" className="absolute -bottom-12 right-0 -z-10 hidden text-[clamp(11rem,23vw,23rem)] font-black uppercase leading-none tracking-[-0.1em] text-white/[0.025] lg:block">Read</div>
                <div className="absolute inset-x-0 bottom-0 h-1 bg-[linear-gradient(90deg,#ff729f,#ee8434,transparent_90%)]" />

                <div className="mx-auto grid max-w-[77.5rem] gap-10 md:grid-cols-[1fr_auto] md:items-end">
                    <BlogReveal direction="left">
                        <div className="flex items-center gap-3">
                            <span className="h-2 w-2 bg-[#ff729f]" />
                            <p className="text-[10px] font-black uppercase tracking-[0.26em] text-white/60">Fast Girls Club / Editorial</p>
                            <span className="h-px w-9 bg-[#ee8434]" />
                        </div>

                        <h1 className="mt-7 text-[clamp(3.1rem,10vw,9rem)] font-black uppercase leading-[0.92] tracking-[-0.075em] md:leading-[0.84]">
                            The<br /><span className="text-[#ff729f]">paddock</span><span className="text-[#ee8434]">.</span>
                        </h1>

                        <p className="mt-8 max-w-[33rem] text-base leading-7 text-white/65 md:text-lg">
                            Fresh perspectives on the racing, the people and the moments worth talking about.
                        </p>
                    </BlogReveal>

                    <BlogReveal delay={0.18} className="border-l border-[#ff729f]/50 pl-5 md:max-w-[13rem]">
                        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#ff9ebd]">In this edition</p>
                        <p className="mt-3 text-4xl font-black tracking-[-0.06em]">{result.total}</p>
                        <p className="mt-1 text-xs leading-5 text-white/50">{result.total === 1 ? "story" : "stories"} to explore</p>
                    </BlogReveal>
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

            <section id="stories" className="scroll-mt-24 px-6 py-12 lg:px-10 lg:py-16">
                <div className="mx-auto max-w-[77.5rem]">
                    <BlogReveal direction="left" className="mb-8 flex flex-col justify-between gap-4 border-b border-[#1c1c1c]/15 pb-6 sm:flex-row sm:items-end">
                        <div>
                            <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.22em] text-[#b95322]">
                                <span className="h-2 w-2 bg-[#ee8434]" />
                                {hasFilters
                                    ? "Your selection"
                                    : "Straight from the paddock"}
                            </p>

                            <h2 className="mt-3 max-w-[45rem] break-words text-4xl font-black uppercase leading-[1.04] tracking-[-0.06em] md:text-6xl md:leading-[0.96]">
                                {query
                                    ? `Search: ${query}`
                                    : selectedCategory
                                        ? selectedCategory.name
                                        : "Latest stories"}
                            </h2>
                        </div>

                        <p className="shrink-0 text-[10px] font-bold uppercase tracking-[0.18em] text-[#1c1c1c]/50">
                            {result.total}{" "}
                            {result.total ===
                                1
                                ? "story"
                                : "stories"}
                            <span className="ml-3 text-[#d45580]">/</span>
                            <span className="ml-3">Page {currentPage} of {totalPages || 1}</span>
                        </p>
                    </BlogReveal>

                    {result.posts.length >
                        0 ? (
                        <>
                            <BlogReveal className="mb-6">
                                <BlogLeadStory post={result.posts[0]} />
                            </BlogReveal>

                            {result.posts.length > 1 && (
                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                                {result.posts.slice(1).map(
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
                            )}

                            <BlogReveal>
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
                            </BlogReveal>
                        </>
                    ) : (
                        <BlogReveal className="border border-[#1c1c1c]/10 bg-white px-6 py-20 text-center">
                            <p className="text-[9px] font-black uppercase tracking-[0.24em] text-[#ee8434]">
                                No matches
                            </p>

                            <h2 className="mt-4 text-4xl font-black uppercase leading-[1.05] tracking-[-0.06em]">
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
                                href="/blog#stories"
                                className="mt-8 inline-flex bg-[#1c1c1c] px-6 py-3 text-[9px] font-black uppercase tracking-[0.18em] text-white transition-colors hover:bg-[#ff729f] hover:text-[#1c1c1c]"
                            >
                                Clear all filters
                            </Link>
                        </BlogReveal>
                    )}
                </div>
            </section>
            <Footer />
        </main>
    );
}
