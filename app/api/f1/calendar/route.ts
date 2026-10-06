import { fetchF1Backend } from "@/lib/f1/backend-fetch";
import { connection, NextResponse } from "next/server";

import { F1_API_BASE_URL } from "@/lib/config";

export const revalidate = 21_600;


export async function GET(): Promise<NextResponse> {
  // Cache successful upstream data, never prerender an outage as the API response.
  await connection();
  try {
    const response = await fetchF1Backend(`${F1_API_BASE_URL}/races`, {
      next: {
        revalidate: 21_600,
      },
    });

    if (!response.ok) {
      console.error(`F1 calendar API returned ${response.status}`);

      return NextResponse.json(
        {
          error: "Failed to load the F1 calendar.",
        },
        {
          status: response.status,
          headers: { "Cache-Control": "no-store" },
        },
      );
    }

    const data = await response.json();

    return NextResponse.json(data, {
      headers: {
        "Cache-Control":
          "public, max-age=0, s-maxage=21600, stale-while-revalidate=3600",
      },
    });
  } catch (error) {
    console.error("F1 calendar proxy error:", error);

    return NextResponse.json(
      {
        error: "F1 calendar is currently unavailable.",
      },
      {
        status: 503,
        headers: { "Cache-Control": "no-store" },
      },
    );
  }
}
