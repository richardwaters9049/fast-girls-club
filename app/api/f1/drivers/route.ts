import { NextResponse } from "next/server";

export const revalidate = 1800;

const F1_API_BASE = process.env.F1_API_BASE ?? "http://localhost:8787/api";

const F1_EXTERNAL_API = "https://f1api.dev/api";

const COUNTRY_CODES: Record<string, string> = {
  Argentina: "AR",
  Australia: "AU",
  Austria: "AT",
  Belgium: "BE",
  Brazil: "BR",
  Canada: "CA",
  China: "CN",
  Denmark: "DK",
  Finland: "FI",
  France: "FR",
  Germany: "DE",
  "Great Britain": "GB",
  Italy: "IT",
  Japan: "JP",
  Mexico: "MX",
  Monaco: "MC",
  Netherlands: "NL",
  "New Zealand": "NZ",
  Poland: "PL",
  Portugal: "PT",
  Russia: "RU",
  Spain: "ES",
  Thailand: "TH",
  "United States": "US",
};

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
  name: string;
  surname: string;
  nationality: string;
  birthday: string;
  number: number | null;
  shortName: string;
  url: string;
}

interface ApiDriversResponse {
  drivers: ApiDriver[];
}

export async function GET() {
  try {
    const [standingsResponse, driversResponse] = await Promise.all([
      fetch(`${F1_API_BASE}/standings/drivers`, {
        next: {
          revalidate: 1800,
        },
      }),
      fetch(`${F1_EXTERNAL_API}/current/drivers?limit=100`, {
        next: {
          revalidate: 1800,
        },
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
      if (driver.number !== null) {
        driversByNumber.set(driver.number, driver);
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
          ? `${driver.name} ${driver.surname}`.trim()
          : `#${driverNumber}`,
        acronym: driver?.shortName ?? "",
        nationality,
        countryCode: COUNTRY_CODES[nationality] ?? "",
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
