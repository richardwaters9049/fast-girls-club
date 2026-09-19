import Image from "next/image";
import Link from "next/link";

import type { BlogPostSummary } from "@/lib/wordpress/types";

interface BlogLeadStoryProps {
    post: BlogPostSummary;
}

export default function BlogLeadStory({
    post,
}: BlogLeadStoryProps): React.ReactElement {
    const date = new Intl.DateTimeFormat("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
    }).format(new Date(post.date));

    return (
        <article className="group overflow-hidden bg-[#1c1c1c] text-white">
            <Link
                href={`/blog/${post.slug}`}
                className="grid focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ff729f] lg:grid-cols-[1.15fr_0.85fr]"
            >
                <div className="relative aspect-[16/10] overflow-hidden bg-[#33252c] lg:aspect-auto lg:min-h-[26rem]">
                    {post.featuredImage ? (
                        <Image
                            src={post.featuredImage.url}
                            alt={post.featuredImage.alt || post.title}
                            fill
                            sizes="(max-width: 1023px) 100vw, 60vw"
                            className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                        />
                    ) : (
                        <div className="absolute inset-0 bg-[linear-gradient(135deg,#1c1c1c,#4d2936,#ff729f)]" />
                    )}
                    <div className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,#ff729f,#ee8434)]" />
                    <div className="absolute bottom-5 left-5 bg-[#1c1c1c]/85 px-3 py-2 text-[9px] font-black uppercase tracking-[0.2em] backdrop-blur-sm">
                        Lead story
                    </div>
                </div>

                <div className="flex flex-col justify-between p-6 sm:p-9 lg:p-12">
                    <div>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#ff98b9]">
                            <span>{post.categories[0]?.name ?? "Motorsport"}</span>
                            <span className="h-1 w-1 bg-[#ee8434]" />
                            <time dateTime={post.date}>{date}</time>
                        </div>

                        <h3 className="mt-7 text-[clamp(2.4rem,4vw,4.75rem)] font-black uppercase leading-[0.9] tracking-[-0.065em] transition-colors duration-300 group-hover:text-[#ff98b9]">
                            {post.title}
                        </h3>

                        {post.excerpt && (
                            <p className="mt-6 line-clamp-4 max-w-[34rem] text-sm leading-7 text-white/60 md:text-base">
                                {post.excerpt}
                            </p>
                        )}
                    </div>

                    <span className="mt-10 flex items-center justify-between border-t border-white/15 pt-5 text-[10px] font-black uppercase tracking-[0.2em]">
                        Read the story
                        <span className="text-xl text-[#ff729f] transition-transform group-hover:translate-x-2">→</span>
                    </span>
                </div>
            </Link>
        </article>
    );
}
