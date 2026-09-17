import { NextResponse } from "next/server";

export const revalidate = 1800;

const F1_API_BASE = process.env.F1_API_BASE ?? "http://localhost:8787/api";

interface ApiConstructorStanding {
  classificationId: number;
  position: number;
  points: number;
  wins: number;
  teamId: string;
  team: {
    name: string;
    nationality: string;
    firstAppearance: number;
    constructorsChampionships: number | null;
    driversChampionships: number | null;
    url: string;
  };
}

interface ApiConstructorStandingsResponse {
  season: number;
  championshipId: string;
  count: number;
  standings: ApiConstructorStanding[];
}

export async function GET() {
  try {
    const response = await fetch(`${F1_API_BASE}/standings/constructors`, {
      next: {
        revalidate: 1800,
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        {
          error: "Unable to fetch constructor standings",
        },
        {
          status: response.status,
        },
      );
    }

    const data = (await response.json()) as ApiConstructorStandingsResponse;

    const standings = data.standings.map((standing) => ({
      position: standing.position,
      team: standing.team.name,
      points: standing.points,
    }));

    return NextResponse.json(
      {
        season: data.season,
        count: standings.length,
        standings,
      },
      {
        headers: {
          "Cache-Control":
            "public, max-age=0, s-maxage=1800, stale-while-revalidate=300",
        },
      },
    );
  } catch {
    return NextResponse.json(
      {
        error: "Unable to fetch constructor standings",
      },
      {
        status: 500,
      },
    );
  }
}
