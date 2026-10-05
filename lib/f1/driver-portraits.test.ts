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

test("championship portraits remain available without live timing", () => {
  const standing = { acronym: "NOR", driverNumber: 1, headshotUrl: null };
  expect(getStandingHeadshotUrl(standing, [], 2026)).toBe("/images/f1-drivers/2026/nor.webp");
  expect(getStandingHeadshotUrl(standing, [], 2027)).toBeNull();
  expect(getStandingHeadshotUrl({ ...standing, acronym: "UNKNOWN" }, [], 2026)).toBeNull();
  expect(getStandingHeadshotUrl(standing, [{ ...standing, headshotUrl: "live.webp" }], 2026)).toBe("live.webp");
});
