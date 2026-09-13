const F1_API_BASE = "https://f1api.dev/api";

const CACHE_DURATION = 5 * 60 * 1000;

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

interface F1ApiSeasonRaceResponse {
  race: Array<{
    raceId: string;
    championshipId: string;
    raceName: string;
    schedule?: {
      race?: {
        date: string | null;
        time: string | null;
      };
    };
    round: string | number;
    circuit?: F1ApiCircuit;
  }>;
}

interface F1ApiSeasonDriverResponse {
  drivers: F1ApiDriver[];
}

interface F1ApiSeasonTeamResponse {
  teams: F1ApiTeam[];
}

interface F1ApiDriverDetailsResponse {
  driver: F1ApiDriver;
  team?: F1ApiTeam;
  results?: Array<{
    race?: {
      raceId?: string;
      name?: string;
      round?: number;
      date?: string;
      circuit?: {
        circuitId?: string;
        name?: string;
        country?: string;
        city?: string;
        length?: number;
        lapRecord?: string;
        firstParticipationYear?: number;
        numberOfCorners?: number;
        fastestLapDriverId?: string;
        fastestLapTeamId?: string;
        fastestLapYear?: number;
        url?: string;
      };
    };
    result?: {
      finishingPosition?: number;
      gridPosition?: number;
      raceTime?: string | number;
      pointsObtained?: number;
      retired?: boolean;
    };
    sprintResult?: {
      finishingPosition?: number;
      gridPosition?: number;
      raceTime?: string | number;
      pointsObtained?: number;
      retired?: boolean;
    } | null;
  }>;
}

interface F1ApiTeamDetailsResponse {
  team: F1ApiTeam[];
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

let driverStandingsCache: {
  data: F1ApiDriverStanding[];
  timestamp: number;
} | null = null;

let constructorStandingsCache: {
  data: F1ApiConstructorStanding[];
  timestamp: number;
} | null = null;

let completedRacesCache: {
  data: F1ApiRace[];
  timestamp: number;
} | null = null;

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
  const response = await f1ApiFetch<F1ApiDriversResponse>(
    "/current/drivers?limit=100",
  );

  return response.drivers;
}

export async function getRace(year: number, round: number): Promise<F1ApiRace> {
  const response = await f1ApiFetch<F1ApiSeasonRaceResponse>(
    `/${year}/${round}`,
  );

  const race = response.race?.[0];

  if (!race) {
    throw new Error(`F1 API returned no race for ${year} round ${round}`);
  }

  const resultResponse = await f1ApiFetch<{
    races: F1ApiRace;
  }>(`/${year}/${round}/race`);

  return resultResponse.races;
}

async function getCompletedRaces(): Promise<F1ApiRace[]> {
  if (
    completedRacesCache &&
    Date.now() - completedRacesCache.timestamp < CACHE_DURATION
  ) {
    return completedRacesCache.data;
  }

  const currentSeason = await getCurrentSeason();

  const completedRaceDefinitions = currentSeason.races.filter((race) => {
    const raceDate = race.schedule?.race?.date;

    if (!raceDate) {
      return false;
    }

    return new Date(raceDate).getTime() <= Date.now();
  });

  const races = await Promise.all(
    completedRaceDefinitions.map((race) =>
      getRace(currentSeason.season, race.round),
    ),
  );

  const completedRaces = races.filter((race) => race.results.length > 0);

  completedRacesCache = {
    data: completedRaces,
    timestamp: Date.now(),
  };

  return completedRaces;
}

async function getCurrentSeasonDriverStandings(): Promise<
  F1ApiDriverStanding[]
> {
  const currentSeason = await getCurrentSeason();

  const seasonDrivers = await f1ApiFetch<F1ApiSeasonDriverResponse>(
    `/${currentSeason.season}/drivers?limit=100`,
  );

  const standings: F1ApiDriverStanding[] = [];

  for (const driver of seasonDrivers.drivers) {
    try {
      const details = await f1ApiFetch<F1ApiDriverDetailsResponse>(
        `/${currentSeason.season}/drivers/${driver.driverId}?limit=100`,
      );

      const driverTeam =
        details.team ??
        seasonDrivers.drivers.find(
          (seasonDriver) => seasonDriver.driverId === driver.driverId,
        );

      let points = 0;
      let wins = 0;

      for (const result of details.results ?? []) {
        const racePoints = Number(result.result?.pointsObtained) || 0;
        const sprintPoints = Number(result.sprintResult?.pointsObtained) || 0;

        points += racePoints + sprintPoints;

        if (result.result?.finishingPosition === 1) {
          wins += 1;
        }
      }

      if (!driverTeam || !("teamId" in driverTeam)) {
        continue;
      }

      const teamId = driver.teamId ?? driverTeam.teamId;

      let team: F1ApiTeam | null = null;

      if (teamId) {
        try {
          const teamResponse = await f1ApiFetch<F1ApiTeamDetailsResponse>(
            `/${currentSeason.season}/teams/${teamId}`,
          );

          team = teamResponse.team?.[0] ?? null;
        } catch {
          team = null;
        }
      }

      if (!team) {
        team = {
          teamId: teamId ?? "unknown",
          teamName: "Unknown Team",
          teamNationality: "",
          firstAppareance: null,
          constructorsChampionships: null,
          driversChampionships: null,
          url: "",
        };
      }

      standings.push({
        position: 0,
        points,
        wins,
        driver: {
          ...driver,
          teamId,
        },
        team,
      });
    } catch {
      continue;
    }
  }

  return standings
    .sort((a, b) => {
      if (b.points !== a.points) {
        return b.points - a.points;
      }

      if (b.wins !== a.wins) {
        return b.wins - a.wins;
      }

      return a.driver.shortName.localeCompare(b.driver.shortName);
    })
    .map((entry, index) => ({
      ...entry,
      position: index + 1,
    }));
}

async function getCurrentSeasonConstructorStandings(): Promise<
  F1ApiConstructorStanding[]
> {
  const currentSeason = await getCurrentSeason();

  const seasonTeams = await f1ApiFetch<F1ApiSeasonTeamResponse>(
    `/${currentSeason.season}/teams?limit=100`,
  );

  const driverStandings = await getCurrentSeasonDriverStandings();

  const teams = new Map<string, ConstructorAccumulator>();

  for (const team of seasonTeams.teams) {
    teams.set(team.teamId, {
      team,
      points: 0,
      wins: 0,
    });
  }

  for (const standing of driverStandings) {
    const teamId = standing.team.teamId;

    const existing = teams.get(teamId);

    if (existing) {
      existing.points += standing.points;
      existing.wins += standing.wins;
      continue;
    }

    teams.set(teamId, {
      team: standing.team,
      points: standing.points,
      wins: standing.wins,
    });
  }

  return Array.from(teams.values())
    .filter((entry) => entry.points > 0 || entry.wins > 0)
    .sort((a, b) => {
      if (b.points !== a.points) {
        return b.points - a.points;
      }

      if (b.wins !== a.wins) {
        return b.wins - a.wins;
      }

      return a.team.teamName.localeCompare(b.team.teamName);
    })
    .map((entry, index) => ({
      position: index + 1,
      points: entry.points,
      wins: entry.wins,
      team: entry.team,
    }));
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

export async function getDriverChampionship(): Promise<F1ApiDriverStanding[]> {
  if (
    driverStandingsCache &&
    Date.now() - driverStandingsCache.timestamp < CACHE_DURATION
  ) {
    return driverStandingsCache.data;
  }

  const standings = await getCurrentSeasonDriverStandings();

  driverStandingsCache = {
    data: standings,
    timestamp: Date.now(),
  };

  return standings;
}

export async function getTeamChampionship(): Promise<
  F1ApiConstructorStanding[]
> {
  if (
    constructorStandingsCache &&
    Date.now() - constructorStandingsCache.timestamp < CACHE_DURATION
  ) {
    return constructorStandingsCache.data;
  }

  const standings = await getCurrentSeasonConstructorStandings();

  constructorStandingsCache = {
    data: standings,
    timestamp: Date.now(),
  };

  return standings;
}
