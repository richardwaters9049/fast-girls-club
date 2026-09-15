export type F1Tab = "live" | "drivers" | "constructors";

export interface F1Session {
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
}

export interface F1Driver {
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

export interface F1DriverStanding {
  position: number;
  driverNumber: number;
  driver: string;
  acronym: string;
  nationality: string;
  countryCode: string;
  team: string;
  points: number;
  pointsStart: number;
  headshotUrl: string | null;
  teamColour: string;
}

export interface F1ConstructorStanding {
  position: number;
  team: string;
  countryCode: string;
  points: number;
  pointsStart: number;
  teamColour: string;
}

export interface F1TrackStatus {
  status: string;
  message: string | null;
}

export interface F1Weather {
  airTemp: number | null;
  humidity: number | null;
  pressure: number | null;
  rainfall: number | null;
  trackTemp: number | null;
  windDirection: number | null;
  windSpeed: number | null;
}

export interface F1RaceControlMessage {
  utc: string;
  lap: number | null;
  category: string | null;
  message: string;
}

export interface F1LiveResponse {
  session: F1Session | null;
  drivers: F1Driver[];
  isLive: boolean;
  currentLap: number | null;
  totalLaps: number | null;
  trackStatus: F1TrackStatus | null;
  weather: F1Weather | null;
  raceControl: F1RaceControlMessage[];
  lastUpdated: string | null;
  connected: boolean;
}

export interface F1DriverStandingsResponse {
  standings: F1DriverStanding[];
  sessionKey: number | null;
}

export interface F1ConstructorStandingsResponse {
  standings: F1ConstructorStanding[];
  sessionKey: number | null;
}
