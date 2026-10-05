import { expect, test } from "bun:test";
import { isFreshLiveSession, normaliseFeedDate, LIVE_MAX_AGE_MS } from "./live-freshness";

const now = Date.parse("2026-10-04T12:00:00Z");
const session = { status: "Started", dateStart: "2026-10-04T11:00:00Z", dateEnd: "2026-10-04T13:00:00Z" };
const update = new Date(now - 1000).toISOString();

test("live requires a connected, current, started session and recent feed", () => {
  expect(isFreshLiveSession(true, session, update, now)).toBe(true);
  expect(isFreshLiveSession(false, session, update, now)).toBe(false);
  expect(isFreshLiveSession(true, { ...session, status: "Finished" }, update, now)).toBe(false);
  expect(isFreshLiveSession(true, session, null, now)).toBe(false);
  expect(isFreshLiveSession(true, session, "invalid", now)).toBe(false);
  expect(isFreshLiveSession(true, session, new Date(now - LIVE_MAX_AGE_MS - 1).toISOString(), now)).toBe(false);
  expect(isFreshLiveSession(true, session, new Date(now + 60_000).toISOString(), now)).toBe(false);
});

test("a fresh connection cannot make a historical or future session live", () => {
  expect(isFreshLiveSession(true, session, update, now + 86400000)).toBe(false);
  expect(isFreshLiveSession(true, session, update, now - 86400000)).toBe(false);
  expect(isFreshLiveSession(true, { ...session, dateEnd: "invalid" }, update, now)).toBe(false);
});

test("local feed timestamps use the supplied GMT offset, never server timezone", () => {
  expect(normaliseFeedDate("2026-10-04T14:00:00", "03:00:00")).toBe("2026-10-04T14:00:00+03:00");
  expect(normaliseFeedDate("2026-10-04T06:00:00", "-05:00:00")).toBe("2026-10-04T06:00:00-05:00");
  expect(normaliseFeedDate(session.dateStart, "03:00:00")).toBe(session.dateStart);
  expect(isFreshLiveSession(true, { ...session, dateStart: "2026-10-04T11:00:00" }, update, now)).toBe(false);
});
