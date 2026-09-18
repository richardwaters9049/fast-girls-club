import { NextResponse } from "next/server";

import { F1_API_BASE_URL } from "@/lib/config";
import { countryNameToCode } from "@/lib/f1/countries";

export const revalidate = 1800;

const TEAM_COLOURS: Record<string, string> = {
  mercedes: "#27F4D2",
  ferrari: "#E80020",
  mclaren: "#FF8000",
  red_bull: "#3671C6",
  alpine: "#FF87BC",
  rb: "#6692FF",
  aston_martin: "#229971",
  haas: "#B6BABD",
  audi: "#F50537",
  williams: "#64C4FF",
  cadillac: "#D0D0D0",
};

interface ApiDriverStanding {
  position: number;
  points: number;
  wins: number;
  driver: {
    nationality: string;
    number: number | null;
  };
  teamId?: string;
  team: {
    name: string;
  };
}

interface ApiDriverStandingsResponse {
  season: number;
  count: number;
  standings: ApiDriverStanding[];
}

interface ApiDriver {
  driverId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  nationality: string;
  dateOfBirth: string;
  number: string | null;
  code: string | null;
  url: string;
}

interface ApiDriversResponse {
  drivers: ApiDriver[];
}

export async function GET() {
  try {
    const [standingsResponse, driversResponse] = await Promise.all([
      fetch(`${F1_API_BASE_URL}/standings/drivers`, {
        next: {
          revalidate: 1800,
        },
        signal: AbortSignal.timeout(10_000),
      }),
      fetch(`${F1_API_BASE_URL}/drivers`, {
        next: {
          revalidate: 1800,
        },
        signal: AbortSignal.timeout(10_000),
      }),
    ]);

    if (!standingsResponse.ok) {
      throw new Error(
        `Driver standings request failed: ${standingsResponse.status}`,
      );
    }

    if (!driversResponse.ok) {
      throw new Error(`Driver list request failed: ${driversResponse.status}`);
    }

    const standingsData =
      (await standingsResponse.json()) as ApiDriverStandingsResponse;

    const driversData = (await driversResponse.json()) as ApiDriversResponse;

    const driversByNumber = new Map<number, ApiDriver>();

    for (const driver of driversData.drivers) {
      const driverNumber = Number(driver.number);

      if (Number.isFinite(driverNumber)) {
        driversByNumber.set(driverNumber, driver);
      }
    }

    const standings = standingsData.standings.map((standing) => {
      const driverNumber = standing.driver.number ?? 0;
      const driver = driversByNumber.get(driverNumber);

      const nationality = driver?.nationality ?? standing.driver.nationality;

      return {
        position: standing.position,
        driverNumber,
        driver: driver
          ? driver.fullName || `${driver.firstName} ${driver.lastName}`.trim()
          : `#${driverNumber}`,
        acronym: driver?.code ?? "",
        nationality,
        countryCode: countryNameToCode(nationality),
        team: standing.team.name,
        points: standing.points,
        pointsStart: standing.points,
        headshotUrl: null,
        teamColour: TEAM_COLOURS[standing.teamId ?? ""] ?? "#FFFFFF",
      };
    });

    return NextResponse.json(
      {
        season: standingsData.season,
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
  } catch (error) {
    console.error("Failed to fetch driver standings:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch driver standings",
      },
      {
        status: 500,
      },
    );
  }
}
