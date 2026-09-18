"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

import type { BlogPostSummary } from "@/lib/wordpress/types";

interface BlogCardProps {
    post: BlogPostSummary;
    index: number;
}

function formatDate(
    date: string,
): string {
    return new Intl.DateTimeFormat(
        "en-GB",
        {
            day: "numeric",
            month: "short",
            year: "numeric",
        },
    ).format(new Date(date));
}

export default function BlogCard({
    post,
    index,
}: BlogCardProps): React.ReactElement {
    const category =
        post.categories[0];

    return (
        <motion.article
            initial={{
                opacity: 0,
                y: 24,
            }}
            animate={{
                opacity: 1,
                y: 0,
            }}
            transition={{
                duration: 0.45,
                delay: index * 0.07,
                ease: [
                    0.22,
                    1,
                    0.36,
                    1,
                ],
            }}
            whileHover={{
                y: -5,
            }}
            className="group h-full overflow-hidden border border-[#1c1c1c]/10 bg-[#1c1c1c] text-white"
        >
            <Link
                href={`/blog/${post.slug}`}
                className="flex h-full flex-col"
            >
                <div className="relative aspect-[16/10] overflow-hidden bg-[#292020]">
                    {post.featuredImage ? (
                        <Image
                            src={
                                post.featuredImage
                                    .url
                            }
                            alt={
                                post.featuredImage
                                    .alt ||
                                post.title
                            }
                            fill
                            sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 25vw"
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                    ) : (
                        <div className="absolute inset-0 bg-[linear-gradient(135deg,#1c1c1c,#3a2029,#ff729f)]" />
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                    <div className="absolute left-5 top-5 flex items-center gap-2">
                        <span className="h-2 w-2 bg-[#ff729f]" />

                        <span className="bg-[#1c1c1c]/85 px-3 py-2 text-[8px] font-black uppercase tracking-[0.18em] text-white backdrop-blur-sm">
                            {category?.name ??
                                "Motorsport"}
                        </span>
                    </div>
                </div>

                <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-center justify-between gap-3">
                        <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-white/30">
                            {formatDate(
                                post.date,
                            )}
                        </span>

                        <span className="text-[8px] font-black uppercase tracking-[0.2em] text-[#ff729f] transition-transform duration-300 group-hover:translate-x-1">
                            Read →
                        </span>
                    </div>

                    <h2 className="mt-5 text-2xl font-black uppercase leading-[0.9] tracking-[-0.05em]">
                        {post.title}
                    </h2>

                    {post.excerpt && (
                        <p className="mt-4 line-clamp-4 text-sm leading-6 text-white/45">
                            {post.excerpt}
                        </p>
                    )}

                    <div className="mt-auto pt-6">
                        <div className="h-px w-full bg-white/10 transition-colors duration-300 group-hover:bg-[#ff729f]/50" />
                    </div>
                </div>
            </Link>
        </motion.article>
    );
}