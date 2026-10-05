import { NextResponse } from "next/server";

import { getHomepagePosts } from "@/lib/wordpress/client";

export const revalidate = 60;

export async function GET(): Promise<NextResponse> {
  try {
    const posts = await getHomepagePosts();

    return NextResponse.json(
      { posts },
      {
        headers: {
          "Cache-Control": "public, max-age=0, s-maxage=60, stale-while-revalidate=300",
        },
      },
    );
  } catch (error) {
    console.error("Failed to load latest WordPress stories:", error);

    return NextResponse.json({ posts: [] }, { status: 503 });
  }
}
