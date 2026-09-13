import { NextResponse } from "next/server";

const API_BASE = "https://f1api.dev/api";
const SEASON = 2026;

interface ApiSession {
  date?: string | null;
  time?: string | null;
}

interface ApiRace {
  round?: number | string;
  date?: string | null;
  time?: string | null;
  raceId?: string | null;
  raceName?: string | null;
  schedule?: {
    race?: ApiSession;
    qualy?: ApiSession;
    fp1?: ApiSession;
    fp2?: ApiSession;
    fp3?: ApiSession;
    sprintQualy?: ApiSession;
    sprintRace?: ApiSession;
  };
  laps?: number | null;
  circuit?: {
    circuitId?: string | null;
    circuitName?: string | null;
    country?: string | null;
    city?: string | null;
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
    driverId?: string | null;
    name?: string | null;
    surname?: string | null;
    shortName?: string | null;
    number?: number | null;
  } | null;
  teamWinner?: {
    teamId?: string | null;
    teamName?: string | null;
  } | null;
}

interface ApiRaceResponse {
  race?: ApiRace[];
}

interface ApiRaceResult {
  position?: number | null;
  grid?: number | null;
  points?: number | null;
  time?: string | null;
  fastLap?: string | null;
  retired?: string | null;
  driver?: {
    driverId?: string | null;
    name?: string | null;
    surname?: string | null;
    shortName?: string | null;
    nationality?: string | null;
    number?: number | null;
  } | null;
  team?: {
    teamId?: string | null;
    teamName?: string | null;
  } | null;
}

interface ApiResultsResponse {
  races?: {
    round?: number | string;
    raceId?: string | null;
    raceName?: string | null;
    results?: ApiRaceResult[];
  };
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
  name: string | null;
  country: string | null;
  city: string | null;
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
  points: number | null;
  time: string | null;
  fastLap: string | null;
  retired: string | null;
  driver: {
    id: string | null;
    name: string | null;
    shortName: string | null;
    nationality: string | null;
    number: number | null;
  };
  team: {
    id: string | null;
    name: string | null;
  };
}

function asRace(payload: ApiRaceResponse): ApiRace | null {
  return payload.race?.[0] ?? null;
}

function normaliseLength(
  value: string | number | null | undefined,
): number | null {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  const match = value.trim().match(/^([\d.]+)\s*km$/i);

  if (!match) {
    return null;
  }

  const numeric = Number.parseFloat(match[1]);

  return Number.isFinite(numeric) ? numeric : null;
}

function normaliseSession(session: ApiSession | undefined): NormalisedSession {
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

function getRaceDate(race: ApiRace): string | null {
  return race.date ?? race.schedule?.race?.date ?? null;
}

function hasRaceCompleted(race: ApiRace): boolean {
  const raceDate = getRaceDate(race);

  if (!raceDate) {
    return false;
  }

  const parsedDate = new Date(`${raceDate}T23:59:59Z`);

  if (Number.isNaN(parsedDate.getTime())) {
    return false;
  }

  return parsedDate.getTime() < Date.now();
}

function normaliseResults(results: ApiRaceResult[]): NormalisedResult[] {
  return results
    .map((result) => {
      const position =
        result.position === null || result.position === undefined
          ? null
          : Number(result.position);

      if (position === null || !Number.isInteger(position) || position < 1) {
        return null;
      }

      return {
        position,
        gridPosition:
          result.grid === null || result.grid === undefined
            ? null
            : Number(result.grid),
        points:
          result.points === null || result.points === undefined
            ? null
            : Number(result.points),
        time: result.time ?? null,
        fastLap: result.fastLap ?? null,
        retired: result.retired ?? null,
        driver: {
          id: result.driver?.driverId ?? null,
          name:
            [result.driver?.name, result.driver?.surname]
              .filter(Boolean)
              .join(" ") || null,
          shortName: result.driver?.shortName ?? null,
          nationality: result.driver?.nationality ?? null,
          number:
            result.driver?.number === undefined ? null : result.driver.number,
        },
        team: {
          id: result.team?.teamId ?? null,
          name: result.team?.teamName ?? null,
        },
      };
    })
    .filter((result): result is NormalisedResult => result !== null)
    .sort((a, b) => a.position - b.position);
}

function normaliseRace(
  race: ApiRace,
  results: ApiRaceResult[],
  resultsAvailable: boolean,
) {
  const circuit = race.circuit ?? {};
  const schedule = normaliseSchedule(race);
  const completed = hasRaceCompleted(race);

  return {
    round:
      race.round === undefined || race.round === null
        ? null
        : Number(race.round),

    raceId: race.raceId ?? null,

    raceName: race.raceName ?? null,

    date: getRaceDate(race),

    time: race.time ?? race.schedule?.race?.time ?? null,

    status: completed ? "completed" : "upcoming",

    resultsAvailable,

    schedule,

    laps:
      race.laps === undefined || race.laps === null ? null : Number(race.laps),

    circuit: {
      id: circuit.circuitId ?? null,
      name: circuit.circuitName ?? null,
      country: circuit.country ?? null,
      city: circuit.city ?? null,
      lengthKm: normaliseLength(circuit.circuitLength),
      corners:
        circuit.corners === undefined || circuit.corners === null
          ? null
          : Number(circuit.corners),
      laps:
        race.laps === undefined || race.laps === null
          ? null
          : Number(race.laps),
      lapRecord: circuit.lapRecord ?? null,
      fastestLapDriverId:
        circuit.fastestLapDriverId ?? race.fast_lap?.fast_lap_driver_id ?? null,
      fastestLapTeamId:
        circuit.fastestLapTeamId ?? race.fast_lap?.fast_lap_team_id ?? null,
      fastestLapYear: circuit.fastestLapYear ?? null,
    } satisfies NormalisedCircuit,

    winner:
      completed && race.winner
        ? {
            name:
              [race.winner.name, race.winner.surname]
                .filter(Boolean)
                .join(" ") || null,
            shortName: race.winner.shortName ?? null,
            driverId: race.winner.driverId ?? null,
          }
        : null,

    teamWinner:
      completed && race.teamWinner
        ? {
            name: race.teamWinner.teamName ?? null,
            teamId: race.teamWinner.teamId ?? null,
          }
        : null,

    results: completed && resultsAvailable ? normaliseResults(results) : [],
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

    if (!Number.isInteger(roundNumber) || roundNumber < 1) {
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

    if (raceResponse.status === 404) {
      return NextResponse.json(
        {
          error: "Race round was not found in the season calendar.",
        },
        {
          status: 404,
        },
      );
    }

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

    const returnedRound =
      race.round === undefined || race.round === null
        ? null
        : Number(race.round);

    if (returnedRound !== roundNumber) {
      return NextResponse.json(
        {
          error: "Race calendar data did not match the requested round.",
        },
        {
          status: 502,
        },
      );
    }

    const completed = hasRaceCompleted(race);

    let results: ApiRaceResult[] = [];
    let resultsAvailable = false;

    if (completed) {
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

        const resultRace = resultsPayload.races;

        const resultRound =
          resultRace?.round === undefined || resultRace.round === null
            ? null
            : Number(resultRace.round);

        const resultMatchesRace =
          resultRound === roundNumber &&
          (resultRace?.raceId === null ||
            resultRace?.raceId === undefined ||
            resultRace.raceId === race.raceId);

        if (resultMatchesRace) {
          results = resultRace?.results ?? [];
          resultsAvailable = results.length > 0;
        }
      }
    }

    const data = normaliseRace(race, results, resultsAvailable);

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
