import { NextResponse } from "next/server";

import { getHomepagePosts } from "@/lib/wordpress/client";

export const revalidate = 0;

const headers = { "Cache-Control": "no-store" };

export async function GET(): Promise<NextResponse> {
  try {
    const posts = await getHomepagePosts();

    return NextResponse.json(
      { posts },
      {
        headers,
      },
    );
  } catch (error) {
    console.error("Failed to load latest WordPress stories:", error);

    return NextResponse.json({ posts: [] }, { status: 503, headers });
  }
}
