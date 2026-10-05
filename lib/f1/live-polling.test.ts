import { expect, test } from "bun:test";
import { livePollingDelay } from "./live-polling";

test("idle sessions never use the rapid live-tab cadence", () => {
  expect(livePollingDelay(false, true)).toBe(120_000);
  expect(livePollingDelay(false, false)).toBe(120_000);
  expect(livePollingDelay(true, true)).toBe(10_000);
  expect(livePollingDelay(true, false)).toBe(60_000);
});
test("repeated failures back off with a five-minute ceiling", () => {
  expect(livePollingDelay(false, true, 1)).toBe(120_000);
  expect(livePollingDelay(false, true, 4)).toBe(240_000);
  expect(livePollingDelay(false, true, 100)).toBe(300_000);
});
