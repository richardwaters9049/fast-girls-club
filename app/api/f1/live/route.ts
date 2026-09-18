import { NextResponse } from "next/server";

import { F1_API_BASE_URL } from "@/lib/config";

type JsonRecord = Record<string, unknown>;

interface NormalisedDriver {
  position: number;
  driverNumber: number;
  acronym: string;
  name: string;
  nationality: string;
  countryCode: string;
  team: string;
  teamColour: string;
  interval: string | null;
  gapToLeader: string | null;
  fastestLap: string | null;
  headshotUrl: string | null;
  dnf?: boolean;
  dns?: boolean;
  dsq?: boolean;
  stopped?: boolean;
  inPit?: boolean;
  lastLap?: string | null;
  bestLap?: string | null;
  sector1?: string | null;
  sector2?: string | null;
  sector3?: string | null;
}

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim() !== "" ? value.trim() : null;
}

function asNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);

    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function getRecordValue(record: JsonRecord | null, ...keys: string[]): unknown {
  if (!record) {
    return undefined;
  }

  for (const key of keys) {
    if (key in record) {
      return record[key];
    }
  }

  return undefined;
}

function getString(
  record: JsonRecord | null,
  ...keys: string[]
): string | null {
  return asString(getRecordValue(record, ...keys));
}

function getNumber(
  record: JsonRecord | null,
  ...keys: string[]
): number | null {
  return asNumber(getRecordValue(record, ...keys));
}

function getNestedRecord(
  record: JsonRecord | null,
  ...keys: string[]
): JsonRecord | null {
  if (!record) {
    return null;
  }

  for (const key of keys) {
    const value = record[key];

    if (isRecord(value)) {
      return value;
    }
  }

  return null;
}

function getLines(data: unknown): JsonRecord[] {
  if (!isRecord(data)) {
    return [];
  }

  const lines = data.Lines;

  if (!isRecord(lines)) {
    return [];
  }

  const result: JsonRecord[] = [];

  for (const [driverNumber, value] of Object.entries(lines)) {
    if (!isRecord(value)) {
      continue;
    }

    result.push({
      DriverNumber: driverNumber,
      ...value,
    });
  }

  return result;
}

function getDriverEntries(data: unknown): JsonRecord[] {
  if (!isRecord(data)) {
    return [];
  }

  const result: JsonRecord[] = [];

  for (const [driverNumber, value] of Object.entries(data)) {
    if (!isRecord(value)) {
      continue;
    }

    result.push({
      DriverNumber: driverNumber,
      ...value,
    });
  }

  return result;
}

function extractDriverName(driver: JsonRecord): string {
  const firstName = getString(driver, "FirstName");
  const lastName = getString(driver, "LastName");

  if (firstName && lastName) {
    return `${firstName} ${lastName}`;
  }

  return (
    getString(driver, "FullName", "Name", "BroadcastName") ??
    getString(driver, "Tla", "TLA", "Acronym") ??
    ""
  );
}

function extractLapTime(
  record: JsonRecord | null,
  ...keys: string[]
): string | null {
  const directValue = getString(record, ...keys);

  if (directValue) {
    return directValue;
  }

  for (const key of keys) {
    const nested = getNestedRecord(record, key);
    const value = getString(nested, "Value", "Time", "LapTime");

    if (value) {
      return value;
    }
  }

  return null;
}

function extractSectorTime(
  timing: JsonRecord | null,
  sectorNumber: number,
): string | null {
  const directValue = getString(
    timing,
    `Sector${sectorNumber}`,
    `Sector${sectorNumber}Time`,
  );

  if (directValue) {
    return directValue;
  }

  const directSector = getNestedRecord(
    timing,
    `Sector${sectorNumber}`,
    `Sector${sectorNumber}Time`,
  );

  const directSectorValue = getString(directSector, "Value", "Time");

  if (directSectorValue) {
    return directSectorValue;
  }

  const sectors = getNestedRecord(timing, "Sectors");

  if (!sectors) {
    return null;
  }

  const sector =
    sectors[String(sectorNumber - 1)] ??
    sectors[String(sectorNumber)] ??
    sectors[`Sector${sectorNumber}`];

  if (!isRecord(sector)) {
    return null;
  }

  return getString(sector, "Value", "Time");
}

function extractDriver(
  driverNumber: number,
  driver: JsonRecord,
  timing: JsonRecord | null,
): NormalisedDriver | null {
  const position =
    getNumber(timing, "Position", "Line", "LineNumber") ??
    getNumber(driver, "Position", "Line", "LineNumber");

  if (position === null) {
    return null;
  }

  const acronym = getString(driver, "Tla", "TLA", "Acronym") ?? "";
  const team = getString(driver, "Team", "TeamName") ?? "";
  const teamColour = getString(driver, "TeamColour", "TeamColor") ?? "";
  const nationality = getString(driver, "Nationality") ?? "";
  const countryCode = getString(driver, "CountryCode") ?? "";

  const interval = getString(
    timing,
    "IntervalToPositionAhead",
    "Interval",
    "DiffToAhead",
  );

  const gapToLeader = getString(timing, "GapToLeader", "DiffToLeader");

  const lastLap = extractLapTime(timing, "LastLapTime");
  const bestLap = extractLapTime(timing, "BestLapTime");
  const fastestLap = bestLap ?? lastLap;

  const sector1 = extractSectorTime(timing, 1);
  const sector2 = extractSectorTime(timing, 2);
  const sector3 = extractSectorTime(timing, 3);

  const stopped = getRecordValue(timing, "Stopped") === true;
  const inPit = getRecordValue(timing, "InPit") === true;

  const status = getString(timing, "Status", "RaceStatus");
  const normalisedStatus = status?.toLowerCase();

  return {
    position,
    driverNumber,
    acronym,
    name: extractDriverName(driver),
    nationality,
    countryCode,
    team,
    teamColour,
    interval,
    gapToLeader,
    fastestLap,
    headshotUrl: getString(driver, "HeadshotUrl", "HeadshotURL"),
    dnf: normalisedStatus === "dnf",
    dns: normalisedStatus === "dns",
    dsq: normalisedStatus === "dsq",
    stopped,
    inPit,
    lastLap,
    bestLap,
    sector1,
    sector2,
    sector3,
  };
}

function buildDrivers(
  driverList: unknown,
  timingData: unknown,
): NormalisedDriver[] {
  const drivers = getDriverEntries(driverList);
  const lines = getLines(timingData);

  const timingByNumber = new Map<number, JsonRecord>();

  for (const line of lines) {
    const number = getNumber(line, "DriverNumber");

    if (number !== null) {
      timingByNumber.set(number, line);
    }
  }

  const result: NormalisedDriver[] = [];

  for (const driver of drivers) {
    const driverNumber = getNumber(driver, "DriverNumber", "RacingNumber");

    if (driverNumber === null) {
      continue;
    }

    const normalisedDriver = extractDriver(
      driverNumber,
      driver,
      timingByNumber.get(driverNumber) ?? null,
    );

    if (!normalisedDriver) {
      continue;
    }

    result.push(normalisedDriver);
  }

  return result.sort((a, b) => a.position - b.position);
}

function extractEntityName(value: unknown): string | null {
  if (typeof value === "string") {
    return asString(value);
  }

  if (!isRecord(value)) {
    return null;
  }

  return getString(
    value,
    "Name",
    "name",
    "ShortName",
    "shortName",
    "CountryName",
    "CircuitName",
    "Location",
  );
}

function extractEntityCode(value: unknown): string | null {
  if (!isRecord(value)) {
    return null;
  }

  return getString(
    value,
    "Code",
    "code",
    "CountryCode",
    "countryCode",
    "ShortName",
  );
}

function buildSession(
  sessionInfo: unknown,
  sessionStatus: unknown,
): {
  sessionKey: number;
  meetingKey: number;
  sessionName: string;
  sessionType: string;
  countryName: string;
  countryCode: string;
  circuitName: string;
  location: string;
  dateStart: string;
  dateEnd: string;
  status?: string;
} | null {
  if (!isRecord(sessionInfo)) {
    return null;
  }

  const meeting = getNestedRecord(sessionInfo, "Meeting");
  const session = getNestedRecord(sessionInfo, "Session");

  const sessionKey =
    getNumber(sessionInfo, "SessionKey", "Key") ??
    getNumber(session, "Key", "SessionKey");

  const meetingKey =
    getNumber(sessionInfo, "MeetingKey") ??
    getNumber(meeting, "Key", "MeetingKey");

  const dateStart =
    getString(sessionInfo, "StartDate", "DateStart") ??
    getString(session, "StartDate", "DateStart");

  const dateEnd =
    getString(sessionInfo, "EndDate", "DateEnd") ??
    getString(session, "EndDate", "DateEnd");

  if (sessionKey === null || meetingKey === null || !dateStart || !dateEnd) {
    return null;
  }

  const meetingCountry = meeting?.Country;
  const sessionCountry = sessionInfo.Country;

  const countryName =
    extractEntityName(meetingCountry) ??
    extractEntityName(sessionCountry) ??
    getString(meeting, "CountryName") ??
    getString(sessionInfo, "CountryName") ??
    "";

  const countryCode =
    extractEntityCode(meetingCountry) ??
    extractEntityCode(sessionCountry) ??
    getString(meeting, "CountryCode", "countryCode") ??
    getString(sessionInfo, "CountryCode", "countryCode") ??
    "";

  const meetingCircuit = meeting?.Circuit;

  const circuitName =
    extractEntityName(meetingCircuit) ??
    getString(meeting, "CircuitName") ??
    getString(sessionInfo, "CircuitName") ??
    "";

  const location =
    getString(meeting, "Location", "location") ??
    getString(sessionInfo, "Location", "location") ??
    "";

  const statusRecord = isRecord(sessionStatus) ? sessionStatus : null;

  const status = getString(statusRecord, "Status", "Name") ?? undefined;

  return {
    sessionKey,
    meetingKey,
    sessionName:
      getString(sessionInfo, "Name", "SessionName") ??
      getString(session, "Name", "SessionName") ??
      "",
    sessionType:
      getString(sessionInfo, "Type", "SessionType") ??
      getString(session, "Type", "SessionType") ??
      "",
    countryName,
    countryCode,
    circuitName,
    location,
    dateStart,
    dateEnd,
    status,
  };
}

function getCurrentLap(lapCount: unknown): number | null {
  if (!isRecord(lapCount)) {
    return null;
  }

  return getNumber(lapCount, "CurrentLap", "Current", "Lap");
}

function getTotalLaps(lapCount: unknown): number | null {
  if (!isRecord(lapCount)) {
    return null;
  }

  return getNumber(lapCount, "TotalLaps", "Total");
}

function buildTrackStatus(value: unknown): {
  status: string;
  message: string | null;
} | null {
  if (!isRecord(value)) {
    return null;
  }

  const status = getString(value, "Status") ?? getString(value, "Message");

  if (!status) {
    return null;
  }

  return {
    status,
    message: getString(value, "Message"),
  };
}

function buildWeather(value: unknown): {
  airTemp: number | null;
  humidity: number | null;
  pressure: number | null;
  rainfall: number | null;
  trackTemp: number | null;
  windDirection: number | null;
  windSpeed: number | null;
} | null {
  if (!isRecord(value)) {
    return null;
  }

  return {
    airTemp: getNumber(value, "AirTemp"),
    humidity: getNumber(value, "Humidity"),
    pressure: getNumber(value, "Pressure"),
    rainfall: getNumber(value, "Rainfall"),
    trackTemp: getNumber(value, "TrackTemp"),
    windDirection: getNumber(value, "WindDirection"),
    windSpeed: getNumber(value, "WindSpeed"),
  };
}

function extractRaceControlEntries(value: unknown): JsonRecord[] {
  if (!isRecord(value)) {
    return [];
  }

  const messages = value.Messages;

  if (isRecord(messages)) {
    return Object.values(messages).filter(isRecord);
  }

  if (Array.isArray(messages)) {
    return messages.filter(isRecord);
  }

  const directEntries = Object.values(value).filter(isRecord);

  if (
    directEntries.some(
      (entry) => "Message" in entry || "Utc" in entry || "UTC" in entry,
    )
  ) {
    return directEntries;
  }

  return [];
}

function buildRaceControl(value: unknown): Array<{
  utc: string;
  lap: number | null;
  category: string | null;
  message: string;
}> {
  const entries = extractRaceControlEntries(value);

  const result: Array<{
    utc: string;
    lap: number | null;
    category: string | null;
    message: string;
  }> = [];

  const seen = new Set<string>();

  for (const entry of entries) {
    const message = getString(entry, "Message");

    if (!message) {
      continue;
    }

    const utc = getString(entry, "Utc", "UTC") ?? "";
    const lap = getNumber(entry, "Lap");
    const category = getString(entry, "Category");

    const normalisedMessage = message.replace(/\s+/g, " ").trim().toLowerCase();

    const dedupeKey = [utc, lap ?? "", category ?? "", normalisedMessage].join(
      "|",
    );

    if (seen.has(dedupeKey)) {
      continue;
    }

    seen.add(dedupeKey);

    result.push({
      utc,
      lap,
      category,
      message: message.trim(),
    });
  }

  result.sort((a, b) => {
    const aTime = Date.parse(a.utc);
    const bTime = Date.parse(b.utc);

    if (Number.isFinite(aTime) && Number.isFinite(bTime)) {
      return aTime - bTime;
    }

    return 0;
  });

  return result;
}

export async function GET(): Promise<NextResponse> {
  try {
    const response = await fetch(`${F1_API_BASE_URL}/live`, {
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });

    if (!response.ok) {
      throw new Error(`F1 live service returned ${response.status}`);
    }

    const rawData: unknown = await response.json();

    if (!isRecord(rawData)) {
      throw new Error("F1 live service returned invalid data");
    }

    const session = buildSession(rawData.sessionInfo, rawData.sessionStatus);

    const drivers = buildDrivers(rawData.driverList, rawData.timingData);

    const currentLap = getCurrentLap(rawData.lapCount);

    const totalLaps = getTotalLaps(rawData.lapCount);

    const trackStatus = buildTrackStatus(rawData.trackStatus);

    const weather = buildWeather(rawData.weatherData);

    const raceControl = buildRaceControl(rawData.raceControlMessages);

    const sessionStatus = session?.status?.toLowerCase();

    const isLive = rawData.connected === true && sessionStatus === "started";

    return NextResponse.json({
      session,
      drivers,
      isLive,
      currentLap,
      totalLaps,
      trackStatus,
      weather,
      raceControl,
      lastUpdated:
        typeof rawData.lastUpdateAt === "string" ? rawData.lastUpdateAt : null,
      connected: rawData.connected === true,
    });
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
        weather: null,
        raceControl: [],
        lastUpdated: null,
        connected: false,
      },
      {
        status: 503,
      },
    );
  }
}
