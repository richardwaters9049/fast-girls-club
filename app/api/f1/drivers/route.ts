import { NextResponse } from "next/server";
import { getDriverChampionship } from "@/lib/f1/openf1";

export async function GET() {
  try {
    const standings = await getDriverChampionship();

    return NextResponse.json({
      standings: standings.map((entry) => ({
        position: entry.position,
        driverNumber: entry.driver.number,
        driver: `${entry.driver.name} ${entry.driver.surname}`,
        acronym: entry.driver.shortName,
        nationality: entry.driver.nationality,
        countryCode: "",
        team: entry.team.teamName,
        points: entry.points,
        pointsStart: 0,
        headshotUrl: null,
        teamColour: "",
      })),
      sessionKey: null,
    });
  } catch (error) {
    console.error("Failed to fetch driver standings:", error);

    return NextResponse.json(
      { error: "Failed to fetch driver standings" },
      { status: 500 },
    );
  }
}
