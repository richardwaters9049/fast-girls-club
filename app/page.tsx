import Home from "./homepage";
import { getHomepagePosts, getBlogPosts } from "@/lib/wordpress/client";

export const revalidate = 15;

async function getPublishedArticleSlugs(): Promise<string[]> {
    const first = await getBlogPosts({ perPage: 100 });
    const rest = await Promise.all(Array.from({ length: Math.max(0, first.totalPages - 1) }, (_, index) => getBlogPosts({ perPage: 100, page: index + 2 })));
    return [...first.posts, ...rest.flatMap((page) => page.posts)].map((post) => post.slug);
}

export default async function Page(): Promise<React.ReactElement> {
    // Render editorial cards in the initial HTML; the client continues polling
    // for CMS changes without putting navigation behind another fetch.
    const [posts, articleSlugs] = await Promise.all([
        getHomepagePosts().catch(() => []),
        getPublishedArticleSlugs().catch(() => []),
    ]);
    return <Home initialPosts={posts} articleSlugs={articleSlugs} />;
}
