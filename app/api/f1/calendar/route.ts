import { NextResponse } from "next/server";

const F1_API_URL = process.env.F1_API_URL ?? "http://localhost:8787/api/races";

export async function GET(): Promise<NextResponse> {
  try {
    const response = await fetch(F1_API_URL, {
      cache: "no-store",
    });

    if (!response.ok) {
      console.error(`F1 calendar API returned ${response.status}`);

      return NextResponse.json(
        {
          error: "Failed to load the F1 calendar.",
        },
        {
          status: response.status,
        },
      );
    }

    const data = await response.json();

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "no-store, max-age=0",
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
      },
    );
  }
}
