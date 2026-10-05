import { expect, test } from "bun:test";
import { canTrack, createAnalytics } from "./analytics";

test("tracking is limited to enabled production publication hosts", () => {
  expect(canTrack("fastgirlsclub.co.uk", true, true, "G-76CV16SY23")).toBe(true);
  for (const host of ["localhost", "127.0.0.1", "cms.fastgirlsclub.co.uk", "preview.vercel.app"]) {
    expect(canTrack(host, true, true, "G-76CV16SY23")).toBe(false);
  }
  expect(canTrack("fastgirlsclub.co.uk", false, true, "G-76CV16SY23")).toBe(false);
  expect(canTrack("fastgirlsclub.co.uk", true, false, "G-76CV16SY23")).toBe(false);
});

test("initialises automatic tracking once without manual events; withdrawal stops it", () => {
  const calls: unknown[][] = [];
  let loads = 0;
  let disabled = false;
  const tracker = createAnalytics({
    command: (...args) => { calls.push(args); },
    load: () => { loads++; },
    disable: () => { disabled = true; },
  }, "G-76CV16SY23");
  expect(calls).toHaveLength(0);
  tracker.start();
  tracker.start();
  expect(loads).toBe(1);
  expect(calls.filter((call) => call[0] === "config")).toHaveLength(1);
  expect(calls.find((call) => call[0] === "config")?.[2]).toMatchObject({ send_page_view: true });
  expect(calls.filter((call) => call[0] === "event")).toHaveLength(0);
  const count = calls.length;
  tracker.revoke();
  tracker.start();
  expect(disabled).toBe(true);
  expect(calls).toHaveLength(count);
  expect(loads).toBe(1);
});
