import { expect, test } from "bun:test";
import { normaliseResult } from "./results-adapter";

test("maps nested API identities, fastest-lap string and retirement reason", () => {
  const result = normaliseResult({
    position: 12, points: 0, grid: 8, time: null, fastestLap: "1:32.500",
    retired: "Engine", driver: { driverId: "test-driver", fullName: "Test Driver", number: 7 },
    constructor: { constructorId: "test-team", name: "Test Team" },
  });
  expect(result.driverId).toBe("test-driver");
  expect(result.number).toBe(7);
  expect(result.constructorId).toBe("test-team");
  expect(result.fastestLap?.time).toBe("1:32.500");
  expect(result.status).toBe("Engine");
  expect(result.retired).toBe("Engine");
  expect(result.points).toBe(0);
  expect(result.constructor?.nationality).toBeNull();
  expect(result.laps).toBeNull();
  expect(result.milliseconds).toBeNull();
});

test("missing values remain explicit nulls and invalid rows fail", () => {
  const result = normaliseResult({ points: "invalid" });
  expect(result.driverId).toBeNull();
  expect(result.number).toBeNull();
  expect(result.points).toBeNull();
  expect(result.fastestLap).toBeNull();
  expect(JSON.parse(JSON.stringify(result))).toEqual(result);
  expect(() => normaliseResult(null)).toThrow();
});
