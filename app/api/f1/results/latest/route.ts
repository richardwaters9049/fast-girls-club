import { NextResponse } from "next/server";
import { F1_API_BASE_URL } from "@/lib/config";
import { normaliseResult } from "@/lib/f1/results-adapter";

export async function GET() {
  try {
    const response = await fetch(`${F1_API_BASE_URL}/results/current`, {
      cache: "no-store", signal: AbortSignal.timeout(55_000),
    });
    if (response.status === 404) return NextResponse.json({ race: null, results: [] }, { headers: { "Cache-Control": "no-store" } });
    if (!response.ok) throw new Error(`Results service returned ${response.status}`);
    const data = await response.json();
    if (!data || !Number.isInteger(data.season) || !Number.isInteger(data.round) || !Array.isArray(data.results)) {
      throw new Error("Invalid latest results response");
    }
    const results = data.results.map(normaliseResult).sort((a: ReturnType<typeof normaliseResult>, b: ReturnType<typeof normaliseResult>) => (a.position ?? Infinity) - (b.position ?? Infinity));
    if (!results.length) return NextResponse.json({ race: null, results: [] }, { headers: { "Cache-Control": "no-store" } });
    const detailsResponse = await fetch(`${F1_API_BASE_URL}/races/${data.round}`, {
      next: { revalidate: 60 }, signal: AbortSignal.timeout(15_000),
    }).catch(() => null);
    const envelope = detailsResponse?.ok ? await detailsResponse.json() : null;
    const details = envelope?.race ?? null;
    const sameRace = details?.round === data.round && details?.season === data.season;
    const winner = results.find((row: ReturnType<typeof normaliseResult>) => row.position === 1);
    return NextResponse.json({
      season: data.season, round: data.round,
      race: {
        ...data,
        results: undefined,
        winner: winner?.driver ? { ...winner.driver, fullName: winner.driver.name } : null,
        constructorWinner: winner?.constructor ?? null,
        laps: sameRace ? details.laps ?? null : null,
        fastestLap: sameRace ? details.fastestLap ?? null : null,
      },
      results,
    }, { headers: { "Cache-Control": "public, max-age=0, s-maxage=60" } });
  } catch (error) {
    console.error("Latest race results unavailable:", error);
    return NextResponse.json({ error: "Previous race results are temporarily unavailable" }, { status: 502, headers: { "Cache-Control": "no-store" } });
  }
}
