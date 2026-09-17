import { NextResponse } from "next/server";

const BACKEND_API_BASE_URL =
  process.env.F1_BACKEND_API_BASE_URL ?? "http://localhost:8787/api";

interface BackendScheduleSession {
  date: string | null;
  time: string | null;
}

interface BackendRaceSchedule {
  race: BackendScheduleSession;
  qualy: BackendScheduleSession;
  fp1: BackendScheduleSession;
  fp2: BackendScheduleSession;
  fp3: BackendScheduleSession;
  sprintQualy: BackendScheduleSession;
  sprintRace: BackendScheduleSession;
}

interface BackendCircuit {
  circuitId: string;
  name: string;
  country: string;
  city: string;
  length: string | null;
  lapRecord: string | null;
  firstParticipationYear: number | null;
  corners: number | null;
  fastestLapDriverId: string | null;
  fastestLapTeamId: string | null;
  fastestLapYear: number | null;
  url: string | null;
}

interface BackendWinner {
  driverId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  nationality: string;
  number: number | null;
  code: string | null;
  dateOfBirth: string | null;
  url: string | null;
}

interface BackendConstructorWinner {
  constructorId: string;
  name: string;
  nationality: string;
  firstAppearance: number | null;
  constructorsChampionships: number | null;
  driversChampionships: number | null;
  url: string | null;
}

interface BackendRace {
  raceId: string;
  championshipId: string;
  raceName: string;
  season: number;
  round: number;
  url: string | null;
  schedule: BackendRaceSchedule;
  laps: number | null;
  circuit: BackendCircuit;
  fastestLap: {
    time: string | null;
    driverId: string | null;
    constructorId: string | null;
  } | null;
  winner: BackendWinner | null;
  constructorWinner: BackendConstructorWinner | null;
}

interface BackendResponse {
  season: number;
  round: number;
  race: BackendRace;
}

function normaliseSchedule(session: BackendScheduleSession): {
  date: string | null;
  time: string | null;
} {
  return {
    date: session.date,
    time: session.time,
  };
}

function normaliseWinner(winner: BackendWinner | null) {
  if (!winner) {
    return null;
  }

  return {
    driverId: winner.driverId,
    name: winner.fullName,
    shortName: winner.code,
    nationality: winner.nationality,
    number: winner.number,
  };
}

function normaliseTeamWinner(teamWinner: BackendConstructorWinner | null) {
  if (!teamWinner) {
    return null;
  }

  return {
    teamId: teamWinner.constructorId,
    name: teamWinner.name,
    nationality: teamWinner.nationality,
  };
}

export async function GET(
  request: Request,
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

  const url = new URL(`${BACKEND_API_BASE_URL}/races/${round}`);

  try {
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });

    if (response.status === 404) {
      return NextResponse.json(
        {
          error: "Race not found",
        },
        {
          status: 404,
        },
      );
    }

    if (!response.ok) {
      throw new Error(`F1 backend returned ${response.status}`);
    }

    const backendData = (await response.json()) as BackendResponse;

    if (!backendData.race) {
      return NextResponse.json(
        {
          error: "Race not found",
        },
        {
          status: 404,
        },
      );
    }

    if (backendData.round !== round || backendData.race.round !== round) {
      return NextResponse.json(
        {
          error: "Race round mismatch",
        },
        {
          status: 502,
        },
      );
    }

    const race = backendData.race;
    const schedule = race.schedule;
    const circuit = race.circuit;

    const result = {
      round: race.round,
      raceId: race.raceId,
      raceName: race.raceName,
      season: race.season,
      date: schedule.race.date,
      time: schedule.race.time,

      schedule: {
        practice1: normaliseSchedule(schedule.fp1),
        practice2: normaliseSchedule(schedule.fp2),
        practice3: normaliseSchedule(schedule.fp3),
        qualifying: normaliseSchedule(schedule.qualy),
        sprintQualifying: normaliseSchedule(schedule.sprintQualy),
        sprintRace: normaliseSchedule(schedule.sprintRace),
        race: normaliseSchedule(schedule.race),
      },

      circuit: {
        id: circuit.circuitId,
        name: circuit.name,
        country: circuit.country,
        city: circuit.city,
        lengthKm:
          circuit.length === null ? null : Number(circuit.length) || null,
        corners: circuit.corners,
        lapRecord: circuit.lapRecord,
        fastestLapDriverId: circuit.fastestLapDriverId,
        fastestLapTeamId: circuit.fastestLapTeamId,
        fastestLapYear: circuit.fastestLapYear,
        url: circuit.url,
      },

      laps: race.laps,

      winner: normaliseWinner(race.winner),

      teamWinner: normaliseTeamWinner(race.constructorWinner),
    };

    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Failed to fetch F1 race data:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch F1 race data",
      },
      {
        status: 502,
      },
    );
  }
}
