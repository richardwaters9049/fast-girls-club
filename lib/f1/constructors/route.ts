import { NextResponse } from "next/server";

import { getTeamChampionship } from "@/lib/f1/openf1";

import type {
  F1ConstructorStanding,
  F1ConstructorStandingsResponse,
} from "@/lib/f1/types";

export async function GET(): Promise<
  NextResponse<F1ConstructorStandingsResponse | { error: string }>
> {
  try {
    const championship = await getTeamChampionship();

    const standings: F1ConstructorStanding[] = championship
      .map((team) => ({
        position: team.position,
        team: team.team.teamName,
        countryCode: team.team.teamNationality,
        points: team.points,
        pointsStart: 0,
        teamColour: "",
      }))
      .sort((a, b) => a.position - b.position);

    return NextResponse.json({
      standings,
      sessionKey: null,
    });
  } catch (error) {
    console.error("F1 constructor standings API error:", error);

    return NextResponse.json(
      {
        error: "Unable to retrieve constructor championship data",
      },
      {
        status: 500,
      },
    );
  }
}
