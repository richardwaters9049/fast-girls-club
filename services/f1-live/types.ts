export interface SignalRDriver {
  RacingNumber?: string;
  BroadcastName?: string;
  FullName?: string;
  Tla?: string;
  Line?: number;
  TeamName?: string;
  TeamColour?: string;
  FirstName?: string;
  LastName?: string;
  Reference?: string;
  HeadshotUrl?: string;
  CountryCode?: string;
}

export interface SignalRTimingDriver {
  RacingNumber?: string;
  Line?: number;
  Position?: number;
  ShowPosition?: string;
  GapToLeader?: string;
  IntervalToPositionAhead?: string;
  Retired?: boolean;
  InPit?: boolean;
  PitOut?: boolean;
  Stopped?: boolean;
  Status?: string;
  NumberOfLaps?: number;
  NumberOfPitStops?: number;
  BestLapTime?: {
    Value?: string;
    Lap?: number;
  };
  LastLapTime?: {
    Value?: string;
    Lap?: number;
  };
  Sectors?: Record<string, unknown>;
  Speeds?: Record<string, unknown>;
}

export interface F1LiveDriver {
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
  dnf: boolean;
  inPit: boolean;
  stopped: boolean;
}

export interface F1LiveSession {
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

export interface F1LiveState {
  session: F1LiveSession | null;
  drivers: F1LiveDriver[];
  isLive: boolean;
  currentLap: number | null;
  totalLaps: number | null;
  trackStatus: string | null;
  lastUpdated: string | null;
  connected: boolean;
}
