import type { F1Race } from "@/lib/f1/calendar";
import type { F1Session } from "@/lib/f1/types";

export type RaceStatus = "completed" | "live" | "upcoming";

function normalise(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function dateOnly(value: string): string {
  return value.slice(0, 10);
}

export function getRaceStatus(race: F1Race, now: number): RaceStatus {
  if (!race.startDate) {
    return "upcoming";
  }

  const start = new Date(`${race.startDate}T00:00:00`).getTime();
  const end = new Date(
    `${race.endDate || race.startDate}T23:59:59`,
  ).getTime();

  if (!Number.isFinite(start) || !Number.isFinite(end)) {
    return "upcoming";
  }

  if (now > end) {
    return "completed";
  }

  if (now >= start) {
    return "live";
  }

  return "upcoming";
}

export function findSessionRace(
  calendar: F1Race[],
  session: F1Session | null | undefined,
): F1Race | null {
  if (!session) {
    return null;
  }

  const sessionDate = dateOnly(session.dateStart);
  const circuit = normalise(session.circuitName);
  const location = normalise(session.location);

  return (
    calendar.find((race) => dateOnly(race.startDate) === sessionDate) ??
    calendar.find((race) => {
      const raceCircuit = normalise(race.circuit);
      const raceLocation = normalise(race.location);

      return (
        (circuit.length > 0 &&
          (raceCircuit.includes(circuit) || circuit.includes(raceCircuit))) ||
        (location.length > 0 && raceLocation === location)
      );
    }) ??
    null
  );
}

export function selectDisplayedRace(
  calendar: F1Race[],
  now: number,
  liveSession?: F1Session | null,
): F1Race | null {
  if (calendar.length === 0) {
    return null;
  }

  const sessionRace = findSessionRace(calendar, liveSession);

  if (sessionRace) {
    return sessionRace;
  }

  return (
    calendar.find((race) => getRaceStatus(race, now) === "live") ??
    calendar.find((race) => getRaceStatus(race, now) === "upcoming") ??
    calendar.at(-1) ??
    null
  );
}

