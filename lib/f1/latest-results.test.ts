import { afterAll, afterEach, expect, spyOn, test } from "bun:test";
import { GET } from "../../app/api/f1/results/latest/route";

const fetchSpy = spyOn(globalThis, "fetch");
afterEach(() => fetchSpy.mockReset());
afterAll(() => fetchSpy.mockRestore());

test("latest results retain their own race identity and winner", async () => {
  fetchSpy.mockResolvedValueOnce(Response.json({ season: 2026, round: 15, raceName: "Published race", results: [
    { position: 2, driver: { driverId: "second", fullName: "Second" } },
    { position: 1, driver: { driverId: "winner", fullName: "Winner" }, constructor: { name: "Team" } },
  ] })).mockResolvedValueOnce(Response.json({ race: { season: 2026, round: 16, laps: 56 } }));
  const response = await GET();
  const data = await response.json();
  expect(response.status).toBe(200);
  expect(data.round).toBe(15);
  expect(data.race.raceName).toBe("Published race");
  expect(data.race.winner.driverId).toBe("winner");
  expect(data.race.laps).toBeNull();
  expect(data.results[0].position).toBe(1);
});

test("no published results remains an honest empty state", async () => {
  fetchSpy.mockResolvedValueOnce(new Response(null, { status: 404 }));
  const response = await GET();
  expect(await response.json()).toEqual({ race: null, results: [] });
});

test("an upstream outage is not replaced by a successful empty result", async () => {
  const log = spyOn(console, "error").mockImplementation(() => {});
  try {
    fetchSpy.mockResolvedValueOnce(new Response(null, { status: 502 }));
    const response = await GET();
    expect(response.status).toBe(502);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
  } finally { log.mockRestore(); }
});

test("reads lap count and fastest lap from the nested race contract", async () => {
  fetchSpy.mockResolvedValueOnce(Response.json({ season: 2026, round: 15, results: [{ position: 1 }] }))
    .mockResolvedValueOnce(Response.json({ season: 2026, round: 15, race: { season: 2026, round: 15, laps: 51, fastestLap: { time: "1:44.916", driverId: "winner" } } }));
  const data = await (await GET()).json();
  expect(data.race.laps).toBe(51);
  expect(data.race.fastestLap.time).toBe("1:44.916");
});
