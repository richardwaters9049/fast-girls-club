import { describe, expect, test } from "bun:test";

import type { F1Race } from "./calendar";
import { findSessionRace, selectDisplayedRace } from "./race-selection";

const calendar: F1Race[] = [
  {
    round: 7,
    name: "Barcelona Grand Prix",
    circuit: "Circuit de Barcelona-Catalunya",
    location: "Barcelona",
    country: "Spain",
    countryCode: "ES",
    startDate: "2026-06-14",
    endDate: "2026-06-14",
  },
  {
    round: 14,
    name: "Madrid Grand Prix",
    circuit: "Circuito de Madring",
    location: "Madrid",
    country: "Spain",
    countryCode: "ES",
    startDate: "2026-09-13",
    endDate: "2026-09-13",
  },
  {
    round: 15,
    name: "Azerbaijan Grand Prix",
    circuit: "Baku City Circuit",
    location: "Baku",
    country: "Azerbaijan",
    countryCode: "AZ",
    startDate: "2026-09-27",
    endDate: "2026-09-27",
  },
];

test("matches a live session by date rather than the first race in a country", () => {
  const race = findSessionRace(calendar, {
    sessionKey: 1,
    meetingKey: 1,
    sessionName: "Race",
    sessionType: "Race",
    countryName: "Spain",
    countryCode: "ESP",
    circuitName: "Madring",
    location: "Madrid",
    dateStart: "2026-09-13T15:00:00",
    dateEnd: "2026-09-13T17:00:00",
  });

  expect(race?.round).toBe(14);
});

test("ignores a historical session when no live session is supplied", () => {
  const now = new Date("2026-09-18T12:00:00Z").getTime();

  expect(selectDisplayedRace(calendar, now)?.round).toBe(15);
});

describe("selectDisplayedRace", () => {
  test("returns the latest completed race after the season", () => {
    const now = new Date("2026-12-31T12:00:00Z").getTime();

    expect(selectDisplayedRace(calendar, now)?.round).toBe(15);
  });
});

