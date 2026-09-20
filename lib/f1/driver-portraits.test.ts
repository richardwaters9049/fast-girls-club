import { expect, test } from "bun:test";

import { getStandingHeadshotUrl } from "./driver-portraits";

test("matches portraits by driver code when race numbers have changed", () => {
  expect(getStandingHeadshotUrl(
    { acronym: "NOR", driverNumber: 4, headshotUrl: null },
    [
      { acronym: "NOR", driverNumber: 1, headshotUrl: "norris.png" },
      { acronym: "OTHER", driverNumber: 4, headshotUrl: "wrong.png" },
    ],
  )).toBe("norris.png");
});

test("keeps the standings fallback when the driver is absent from live data", () => {
  expect(getStandingHeadshotUrl(
    { acronym: "HAD", driverNumber: 6, headshotUrl: "standings.png" },
    [{ acronym: "OTHER", driverNumber: 6, headshotUrl: "wrong.png" }],
  )).toBe("standings.png");
});
