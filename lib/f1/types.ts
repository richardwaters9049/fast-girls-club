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
  season: number;
  count: number;
  standings: F1DriverStanding[];
}

export interface F1ConstructorStandingsResponse {
  season: number;
  count: number;
  standings: F1ConstructorStanding[];
}

/* -------------------------------------------------------------------------- */
/* F1 API race data                                                           */
/* -------------------------------------------------------------------------- */

export interface F1DriverWinner {
  driverId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  number: number;
  code: string;
  dateOfBirth: string;
  url: string;
}

export interface F1ConstructorWinner {
  constructorId: string;
  name: string;
  nationality: string;
  firstAppearance: number | null;
  constructorsChampionships: number;
  driversChampionships: number;
  url: string;
}

export interface F1RaceSession {
  date: string | null;
  time: string | null;
}

export interface F1Schedule {
  race: F1RaceSession;
  qualy: F1RaceSession;
  fp1: F1RaceSession;
  fp2: F1RaceSession;
  fp3: F1RaceSession;
  sprintQualy: F1RaceSession;
  sprintRace: F1RaceSession;
}

export interface F1Circuit {
  circuitId: string;
  name: string;
  country: string;
  city: string;
  length: string | null;
  lapRecord: string | null;
  firstParticipationYear: number | null;
  corners: number | null;
  fastestLapDriverId: string | null;
  fastestLapTeamId: string | null;
  fastestLapYear: number | null;
  url: string | null;
}

export interface F1FastestLap {
  time: string | null;
  driverId: string | null;
  constructorId: string | null;
}

export interface F1Race {
  raceId: string;
  championshipId: string;
  raceName: string;
  season: number;
  round: number;
  url: string | null;
  schedule: F1Schedule;
  laps: number | null;
  circuit: F1Circuit;
  fastestLap: F1FastestLap;
  winner: F1DriverWinner | null;
  constructorWinner: F1ConstructorWinner | null;
}
