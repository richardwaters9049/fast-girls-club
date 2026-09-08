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

export interface F1LiveResponse {
  session: F1Session | null;
  drivers: F1Driver[];
  isLive: boolean;
  lastUpdated: string | null;
}

export interface F1DriverStandingsResponse {
  standings: F1DriverStanding[];
  sessionKey: number | null;
}

export interface F1ConstructorStandingsResponse {
  standings: F1ConstructorStanding[];
  sessionKey: number | null;
}
