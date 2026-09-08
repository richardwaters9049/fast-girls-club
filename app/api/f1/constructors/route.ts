import { NextResponse } from "next/server";
import { getTeamChampionship } from "@/lib/f1/openf1";

export async function GET() {
  try {
    const standings = await getTeamChampionship();

    return NextResponse.json({
      standings: standings.map((entry) => ({
        position: entry.position,
        team: entry.team.teamName,
        countryCode: "",
        points: entry.points,
        pointsStart: 0,
        teamColour: "",
      })),
      sessionKey: null,
    });
  } catch (error) {
    console.error("Failed to fetch constructor standings:", error);

    return NextResponse.json(
      { error: "Failed to fetch constructor standings" },
      { status: 500 },
    );
  }
}
