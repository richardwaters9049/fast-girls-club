import Home from "./homepage";
import { getHomepagePosts } from "@/lib/wordpress/client";

export const revalidate = 15;

export default async function Page(): Promise<React.ReactElement> {
    // Render editorial cards in the initial HTML; the client continues polling
    // for CMS changes without putting navigation behind another fetch.
    const posts = await getHomepagePosts().catch(() => []);
    return <Home initialPosts={posts} />;
}
