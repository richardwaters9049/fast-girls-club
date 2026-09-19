import { expect, test } from "bun:test";

import {
  getVerifiedCircuitFacts,
  getVerifiedRaceLaps,
  getVerifiedRaceLengthCorrectionKm,
  parseCircuitLengthKm,
} from "./race-facts";

test("normalises the provider's metre values labelled as kilometres", () => {
  expect(parseCircuitLengthKm("6003km")).toBe(6.003);
  expect(parseCircuitLengthKm("5.412")).toBe(5.412);
  expect(parseCircuitLengthKm("6003 m")).toBe(6.003);
});

test("rejects missing or malformed circuit lengths", () => {
  expect(parseCircuitLengthKm(null)).toBeNull();
  expect(parseCircuitLengthKm("nullkm")).toBeNull();
  expect(parseCircuitLengthKm("0km")).toBeNull();
});

test("uses verified facts only for the matching circuit and race", () => {
  expect(getVerifiedCircuitFacts("sepang")).toEqual({
    lengthKm: 5.543,
    corners: 15,
  });
  expect(getVerifiedCircuitFacts("unknown")).toBeNull();
  expect(getVerifiedRaceLaps(2026, 14, "madring")).toBe(57);
  expect(getVerifiedRaceLaps(2027, 14, "madring")).toBeNull();
  expect(getVerifiedRaceLengthCorrectionKm(2026, 14, "madring")).toBe(5.414);
  expect(getVerifiedRaceLengthCorrectionKm(2027, 14, "madring")).toBeNull();
});
