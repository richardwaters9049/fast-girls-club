import { NextResponse } from "next/server";

const F1_LIVE_SERVICE =
  process.env.F1_LIVE_SERVICE_URL ?? "http://127.0.0.1:8787";

export async function GET(): Promise<NextResponse> {
  try {
    const response = await fetch(`${F1_LIVE_SERVICE}/api/live`, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`F1 live service returned ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to connect to F1 live service:", error);

    return NextResponse.json(
      {
        session: null,
        drivers: [],
        isLive: false,
        currentLap: null,
        totalLaps: null,
        trackStatus: null,
        lastUpdated: null,
        connected: false,
      },
      {
        status: 503,
      },
    );
  }
}
