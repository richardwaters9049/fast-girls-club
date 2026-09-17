import { NextResponse } from "next/server";

const BACKEND_API_BASE_URL =
  process.env.F1_BACKEND_API_BASE_URL ?? "http://localhost:8787/api";

export const revalidate = 60;

interface BackendResult {
  position: number | null;
  number: number | null;
  points: number | null;
  driverId: string;
  driver: {
    driverId: string;
    firstName: string;
    lastName: string;
    fullName: string;
    nationality: string;
    number: number | null;
    code: string | null;
  } | null;
  constructorId: string | null;
  constructor: {
    constructorId: string;
    name: string;
    nationality: string;
  } | null;
  grid: number | null;
  laps: number | null;
  status: string | null;
  fastestLap: {
    rank: number | null;
    lap: number | null;
    time: string | null;
    averageSpeed: string | null;
  } | null;
  time: string | null;
  milliseconds: number | null;
}

interface BackendResultsResponse {
  season: number;
  round: number;
  raceName: string;
  results: BackendResult[];
}

function normaliseResult(result: BackendResult) {
  return {
    position: result.position,
    number: result.number,
    points: result.points,
    driverId: result.driverId,
    driver: result.driver
      ? {
          driverId: result.driver.driverId,
          name: result.driver.fullName,
          firstName: result.driver.firstName,
          lastName: result.driver.lastName,
          nationality: result.driver.nationality,
          number: result.driver.number,
          code: result.driver.code,
        }
      : null,
    constructorId: result.constructorId,
    constructor: result.constructor
      ? {
          constructorId: result.constructor.constructorId,
          name: result.constructor.name,
          nationality: result.constructor.nationality,
        }
      : null,
    grid: result.grid,
    laps: result.laps,
    status: result.status,
    fastestLap: result.fastestLap,
    time: result.time,
    milliseconds: result.milliseconds,
  };
}

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
      },
    );
  }

  const season = 2026;
  const url = `${BACKEND_API_BASE_URL}/results/${season}/${round}`;

  try {
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
      },
      next: {
        revalidate: 60,
      },
      signal: AbortSignal.timeout(10_000),
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

    const data = (await response.json()) as BackendResultsResponse;

    if (!data || !Array.isArray(data.results)) {
      throw new Error("Invalid race results response");
    }

    if (data.round !== round) {
      return NextResponse.json(
        {
          error: "Race results round mismatch",
        },
        {
          status: 502,
        },
      );
    }

    const results = data.results.map(normaliseResult);

    const cacheSeconds = results.length > 0 ? 43_200 : 60;

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
      },
    );
  }
}
