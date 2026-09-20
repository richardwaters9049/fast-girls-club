import { expect, test } from "bun:test";

import { getTeamColour, getTeamLogoUrl } from "./team-assets";

test("maps provider team IDs to their 2026 marks and colours", () => {
  expect(getTeamLogoUrl("red_bull", 2026)).toContain("/redbullracing/2026redbullracinglogowhite.webp");
  expect(getTeamLogoUrl("rb", 2026)).toContain("/racingbulls/2026racingbullslogowhite.webp");
  expect(getTeamColour("mercedes")).toBe("#27F4D2");
});

test("falls back when a team or season has no verified logo", () => {
  expect(getTeamLogoUrl("unknown", 2026)).toBeNull();
  expect(getTeamLogoUrl("mercedes", 2027)).toBeNull();
  expect(getTeamColour("unknown")).toBe("#FFFFFF");
});
