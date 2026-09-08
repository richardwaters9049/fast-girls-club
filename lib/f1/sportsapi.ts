import { getCurrentSeason, getLatestRace, getRace } from "./openf1";

export async function getF1RaceCalendar(): Promise<unknown> {
  return getCurrentSeason();
}

export async function getF1Race(raceId: number | string): Promise<unknown> {
  const race = await getLatestRace();

  if (String(race.round) === String(raceId)) {
    return race;
  }

  return getRace(new Date(race.date).getFullYear(), Number(raceId));
}
