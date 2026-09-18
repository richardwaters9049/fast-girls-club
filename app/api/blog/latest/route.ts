import { NextResponse } from "next/server";

import { getBlogPosts } from "@/lib/wordpress/client";

export const revalidate = 60;

export async function GET(): Promise<NextResponse> {
  try {
    const result = await getBlogPosts({ perPage: 3 });

    return NextResponse.json(
      { posts: result.posts },
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
