import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    session: null,
    drivers: [],
    isLive: false,
    lastUpdated: null,
  });
}
