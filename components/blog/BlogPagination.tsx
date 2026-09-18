import Link from "next/link";

interface BlogPaginationProps {
    currentPage: number;
    totalPages: number;
    query: string;
    category: string;
    dateRange: string;
    sort: string;
}

function buildPageUrl(
    page: number,
    props: BlogPaginationProps,
): string {
    const params =
        new URLSearchParams();

    if (props.query) {
        params.set(
            "q",
            props.query,
        );
    }

    if (props.category) {
        params.set(
            "category",
            props.category,
        );
    }

    if (
        props.dateRange &&
        props.dateRange !== "all"
    ) {
        params.set(
            "range",
            props.dateRange,
        );
    }

    if (
        props.sort &&
        props.sort !== "newest"
    ) {
        params.set(
            "sort",
            props.sort,
        );
    }

    if (page > 1) {
        params.set(
            "page",
            String(page),
        );
    }

    const queryString =
        params.toString();

    return queryString
        ? `/blog?${queryString}`
        : "/blog";
}

export default function BlogPagination({
    currentPage,
    totalPages,
    query,
    category,
    dateRange,
    sort,
}: BlogPaginationProps): React.ReactElement | null {
    if (totalPages <= 1) {
        return null;
    }

    const pages = Array.from(
        {
            length: totalPages,
        },
        (_, index) => index + 1,
    );

    return (
        <nav
            aria-label="Blog pagination"
            className="mt-10 flex flex-col gap-4 border-t border-[#1c1c1c]/10 pt-6 sm:flex-row sm:items-center sm:justify-between"
        >
            <Link
                href={buildPageUrl(
                    Math.max(
                        1,
                        currentPage - 1,
                    ),
                    {
                        currentPage,
                        totalPages,
                        query,
                        category,
                        dateRange,
                        sort,
                    },
                )}
                aria-disabled={
                    currentPage === 1
                }
                className={`inline-flex items-center justify-center border px-5 py-3 text-[9px] font-black uppercase tracking-[0.18em] transition-colors ${currentPage === 1
                    ? "pointer-events-none border-[#1c1c1c]/5 text-[#1c1c1c]/20"
                    : "border-[#1c1c1c]/15 text-[#1c1c1c]/60 hover:border-[#ff729f] hover:text-[#1c1c1c]"
                    }`}
            >
                ← Previous
            </Link>

            <div className="flex items-center justify-center gap-1 overflow-x-auto">
                {pages.map((page) => {
                    const active =
                        page ===
                        currentPage;

                    return (
                        <Link
                            key={page}
                            href={buildPageUrl(
                                page,
                                {
                                    currentPage,
                                    totalPages,
                                    query,
                                    category,
                                    dateRange,
                                    sort,
                                },
                            )}
                            aria-current={
                                active
                                    ? "page"
                                    : undefined
                            }
                            className={`flex h-10 min-w-10 items-center justify-center px-3 text-[9px] font-black uppercase tracking-[0.12em] transition-colors ${active
                                ? "bg-[#ff729f] text-[#1c1c1c]"
                                : "border border-[#1c1c1c]/10 text-[#1c1c1c]/40 hover:border-[#1c1c1c]/25 hover:text-[#1c1c1c]"
                                }`}
                        >
                            {page}
                        </Link>
                    );
                })}
            </div>

            <Link
                href={buildPageUrl(
                    Math.min(
                        totalPages,
                        currentPage + 1,
                    ),
                    {
                        currentPage,
                        totalPages,
                        query,
                        category,
                        dateRange,
                        sort,
                    },
                )}
                aria-disabled={
                    currentPage ===
                    totalPages
                }
                className={`inline-flex items-center justify-center border px-5 py-3 text-[9px] font-black uppercase tracking-[0.18em] transition-colors ${currentPage ===
                    totalPages
                    ? "pointer-events-none border-[#1c1c1c]/5 text-[#1c1c1c]/20"
                    : "border-[#1c1c1c]/15 text-[#1c1c1c]/60 hover:border-[#ff729f] hover:text-[#1c1c1c]"
                    }`}
            >
                Next →
            </Link>
        </nav>
    );
}