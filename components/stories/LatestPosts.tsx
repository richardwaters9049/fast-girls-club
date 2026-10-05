"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import BlogCard from "@/components/blog/BlogCard";
import type { BlogPostSummary } from "@/lib/wordpress/types";

export default function LatestPosts({ initialPosts = [] }: { initialPosts?: Array<BlogPostSummary | null> }): React.ReactElement {
  const [posts, setPosts] = useState<Array<BlogPostSummary | null>>(initialPosts);
  const [loading, setLoading] = useState(initialPosts.length === 0);

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;
    let inFlight = false;

    const refresh = async () => {
      if (inFlight || document.visibilityState === "hidden") return;
      inFlight = true;
      try {
        const response = await fetch("/api/blog/latest", {
          cache: "no-store",
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("Latest stories unavailable");
        const data = (await response.json()) as { posts?: Array<BlogPostSummary | null> };
        if (!cancelled) setPosts(data.posts ?? []);
      } catch (error: unknown) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        if (!cancelled) setPosts([]);
      } finally {
        inFlight = false;
        if (!cancelled) setLoading(false);
      }
    };

    void refresh();
    const interval = window.setInterval(() => { void refresh(); }, 30_000);
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);

    return () => {
      cancelled = true;
      controller.abort();
      window.clearInterval(interval);
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
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

  if (!posts.some(Boolean)) {
    return (
      <div className="mt-10 border border-[#1c1c1c]/10 bg-white p-8">
        <p className="text-sm text-[#1c1c1c]/60">Latest stories are temporarily unavailable.</p>
        <Link prefetch={true} href="/blog" className="mt-5 inline-block border-b-2 border-[#ff729f] pb-1 text-xs font-black uppercase tracking-[0.18em]">
          Visit the news desk →
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-10 grid gap-5 md:grid-cols-3">
      {posts.map((post, index) => (
        post ? <BlogCard key={post.id} post={post} index={index} /> : <div key={`empty-${index}`} className="hidden md:block" aria-hidden="true" />
      ))}
    </div>
  );
}
