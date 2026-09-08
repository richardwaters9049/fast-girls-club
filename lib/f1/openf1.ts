const F1_API_BASE = "https://f1api.dev/api";

export interface F1ApiDriver {
  driverId: string;
  name: string;
  surname: string;
  nationality: string;
  birthday: string;
  number: number | null;
  shortName: string;
  url: string;
  teamId?: string;
}

export interface F1ApiTeam {
  teamId: string;
  teamName: string;
  teamNationality: string;
  firstAppareance: number | null;
  constructorsChampionships: number | null;
  driversChampionships: number | null;
  url: string;
}

export interface F1ApiCircuit {
  circuitId: string;
  circuitName: string;
  country: string;
  city: string;
  circuitLength: string;
  corners: number;
  firstParticipationYear: number;
  lapRecord: string;
  fastestLapDriverId: string;
  fastestLapTeamId: string;
  fastestLapYear: number;
  url: string;
}

export interface F1ApiRaceResult {
  position: number | string;
  points: number;
  grid: number;
  time: string | null;
  fastLap: string | null;
  retired: string | null;
  driver: F1ApiDriver;
  team: F1ApiTeam;
}

export interface F1ApiRace {
  round: number;
  date: string;
  time: string;
  url: string;
  raceId: string;
  raceName: string;
  circuit: F1ApiCircuit;
  results: F1ApiRaceResult[];
}

interface F1ApiCurrentResponse {
  season: number;
  races: Array<{
    round: number;
    raceId: string;
    raceName: string;
    schedule?: {
      race?: {
        date: string | null;
        time: string | null;
      };
    };
    circuit: F1ApiCircuit;
  }>;
}

interface F1ApiLastRaceResponse {
  season: number;
  races: F1ApiRace;
}

interface F1ApiDriversResponse {
  drivers: F1ApiDriver[];
}

export interface F1ApiDriverStanding {
  position: number;
  points: number;
  wins: number;
  driver: F1ApiDriver;
  team: F1ApiTeam;
}

export interface F1ApiConstructorStanding {
  position: number;
  points: number;
  wins: number;
  team: F1ApiTeam;
}

interface DriverAccumulator {
  driver: F1ApiDriver;
  team: F1ApiTeam;
  points: number;
  wins: number;
}

interface ConstructorAccumulator {
  team: F1ApiTeam;
  points: number;
  wins: number;
}

async function f1ApiFetch<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${F1_API_BASE}${endpoint}`, {
    headers: {
      Accept: "application/json",
    },
    next: {
      revalidate: 300,
    },
  });

  if (!response.ok) {
    throw new Error(
      `F1 API request failed: ${response.status} ${response.statusText}`,
    );
  }

  return response.json() as Promise<T>;
}

export async function getCurrentSeason(): Promise<F1ApiCurrentResponse> {
  return f1ApiFetch<F1ApiCurrentResponse>("/current");
}

export async function getLatestRace(): Promise<F1ApiRace> {
  const response =
    await f1ApiFetch<F1ApiLastRaceResponse>("/current/last/race");

  return response.races;
}

export async function getDrivers(): Promise<F1ApiDriver[]> {
  const response = await f1ApiFetch<F1ApiDriversResponse>("/current/drivers");

  return response.drivers;
}

export async function getRace(year: number, round: number): Promise<F1ApiRace> {
  const response = await f1ApiFetch<{
    races: F1ApiRace;
  }>(`/${year}/${round}/race`);

  return response.races;
}

async function getCompletedRaces(): Promise<F1ApiRace[]> {
  const currentSeason = await getCurrentSeason();

  const races = currentSeason.races.filter((race) => {
    const raceDate = race.schedule?.race?.date;

    if (!raceDate) {
      return false;
    }

    return new Date(raceDate).getTime() <= Date.now();
  });

  const results = await Promise.all(
    races.map((race) => getRace(currentSeason.season, race.round)),
  );

  return results.filter((race) => race.results.length > 0);
}

export async function getDriverChampionship(): Promise<F1ApiDriverStanding[]> {
  const races = await getCompletedRaces();

  const drivers = new Map<string, DriverAccumulator>();

  for (const race of races) {
    for (const result of race.results) {
      const driverId = result.driver.driverId;

      const existing = drivers.get(driverId);

      if (existing) {
        existing.points += Number(result.points) || 0;

        if (String(result.position) === "1") {
          existing.wins += 1;
        }

        existing.team = result.team;

        continue;
      }

      drivers.set(driverId, {
        driver: result.driver,
        team: result.team,
        points: Number(result.points) || 0,
        wins: String(result.position) === "1" ? 1 : 0,
      });
    }
  }

  return Array.from(drivers.values())
    .sort((a, b) => {
      if (b.points !== a.points) {
        return b.points - a.points;
      }

      return b.wins - a.wins;
    })
    .map((entry, index) => ({
      position: index + 1,
      points: entry.points,
      wins: entry.wins,
      driver: entry.driver,
      team: entry.team,
    }));
}

export async function getTeamChampionship(): Promise<
  F1ApiConstructorStanding[]
> {
  const races = await getCompletedRaces();

  const teams = new Map<string, ConstructorAccumulator>();

  for (const race of races) {
    for (const result of race.results) {
      const teamId = result.team.teamId;

      const existing = teams.get(teamId);

      if (existing) {
        existing.points += Number(result.points) || 0;

        if (String(result.position) === "1") {
          existing.wins += 1;
        }

        continue;
      }

      teams.set(teamId, {
        team: result.team,
        points: Number(result.points) || 0,
        wins: String(result.position) === "1" ? 1 : 0,
      });
    }
  }

  return Array.from(teams.values())
    .sort((a, b) => {
      if (b.points !== a.points) {
        return b.points - a.points;
      }

      return b.wins - a.wins;
    })
    .map((entry, index) => ({
      position: index + 1,
      points: entry.points,
      wins: entry.wins,
      team: entry.team,
    }));
}
