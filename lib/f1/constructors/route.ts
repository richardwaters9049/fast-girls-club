import { NextResponse } from "next/server";

import { getLatestSession, getTeamChampionship } from "@/lib/f1/openf1";

import type {
  F1ConstructorStanding,
  F1ConstructorStandingsResponse,
} from "@/lib/f1/types";

export async function GET(): Promise<
  NextResponse<F1ConstructorStandingsResponse | { error: string }>
> {
  try {
    const sessions = await getLatestSession();
    const session = sessions[0];

    if (!session) {
      return NextResponse.json({
        standings: [],
        sessionKey: null,
      });
    }

    const championship = await getTeamChampionship(session.session_key);

    const standings: F1ConstructorStanding[] = championship
      .map((team) => ({
        position: team.position_current,
        team: team.team_name,
        points: team.points_current,
        pointsStart: team.points_start,
      }))
      .sort((a, b) => a.position - b.position);

    return NextResponse.json({
      standings,
      sessionKey: session.session_key,
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
