import { fetchF1Backend } from "@/lib/f1/backend-fetch";
import { connection, NextResponse } from "next/server";

import { normaliseResult } from "@/lib/f1/results-adapter";

import { F1_API_BASE_URL } from "@/lib/config";

export const revalidate = 60;


export async function GET(
  _request: Request,
  {
    params,
  }: {
    params: Promise<{
      round: string;
    }>;
  },
): Promise<NextResponse> {
  const { round: roundParam } = await params;
  const round = Number(roundParam);

  if (!Number.isInteger(round) || round < 1) {
    return NextResponse.json(
      {
        error: "Invalid race round",
      },
      {
        status: 400,
        headers: { "Cache-Control": "no-store" },
      },
    );
  }

  // Cache successful upstream data, never prerender an outage as the API response.
  await connection();
  try {
    const raceResponse = await fetchF1Backend(`${F1_API_BASE_URL}/races/${round}`, {
      headers: {
        Accept: "application/json",
      },
      next: {
        revalidate: 1_800,
      },
    });

    if (!raceResponse.ok) {
      throw new Error(`F1 race request returned ${raceResponse.status}`);
    }

    const raceData = (await raceResponse.json()) as {
      season?: number;
    };

    const season = raceData.season;

    if (!Number.isInteger(season)) {
      throw new Error("F1 race response did not include a valid season");
    }

    const url = `${F1_API_BASE_URL}/results/${season}/${round}`;

    const response = await fetchF1Backend(url, {
      headers: {
        Accept: "application/json",
      },
      next: {
        revalidate: 60,
      },
    });

    if (response.status === 404) {
      return NextResponse.json(
        {
          season,
          round,
          raceName: null,
          results: [],
        },
        {
          status: 200,
          headers: {
            "Cache-Control":
              "public, max-age=0, s-maxage=60, stale-while-revalidate=30",
          },
        },
      );
    }

    if (!response.ok) {
      throw new Error(`F1 backend returned ${response.status}`);
    }

    const data = (await response.json()) as { season: number; round: number; raceName: string | null; results: unknown[] };

    if (!data || !Array.isArray(data.results)) {
      throw new Error("Invalid race results response");
    }

    if (data.round !== round || data.season !== season) {
      return NextResponse.json(
        {
          error: "Race results season or round mismatch",
        },
        {
          status: 502,
          headers: { "Cache-Control": "no-store" },
        },
      );
    }

    const results = data.results.map(normaliseResult);

    const cacheSeconds = 60;

    return NextResponse.json(
      {
        season: data.season,
        round: data.round,
        raceName: data.raceName,
        results,
      },
      {
        headers: {
          "Cache-Control": `public, max-age=0, s-maxage=${cacheSeconds}, stale-while-revalidate=300`,
        },
      },
    );
  } catch (error) {
    console.error("Failed to fetch F1 race results:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch F1 race results",
      },
      {
        status: 502,
        headers: { "Cache-Control": "no-store" },
      },
    );
  }
}
