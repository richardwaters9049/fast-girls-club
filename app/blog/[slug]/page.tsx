import type {
    Metadata,
} from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import ArticleContent from "@/components/blog/ArticleContent";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import { SITE_URL } from "@/lib/config";
import {
    getPostBySlug,
} from "@/lib/wordpress/client";

interface BlogArticlePageProps {
    params: Promise<{
        slug: string;
    }>;
}

function formatDate(date: string): string {
    return new Intl.DateTimeFormat("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
    }).format(new Date(date));
}

export async function generateMetadata({
    params,
}: BlogArticlePageProps): Promise<Metadata> {
    const { slug } = await params;

    const post = await getPostBySlug(slug);

    if (!post) {
        return {
            title: "Article Not Found",
        };
    }

    return {
        title: {
            absolute:
                post.seo.title ??
                `${post.title} | Fast Girls Club`,
        },
        description:
            post.seo.description ??
            post.excerpt,
        alternates: {
            canonical: `${SITE_URL}/blog/${slug}`,
        },
        openGraph: {
            title:
                post.seo.title ??
                post.title,
            description:
                post.seo.description ??
                post.excerpt,
            type: "article",
            url: `${SITE_URL}/blog/${slug}`,
            publishedTime: post.date,
            modifiedTime: post.modified,
            images: post.seo.image
                ? [
                    {
                        url: post.featuredImage?.heroUrl ?? post.seo.image,
                    },
                ]
                : undefined,
        },
    };
}

export default async function BlogArticlePage({
    params,
}: BlogArticlePageProps): Promise<React.ReactElement> {
    const { slug } = await params;

    const post = await getPostBySlug(slug);

    if (!post) {
        notFound();
    }

    const primaryCategory =
        post.categories[0];

    return (
        <main className="min-h-screen bg-[#e6e6e6] text-[#1c1c1c]">
            <Header />
            <section className="bg-[#1c1c1c] px-6 py-10 text-white lg:px-10 lg:py-14">
                <div className="mx-auto max-w-[77.5rem]">
                    <Link
                        href="/blog"
                        className="inline-flex text-[10px] font-black uppercase tracking-[0.2em] text-white/45 transition-colors hover:text-[#ff729f]"
                    >
                        ← Back to news
                    </Link>

                    <div className="mt-10 max-w-5xl">
                        {primaryCategory && (
                            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#ff729f]">
                                {
                                    primaryCategory.name
                                }
                            </p>
                        )}

                        <h1 className="mt-5 text-[clamp(3rem,7vw,7rem)] font-black uppercase leading-[0.84] tracking-[-0.07em]">
                            {post.title}
                            <span className="text-[#ff729f]">
                                .
                            </span>
                        </h1>

                        <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3 text-[10px] font-bold uppercase tracking-[0.2em] text-white/35">
                            <span>
                                {formatDate(
                                    post.date,
                                )}
                            </span>

                            {post.author && (
                                <>
                                    <span className="h-1 w-1 bg-[#ee8434]" />

                                    <span>
                                        By{" "}
                                        {
                                            post.author
                                        }
                                    </span>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {post.featuredImage && (
                <section className="px-6 pt-6 lg:px-10 lg:pt-10">
                    <div className="mx-auto max-w-[77.5rem]">
                        <div className="relative aspect-[16/8] overflow-hidden bg-[#1c1c1c]">
                            <Image
                                src={post.featuredImage.heroUrl}
                                alt={
                                    post
                                        .featuredImage
                                        .alt ||
                                    post.title
                                }
                                fill
                                priority
                                sizes="(max-width: 1280px) 100vw, 1240px"
                                className="object-cover"
                            />
                        </div>
                    </div>
                </section>
            )}

            <section className="px-6 py-10 lg:px-10 lg:py-16">
                <div className="mx-auto grid max-w-[77.5rem] gap-10 lg:grid-cols-[minmax(0,1fr)_18rem]">
                    <article className="min-w-0 bg-white p-6 md:p-10 lg:p-14">
                        <ArticleContent
                            content={post.content}
                        />
                    </article>

                    <aside className="self-start bg-[#1c1c1c] p-6 text-white lg:sticky lg:top-6">
                        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#ff729f]">
                            Fast Girls Club
                        </p>

                        <h2 className="mt-4 text-2xl font-black uppercase leading-none tracking-[-0.04em]">
                            More from
                            <br />
                            the club.
                        </h2>

                        <Link
                            href="/blog"
                            className="mt-8 inline-flex border-b-2 border-[#ff729f] pb-2 text-[10px] font-black uppercase tracking-[0.2em] text-white transition-colors hover:text-[#ff729f]"
                        >
                            View all stories →
                        </Link>
                    </aside>
                </div>
            </section>
            <Footer />
        </main>
    );
}
