"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import BlogCard from "@/components/blog/BlogCard";
import type { BlogPostSummary } from "@/lib/wordpress/types";

export default function LatestPosts(): React.ReactElement {
  const [posts, setPosts] = useState<BlogPostSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;

    void fetch("/api/blog/latest", { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("Latest stories unavailable");
        const data = (await response.json()) as { posts?: BlogPostSummary[] };
        if (!cancelled) setPosts(data.posts ?? []);
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        if (!cancelled) setPosts([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, []);

  if (loading) {
    return (
      <div className="mt-10 grid gap-5 md:grid-cols-3" aria-label="Loading latest stories">
        {[0, 1, 2].map((item) => (
          <div key={item} className="aspect-[4/3] animate-pulse bg-[#1c1c1c]/10" />
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="mt-10 border border-[#1c1c1c]/10 bg-white p-8">
        <p className="text-sm text-[#1c1c1c]/60">Latest stories are temporarily unavailable.</p>
        <Link href="/blog" className="mt-5 inline-block border-b-2 border-[#ff729f] pb-1 text-xs font-black uppercase tracking-[0.18em]">
          Visit the news desk →
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-10 grid gap-5 md:grid-cols-3">
      {posts.map((post, index) => (
        <BlogCard key={post.id} post={post} index={index} />
      ))}
    </div>
  );
}
