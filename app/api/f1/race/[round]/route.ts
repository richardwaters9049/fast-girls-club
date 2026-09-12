import { NextResponse } from "next/server";

const API_BASE = "https://f1api.dev/api";
const SEASON = 2026;

interface ApiRace {
  round?: number | string;
  date?: string | null;
  time?: string | null;
  raceId?: string;
  raceName?: string | null;
  schedule?: {
    race?: {
      date?: string | null;
      time?: string | null;
    };
    qualy?: {
      date?: string | null;
      time?: string | null;
    };
    fp1?: {
      date?: string | null;
      time?: string | null;
    };
    fp2?: {
      date?: string | null;
      time?: string | null;
    };
    fp3?: {
      date?: string | null;
      time?: string | null;
    };
    sprintQualy?: {
      date?: string | null;
      time?: string | null;
    };
    sprintRace?: {
      date?: string | null;
      time?: string | null;
    };
  };
  laps?: number | null;
  circuit?: {
    circuitId?: string;
    circuitName?: string;
    country?: string;
    city?: string;
    circuitLength?: string | number | null;
    lapRecord?: string | null;
    corners?: number | null;
    fastestLapDriverId?: string | null;
    fastestLapTeamId?: string | null;
    fastestLapYear?: number | null;
  };
  fast_lap?: {
    fast_lap?: string | null;
    fast_lap_driver_id?: string | null;
    fast_lap_team_id?: string | null;
  };
  winner?: {
    driverId?: string;
    name?: string;
    surname?: string;
    shortName?: string;
    number?: number | null;
  } | null;
  teamWinner?: {
    teamId?: string;
    teamName?: string;
  } | null;
}

interface ApiRaceResult {
  position?: number;
  grid?: number;
  points?: number;
  time?: string | null;
  fastLap?: string | null;
  retired?: string | null;
  driver?: {
    driverId?: string;
    name?: string;
    surname?: string;
    shortName?: string;
    nationality?: string;
    number?: number;
  };
  team?: {
    teamId?: string;
    teamName?: string;
  };
}

interface ApiRaceResponse {
  race?: ApiRace[] | ApiRace;
  races?: ApiRace;
}

interface ApiResultsResponse {
  races?: {
    results?: ApiRaceResult[];
  };
  results?: ApiRaceResult[];
}

interface NormalisedSession {
  date: string | null;
  time: string | null;
}

interface NormalisedSchedule {
  practice1: NormalisedSession;
  practice2: NormalisedSession;
  practice3: NormalisedSession;
  qualifying: NormalisedSession;
  sprintQualifying: NormalisedSession;
  sprintRace: NormalisedSession;
  race: NormalisedSession;
}

interface NormalisedCircuit {
  id: string | null;
  name: string;
  country: string;
  city: string;
  lengthKm: number | null;
  corners: number | null;
  laps: number | null;
  lapRecord: string | null;
  fastestLapDriverId: string | null;
  fastestLapTeamId: string | null;
  fastestLapYear: number | null;
}

interface NormalisedResult {
  position: number;
  gridPosition: number | null;
  points: number;
  time: string | null;
  fastLap: string | null;
  retired: string | null;
  driver: {
    id: string | null;
    name: string;
    shortName: string;
    nationality: string;
    number: number | null;
  };
  team: {
    id: string | null;
    name: string;
  };
}

function asRace(payload: ApiRaceResponse): ApiRace | null {
  if (Array.isArray(payload.race)) {
    return payload.race[0] ?? null;
  }

  return payload.race ?? null;
}

function normaliseLength(
  value: string | number | null | undefined,
): number | null {
  if (value === null || value === undefined) {
    return null;
  }

  const numeric = Number.parseFloat(String(value).replace(/[^\d.]/g, ""));

  return Number.isFinite(numeric) ? numeric : null;
}

function normaliseSession(
  session:
    | {
        date?: string | null;
        time?: string | null;
      }
    | undefined,
): NormalisedSession {
  return {
    date: session?.date ?? null,
    time: session?.time ?? null,
  };
}

function normaliseSchedule(race: ApiRace): NormalisedSchedule {
  return {
    practice1: normaliseSession(race.schedule?.fp1),
    practice2: normaliseSession(race.schedule?.fp2),
    practice3: normaliseSession(race.schedule?.fp3),
    qualifying: normaliseSession(race.schedule?.qualy),
    sprintQualifying: normaliseSession(race.schedule?.sprintQualy),
    sprintRace: normaliseSession(race.schedule?.sprintRace),
    race: normaliseSession(race.schedule?.race),
  };
}

function normaliseRace(race: ApiRace, results: ApiRaceResult[]) {
  const circuit = race.circuit ?? {};

  const raceResults = results
    .map((result) => ({
      position: Number(result.position ?? 0),
      gridPosition:
        result.grid === undefined || result.grid === null
          ? null
          : Number(result.grid),
      points: Number(result.points ?? 0),
      time: result.time ?? null,
      fastLap: result.fastLap ?? null,
      retired: result.retired ?? null,
      driver: {
        id: result.driver?.driverId ?? null,
        name:
          [result.driver?.name, result.driver?.surname]
            .filter(Boolean)
            .join(" ") || "Unknown driver",
        shortName: result.driver?.shortName ?? "—",
        nationality: result.driver?.nationality ?? "Unknown",
        number:
          result.driver?.number === undefined ? null : result.driver.number,
      },
      team: {
        id: result.team?.teamId ?? null,
        name: result.team?.teamName ?? "Unknown team",
      },
    }))
    .filter((result) => result.position > 0)
    .sort((a, b) => a.position - b.position);

  return {
    round: Number(race.round ?? 0),
    raceId: race.raceId ?? null,
    raceName: race.raceName ?? "Formula 1 Grand Prix",
    date: race.date ?? race.schedule?.race?.date ?? null,
    time: race.time ?? race.schedule?.race?.time ?? null,
    schedule: normaliseSchedule(race),
    laps:
      race.laps === undefined || race.laps === null ? null : Number(race.laps),
    circuit: {
      id: circuit.circuitId ?? null,
      name: circuit.circuitName ?? "Circuit",
      country: circuit.country ?? "",
      city: circuit.city ?? "",
      lengthKm: normaliseLength(circuit.circuitLength),
      corners:
        circuit.corners === undefined || circuit.corners === null
          ? null
          : Number(circuit.corners),
      laps:
        race.laps === undefined || race.laps === null
          ? null
          : Number(race.laps),
      lapRecord: circuit.lapRecord ?? race.fast_lap?.fast_lap ?? null,
      fastestLapDriverId:
        circuit.fastestLapDriverId ?? race.fast_lap?.fast_lap_driver_id ?? null,
      fastestLapTeamId:
        circuit.fastestLapTeamId ?? race.fast_lap?.fast_lap_team_id ?? null,
      fastestLapYear: circuit.fastestLapYear ?? null,
    },
    winner: race.winner
      ? {
          name: [race.winner.name, race.winner.surname]
            .filter(Boolean)
            .join(" "),
          shortName: race.winner.shortName ?? "—",
          driverId: race.winner.driverId ?? null,
        }
      : null,
    teamWinner: race.teamWinner
      ? {
          name: race.teamWinner.teamName ?? "Unknown team",
          teamId: race.teamWinner.teamId ?? null,
        }
      : null,
    results: raceResults,
  };
}

export async function GET(
  request: Request,
  context: {
    params: Promise<{
      round: string;
    }>;
  },
): Promise<Response> {
  try {
    const { round } = await context.params;
    const roundNumber = Number.parseInt(round, 10);

    if (!Number.isInteger(roundNumber) || roundNumber < 1 || roundNumber > 30) {
      return NextResponse.json(
        {
          error: "Invalid race round.",
        },
        {
          status: 400,
        },
      );
    }

    const raceResponse = await fetch(`${API_BASE}/${SEASON}/${roundNumber}`, {
      next: {
        revalidate: 600,
      },
    });

    if (!raceResponse.ok) {
      return NextResponse.json(
        {
          error: "Race data is currently unavailable.",
        },
        {
          status: raceResponse.status,
        },
      );
    }

    const racePayload = (await raceResponse.json()) as ApiRaceResponse;

    const race = asRace(racePayload);

    if (!race) {
      return NextResponse.json(
        {
          error: "Race data was not found.",
        },
        {
          status: 404,
        },
      );
    }

    let results: ApiRaceResult[] = [];

    const resultsResponse = await fetch(
      `${API_BASE}/${SEASON}/${roundNumber}/race?limit=30`,
      {
        next: {
          revalidate: 600,
        },
      },
    );

    if (resultsResponse.ok) {
      const resultsPayload =
        (await resultsResponse.json()) as ApiResultsResponse;

      results = resultsPayload.races?.results ?? resultsPayload.results ?? [];
    }

    const data = normaliseRace(race, results);

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, max-age=600, stale-while-revalidate=60",
      },
    });
  } catch (error) {
    console.error("F1 race API error:", error);

    return NextResponse.json(
      {
        error: "Unable to load F1 race data.",
      },
      {
        status: 500,
      },
    );
  }
}
