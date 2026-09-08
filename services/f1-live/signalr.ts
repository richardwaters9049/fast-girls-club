import WebSocket from "ws";

import type {
  F1LiveDriver,
  F1LiveSession,
  SignalRDriver,
  SignalRTimingDriver,
} from "./types";

const NEGOTIATE_URL =
  "https://livetiming.formula1.com/signalrcore/negotiate?negotiateVersion=1";

const WEBSOCKET_URL = "wss://livetiming.formula1.com/signalrcore";

const USER_AGENT = "BestHTTP";

const RECONNECT_DELAY = 5000;

const TOPICS = [
  "Heartbeat",
  "DriverList",
  "ExtrapolatedClock",
  "RaceControlMessages",
  "SessionInfo",
  "SessionStatus",
  "TeamRadio",
  "TimingAppData",
  "TimingStats",
  "TrackStatus",
  "WeatherData",
  "Position.z",
  "CarData.z",
  "ContentStreams",
  "SessionData",
  "TimingData",
  "TopThree",
  "RcmSeries",
  "LapCount",
];

interface SignalRMessage {
  type?: number;
  target?: string;
  arguments?: unknown[];
  result?: unknown;
  error?: string;
}

interface SignalRNegotiationResponse {
  negotiateVersion?: number;
  connectionId?: string;
  connectionToken?: string;
  availableTransports?: Array<{
    transport: string;
    transferFormats: string[];
  }>;
}

interface F1SignalRClientOptions {
  onDrivers: (drivers: F1LiveDriver[]) => void;
  onSession: (session: F1LiveSession | null) => void;
  onLap: (currentLap: number | null, totalLaps: number | null) => void;
  onTrackStatus: (trackStatus: string | null) => void;
  onConnected: () => void;
  onDisconnected: () => void;
  onError: (error: Error) => void;
}

export class F1SignalRClient {
  private socket: WebSocket | null = null;

  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  private stopped = false;

  private handshakeComplete = false;

  private subscribed = false;

  private invocationId = 0;

  private readonly options: F1SignalRClientOptions;

  private drivers = new Map<string, SignalRDriver>();

  private timingDrivers = new Map<string, SignalRTimingDriver>();

  private session: F1LiveSession | null = null;

  constructor(options: F1SignalRClientOptions) {
    this.options = options;
  }

  async start(): Promise<void> {
    this.stopped = false;

    await this.connect();
  }

  stop(): void {
    this.stopped = true;

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);

      this.reconnectTimer = null;
    }

    if (this.socket) {
      this.socket.removeAllListeners();

      this.socket.close();

      this.socket = null;
    }

    this.handshakeComplete = false;
    this.subscribed = false;
  }

  private async connect(): Promise<void> {
    if (this.stopped) {
      return;
    }

    try {
      console.log("[F1 SignalR] negotiating SignalR Core connection...");

      const negotiation = await this.negotiate();

      const connectionToken = negotiation.connectionToken;

      if (!connectionToken) {
        throw new Error(
          "SignalR negotiation did not return a connection token",
        );
      }

      console.log("[F1 SignalR] negotiation successful");

      await this.openWebSocket(connectionToken);
    } catch (error) {
      const normalizedError =
        error instanceof Error ? error : new Error(String(error));

      this.options.onError(normalizedError);

      this.scheduleReconnect();
    }
  }

  private async negotiate(): Promise<SignalRNegotiationResponse> {
    const response = await fetch(NEGOTIATE_URL, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "User-Agent": USER_AGENT,
      },
    });

    if (!response.ok) {
      throw new Error(
        `SignalR negotiation failed: ${response.status} ${response.statusText}`,
      );
    }

    const setCookie = response.headers.get("set-cookie");

    if (setCookie) {
      const awsCookie = this.extractCookie(setCookie, "AWSALBCORS");

      if (awsCookie) {
        this.awsCookie = awsCookie;

        console.log("[F1 SignalR] AWS load-balancer cookie received");
      }
    }

    return (await response.json()) as SignalRNegotiationResponse;
  }

  private awsCookie: string | null = null;

  private async openWebSocket(connectionToken: string): Promise<void> {
    const url = `${WEBSOCKET_URL}?id=${encodeURIComponent(connectionToken)}`;

    console.log("[F1 SignalR] opening WebSocket...");

    const headers: Record<string, string> = {
      "User-Agent": USER_AGENT,
      Origin: "https://www.formula1.com",
    };

    if (this.awsCookie) {
      headers.Cookie = this.awsCookie;
    }

    await new Promise<void>((resolve, reject) => {
      const socket = new WebSocket(url, {
        headers,
      });

      this.socket = socket;

      let opened = false;

      socket.on("open", () => {
        opened = true;

        console.log("[F1 SignalR] WebSocket connected");

        this.handshakeComplete = false;

        this.subscribed = false;

        this.sendHandshake();

        resolve();
      });

      socket.on("message", (data) => {
        this.handleRawMessage(data.toString());
      });

      socket.on("error", (error) => {
        console.error("[F1 SignalR] WebSocket error:", error.message);

        this.options.onError(error);

        if (!opened) {
          reject(error);
        }
      });

      socket.on("close", (code, reason) => {
        console.log(
          `[F1 SignalR] WebSocket closed: ${code} ${reason.toString()}`,
        );

        this.socket = null;

        this.handshakeComplete = false;

        this.subscribed = false;

        this.options.onDisconnected();

        this.scheduleReconnect();
      });
    });
  }

  private sendHandshake(): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      return;
    }

    const handshake =
      JSON.stringify({
        protocol: "json",
        version: 1,
      }) + "\u001e";

    console.log("[F1 SignalR] sending handshake...");

    this.socket.send(handshake);
  }

  private sendSubscription(): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      return;
    }

    if (!this.handshakeComplete) {
      return;
    }

    if (this.subscribed) {
      return;
    }

    const invocation = {
      type: 1,
      invocationId: String(++this.invocationId),
      target: "Subscribe",
      arguments: [TOPICS],
    };

    const payload = JSON.stringify(invocation) + "\u001e";

    console.log("[F1 SignalR] subscribing to F1 timing topics...");

    this.socket.send(payload);

    this.subscribed = true;

    this.options.onConnected();
  }

  private sendPing(): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      return;
    }

    const ping =
      JSON.stringify({
        type: 6,
      }) + "\u001e";

    this.socket.send(ping);
  }

  private handleRawMessage(rawMessage: string): void {
    const messages = rawMessage
      .split("\u001e")
      .filter((message) => message.trim().length > 0);

    for (const raw of messages) {
      console.log("\n========== F1 SIGNALR RAW MESSAGE ==========");

      console.log(raw);

      console.log("========== END F1 SIGNALR MESSAGE ==========\n");

      try {
        const message = JSON.parse(raw) as SignalRMessage;

        console.log(`[F1 SignalR] parsed target: type ${message.type}`);

        if (!this.handshakeComplete && message.type === undefined) {
          this.handshakeComplete = true;

          console.log("[F1 SignalR] SignalR handshake complete");

          this.sendSubscription();

          continue;
        }

        this.handleSignalRMessage(message);
      } catch (error) {
        console.error("[F1 SignalR] failed to parse message:", error);
      }
    }
  }

  private handleSignalRMessage(message: SignalRMessage): void {
    if (message.type === 6) {
      this.sendPing();

      return;
    }

    if (message.type === 7) {
      console.error(
        "[F1 SignalR] server closed connection:",
        message.error ?? "unknown reason",
      );

      this.socket?.close();

      return;
    }

    if (message.type === 3) {
      this.handleInvocationResult(message.result);

      return;
    }

    if (message.type !== 1 || !message.target) {
      return;
    }

    const args = message.arguments ?? [];

    this.handleTopic(message.target, args[0]);
  }

  private handleInvocationResult(result: unknown): void {
    if (!result || typeof result !== "object" || Array.isArray(result)) {
      return;
    }

    const data = result as Record<string, unknown>;

    for (const [target, payload] of Object.entries(data)) {
      if (target === "_kf") {
        continue;
      }

      this.handleTopic(target, payload);
    }
  }

  private handleTopic(target: string, payload: unknown): void {
    switch (target) {
      case "DriverList":
        this.handleDriverList(payload);
        break;

      case "TimingData":
        this.handleTimingData(payload);
        break;

      case "TimingAppData":
        this.handleTimingAppData(payload);
        break;

      case "SessionInfo":
        this.handleSessionInfo(payload);
        break;

      case "SessionStatus":
        this.handleSessionStatus(payload);
        break;

      case "LapCount":
        this.handleLapCount(payload);
        break;

      case "TrackStatus":
        this.handleTrackStatus(payload);
        break;

      case "ExtrapolatedClock":
        break;

      case "Heartbeat":
        break;

      default:
        break;
    }
  }

  private handleDriverList(payload: unknown): void {
    if (!payload) {
      return;
    }

    const driverEntries = this.extractObjectEntries(payload);

    for (const [key, value] of driverEntries) {
      if (!value || typeof value !== "object" || Array.isArray(value)) {
        continue;
      }

      const driver = value as SignalRDriver;

      const racingNumber = driver.RacingNumber ?? key;

      if (!racingNumber) {
        continue;
      }

      const existing = this.drivers.get(racingNumber);

      this.drivers.set(racingNumber, {
        ...(existing ?? {}),
        ...driver,
      });
    }

    this.emitDrivers();
  }

  private handleTimingData(payload: unknown): void {
    if (!payload) {
      return;
    }

    const lines = this.extractTimingLines(payload);

    for (const [key, value] of lines) {
      if (!value || typeof value !== "object" || Array.isArray(value)) {
        continue;
      }

      const rawTiming = value as SignalRTimingDriver;

      const racingNumber = rawTiming.RacingNumber ?? key;

      if (!racingNumber) {
        continue;
      }

      const existing = this.timingDrivers.get(racingNumber);

      this.timingDrivers.set(racingNumber, {
        ...(existing ?? {}),
        ...rawTiming,
      });

      this.updateDriverFromTiming(
        racingNumber,
        value as Record<string, unknown>,
      );
    }

    this.emitDrivers();
  }

  private handleTimingAppData(payload: unknown): void {
    if (!payload) {
      return;
    }

    const entries = this.extractObjectEntries(payload);

    for (const [key, value] of entries) {
      if (!value || typeof value !== "object" || Array.isArray(value)) {
        continue;
      }

      const record = value as Record<string, unknown>;

      const racingNumber =
        this.stringFrom(record, ["RacingNumber", "racingNumber"]) ?? key;

      if (!racingNumber) {
        continue;
      }

      const timing = this.timingDrivers.get(racingNumber) ?? {};

      const bestLap = this.extractLap(record, "BestLapTime");

      const lastLap = this.extractLap(record, "LastLapTime");

      const updated: SignalRTimingDriver = {
        ...timing,
      };

      if (bestLap) {
        updated.BestLapTime = bestLap;
      }

      if (lastLap) {
        updated.LastLapTime = lastLap;
      }

      this.timingDrivers.set(racingNumber, updated);
    }

    this.emitDrivers();
  }

  private handleSessionInfo(payload: unknown): void {
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
      return;
    }

    const data = payload as Record<string, unknown>;

    const meeting = this.objectFrom(data, ["Meeting", "meeting"]);

    const session = this.objectFrom(data, ["Session", "session"]);

    const meetingData = meeting ?? {};

    const sessionData = session ?? {};

    const sessionKey = this.numberFrom(sessionData, [
      "Key",
      "key",
      "SessionKey",
      "sessionKey",
    ]);

    const meetingKey = this.numberFrom(meetingData, [
      "Key",
      "key",
      "MeetingKey",
      "meetingKey",
    ]);

    if (sessionKey === null && meetingKey === null) {
      return;
    }

    this.session = {
      sessionKey: sessionKey ?? 0,
      meetingKey: meetingKey ?? 0,
      sessionName:
        this.stringFrom(sessionData, [
          "Name",
          "name",
          "SessionName",
          "sessionName",
        ]) ?? "",
      sessionType:
        this.stringFrom(sessionData, [
          "Type",
          "type",
          "SessionType",
          "sessionType",
        ]) ?? "",
      countryName:
        this.stringFrom(meetingData, [
          "Location",
          "location",
          "CountryName",
          "countryName",
        ]) ?? "",
      countryCode:
        this.stringFrom(meetingData, ["CountryCode", "countryCode"]) ?? "",
      circuitName:
        this.stringFrom(meetingData, [
          "Circuit",
          "circuit",
          "CircuitName",
          "circuitName",
        ]) ?? "",
      location: this.stringFrom(meetingData, ["Location", "location"]) ?? "",
      dateStart:
        this.stringFrom(sessionData, [
          "StartDate",
          "startDate",
          "DateStart",
          "dateStart",
        ]) ?? "",
      dateEnd:
        this.stringFrom(sessionData, [
          "EndDate",
          "endDate",
          "DateEnd",
          "dateEnd",
        ]) ?? "",
    };

    this.options.onSession(this.session);
  }

  private handleSessionStatus(payload: unknown): void {
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
      return;
    }

    const data = payload as Record<string, unknown>;

    const status = this.stringFrom(data, ["Status", "status", "Name", "name"]);

    if (status && this.session) {
      this.options.onSession(this.session);
    }
  }

  private handleLapCount(payload: unknown): void {
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
      return;
    }

    const data = payload as Record<string, unknown>;

    const currentLap = this.numberFrom(data, ["CurrentLap", "currentLap"]);

    const totalLaps = this.numberFrom(data, ["TotalLaps", "totalLaps"]);

    this.options.onLap(currentLap, totalLaps);
  }

  private handleTrackStatus(payload: unknown): void {
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
      return;
    }

    const data = payload as Record<string, unknown>;

    const status = this.stringFrom(data, [
      "Message",
      "message",
      "Status",
      "status",
      "Name",
      "name",
    ]);

    this.options.onTrackStatus(status);
  }

  private updateDriverFromTiming(
    racingNumber: string,
    timing: Record<string, unknown>,
  ): void {
    const existing = this.drivers.get(racingNumber) ?? {};

    const updated: SignalRDriver = {
      ...existing,
    };

    const position = this.numberFrom(timing, [
      "Position",
      "position",
      "Line",
      "line",
    ]);

    const acronym = this.stringFrom(timing, [
      "Tla",
      "TLA",
      "tla",
      "Acronym",
      "acronym",
    ]);

    const fullName = this.stringFrom(timing, [
      "FullName",
      "fullName",
      "BroadcastName",
      "broadcastName",
    ]);

    const team = this.stringFrom(timing, [
      "Team",
      "team",
      "TeamName",
      "teamName",
    ]);

    const teamColour = this.stringFrom(timing, [
      "TeamColour",
      "teamColour",
      "TeamColor",
      "teamColor",
    ]);

    if (position !== null) {
      updated.Line = position;
    }

    if (acronym) {
      updated.Tla = acronym;
    }

    if (fullName) {
      updated.FullName = fullName;
    }

    if (team) {
      updated.TeamName = team;
    }

    if (teamColour) {
      updated.TeamColour = teamColour;
    }

    updated.RacingNumber = racingNumber;

    this.drivers.set(racingNumber, updated);
  }

  private emitDrivers(): void {
    const racingNumbers = new Set<string>();

    for (const key of this.drivers.keys()) {
      racingNumbers.add(key);
    }

    for (const key of this.timingDrivers.keys()) {
      racingNumbers.add(key);
    }

    const drivers = Array.from(racingNumbers)
      .map((racingNumber) => this.mapDriver(racingNumber))
      .filter((driver) => driver !== null)
      .sort((a, b) => a!.position - b!.position) as F1LiveDriver[];

    this.options.onDrivers(drivers);
  }

  private mapDriver(racingNumber: string): F1LiveDriver | null {
    const driver = this.drivers.get(racingNumber);

    const timing = this.timingDrivers.get(racingNumber);

    if (!driver && !timing) {
      return null;
    }

    const timingRecord = timing as Record<string, unknown> | undefined;

    const driverRecord = driver as Record<string, unknown> | undefined;

    const position =
      this.numberFrom(timingRecord, ["Position", "position", "Line", "line"]) ??
      driver?.Line ??
      999;

    const interval = this.getTimingString(timingRecord, [
      "IntervalToPositionAhead",
      "DiffToAhead",
    ]);

    const gapToLeader = this.getTimingString(timingRecord, [
      "GapToLeader",
      "DiffToLeader",
    ]);

    const fastestLap = this.getFastestLap(timingRecord);

    const fullName =
      driver?.FullName ??
      this.stringFrom(timingRecord, ["FullName", "fullName"]) ??
      `${driver?.FirstName ?? ""} ${driver?.LastName ?? ""}`.trim();

    const team =
      driver?.TeamName ??
      this.stringFrom(timingRecord, ["Team", "team", "TeamName", "teamName"]) ??
      "Unknown";

    const teamColour = this.normaliseColour(
      driver?.TeamColour ??
        this.stringFrom(timingRecord, [
          "TeamColour",
          "teamColour",
          "TeamColor",
          "teamColor",
        ]),
    );

    const acronym =
      driver?.Tla ??
      this.stringFrom(timingRecord, ["Tla", "TLA", "tla"]) ??
      "---";

    const number = Number(racingNumber);

    return {
      position,
      driverNumber: Number.isFinite(number) ? number : 0,
      acronym,
      name: fullName || driver?.BroadcastName || racingNumber,
      nationality: "",
      countryCode: driver?.CountryCode ?? "",
      team,
      teamColour,
      interval,
      gapToLeader,
      fastestLap,
      headshotUrl: driver?.HeadshotUrl ?? null,
      dnf: this.booleanFrom(timingRecord, ["Retired", "retired"]) ?? false,
      inPit: this.booleanFrom(timingRecord, ["InPit", "inPit"]) ?? false,
      stopped: this.booleanFrom(timingRecord, ["Stopped", "stopped"]) ?? false,
    };
  }

  private getTimingString(
    value: Record<string, unknown> | null | undefined,
    keys: string[],
  ): string | null {
    if (!value) {
      return null;
    }

    return this.stringFrom(value, keys);
  }

  private getFastestLap(
    timing: Record<string, unknown> | null | undefined,
  ): string | null {
    if (!timing) {
      return null;
    }

    const bestLap = this.extractLap(timing, "BestLapTime");

    if (bestLap?.Value) {
      return bestLap.Value;
    }

    const lastLap = this.extractLap(timing, "LastLapTime");

    if (lastLap?.Value) {
      return lastLap.Value;
    }

    return this.stringFrom(timing, ["LapTime", "lapTime"]) ?? null;
  }

  private extractLap(
    value: Record<string, unknown>,
    key: string,
  ): {
    Value?: string;
    Lap?: number;
  } | null {
    const candidate = value[key];

    if (
      !candidate ||
      typeof candidate !== "object" ||
      Array.isArray(candidate)
    ) {
      return null;
    }

    const record = candidate as Record<string, unknown>;

    const result: {
      Value?: string;
      Lap?: number;
    } = {};

    const lapValue = this.stringFrom(record, ["Value", "value"]);

    const lapNumber = this.numberFrom(record, ["Lap", "lap"]);

    if (lapValue) {
      result.Value = lapValue;
    }

    if (lapNumber !== null) {
      result.Lap = lapNumber;
    }

    return result;
  }

  private extractTimingLines(payload: unknown): Array<[string, unknown]> {
    if (Array.isArray(payload)) {
      return payload.map((value, index) => [String(index), value]);
    }

    if (typeof payload !== "object" || payload === null) {
      return [];
    }

    const record = payload as Record<string, unknown>;

    const lines = record.Lines ?? record.lines;

    if (Array.isArray(lines)) {
      return lines.map((value, index) => {
        const object = this.objectFromUnknown(value);

        const racingNumber = object
          ? this.stringFrom(object, ["RacingNumber", "racingNumber"])
          : null;

        return [racingNumber ?? String(index), value];
      });
    }

    if (lines && typeof lines === "object") {
      return Object.entries(lines as Record<string, unknown>);
    }

    const directLines = Object.entries(record).filter(([key]) => key !== "_kf");

    return directLines;
  }

  private extractObjectEntries(payload: unknown): Array<[string, unknown]> {
    if (Array.isArray(payload)) {
      return payload.map((value, index) => [String(index), value]);
    }

    if (typeof payload !== "object" || payload === null) {
      return [];
    }

    return Object.entries(payload as Record<string, unknown>).filter(
      ([key]) => key !== "_kf",
    );
  }

  private objectFrom(
    value: Record<string, unknown>,
    keys: string[],
  ): Record<string, unknown> | null {
    for (const key of keys) {
      const candidate = value[key];

      if (
        candidate &&
        typeof candidate === "object" &&
        !Array.isArray(candidate)
      ) {
        return candidate as Record<string, unknown>;
      }
    }

    return null;
  }

  private objectFromUnknown(value: unknown): Record<string, unknown> | null {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      return null;
    }

    return value as Record<string, unknown>;
  }

  private stringFrom(
    value: Record<string, unknown> | null | undefined,
    keys: string[],
  ): string | null {
    if (!value) {
      return null;
    }

    for (const key of keys) {
      const candidate = value[key];

      if (typeof candidate === "string") {
        return candidate;
      }

      if (typeof candidate === "number") {
        return String(candidate);
      }
    }

    return null;
  }

  private numberFrom(
    value: object | null | undefined,
    keys: string[],
  ): number | null {
    if (!value) {
      return null;
    }

    const record = value as Record<string, unknown>;

    for (const key of keys) {
      const candidate = record[key];

      if (typeof candidate === "number") {
        return candidate;
      }

      if (typeof candidate === "string") {
        const parsed = Number(candidate);

        if (Number.isFinite(parsed)) {
          return parsed;
        }
      }
    }

    return null;
  }

  private booleanFrom(
    value: Record<string, unknown> | null | undefined,
    keys: string[],
  ): boolean | null {
    if (!value) {
      return null;
    }

    for (const key of keys) {
      const candidate = value[key];

      if (typeof candidate === "boolean") {
        return candidate;
      }

      if (typeof candidate === "string") {
        if (candidate === "true" || candidate === "1") {
          return true;
        }

        if (candidate === "false" || candidate === "0") {
          return false;
        }
      }

      if (typeof candidate === "number") {
        return candidate !== 0;
      }
    }

    return null;
  }

  private normaliseColour(colour: string | null | undefined): string {
    if (!colour) {
      return "";
    }

    const value = colour.trim();

    if (!value) {
      return "";
    }

    if (value.startsWith("#")) {
      return value;
    }

    if (/^[0-9a-fA-F]{6}$/.test(value)) {
      return `#${value}`;
    }

    return value;
  }

  private extractCookie(header: string, cookieName: string): string | null {
    const match = header.match(new RegExp(`${cookieName}=([^;]+)`));

    if (!match) {
      return null;
    }

    return `${cookieName}=${match[1]}`;
  }

  private scheduleReconnect(): void {
    if (this.stopped) {
      return;
    }

    if (this.reconnectTimer) {
      return;
    }

    console.log(`[F1 SignalR] reconnecting in ${RECONNECT_DELAY / 1000}s`);

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;

      void this.connect();
    }, RECONNECT_DELAY);
  }
}
