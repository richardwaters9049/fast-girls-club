import { createServer } from "node:http";

import WebSocket, { WebSocketServer } from "ws";

import { F1SignalRClient } from "./signalr";
import type { F1LiveDriver, F1LiveSession, F1LiveState } from "./types";

const PORT = Number(process.env.F1_LIVE_PORT ?? 8787);

const HOST = process.env.F1_LIVE_HOST ?? "127.0.0.1";

let state: F1LiveState = {
  session: null,
  drivers: [],
  isLive: false,
  currentLap: null,
  totalLaps: null,
  trackStatus: null,
  lastUpdated: null,
  connected: false,
};

const httpServer = createServer((request, response) => {
  const url = new URL(request.url ?? "/", `http://${HOST}:${PORT}`);

  response.setHeader("Access-Control-Allow-Origin", "*");

  response.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");

  response.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (request.method === "OPTIONS") {
    response.writeHead(204);
    response.end();
    return;
  }

  if (request.method === "GET" && url.pathname === "/health") {
    sendJson(response, {
      status: "ok",
      connected: state.connected,
      drivers: state.drivers.length,
    });

    return;
  }

  if (request.method === "GET" && url.pathname === "/api/live") {
    sendJson(response, state);
    return;
  }

  response.writeHead(404);
  response.end(
    JSON.stringify({
      error: "Not found",
    }),
  );
});

const websocketServer = new WebSocketServer({
  server: httpServer,
  path: "/ws",
});

websocketServer.on("connection", (socket) => {
  console.log("[F1 Live] local WebSocket client connected");

  socket.send(JSON.stringify(state));

  socket.on("close", () => {
    console.log("[F1 Live] local WebSocket client disconnected");
  });
});

const signalR = new F1SignalRClient({
  onDrivers: (drivers: F1LiveDriver[]) => {
    state = {
      ...state,
      drivers,
      lastUpdated: new Date().toISOString(),
    };

    broadcast();
  },

  onSession: (session: F1LiveSession | null) => {
    state = {
      ...state,
      session,
      lastUpdated: new Date().toISOString(),
    };

    broadcast();
  },

  onLap: (currentLap, totalLaps) => {
    state = {
      ...state,
      currentLap,
      totalLaps,
      lastUpdated: new Date().toISOString(),
    };

    broadcast();
  },

  onTrackStatus: (trackStatus) => {
    state = {
      ...state,
      trackStatus,
      lastUpdated: new Date().toISOString(),
    };

    broadcast();
  },

  onConnected: () => {
    console.log("[F1 SignalR] connected");

    state = {
      ...state,
      connected: true,
      lastUpdated: new Date().toISOString(),
    };

    broadcast();
  },

  onDisconnected: () => {
    console.log("[F1 SignalR] disconnected");

    state = {
      ...state,
      connected: false,
      isLive: false,
      lastUpdated: new Date().toISOString(),
    };

    broadcast();
  },

  onError: (error) => {
    console.error("[F1 SignalR]", error.message);
  },
});

function broadcast(): void {
  const payload = JSON.stringify(state);

  for (const client of websocketServer.clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  }
}

function sendJson(
  response: import("node:http").ServerResponse,
  data: unknown,
): void {
  const payload = JSON.stringify(data);

  response.writeHead(200, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store, no-cache, must-revalidate",
  });

  response.end(payload);
}

httpServer.listen(PORT, HOST, () => {
  console.log(`[F1 Live] HTTP API: http://${HOST}:${PORT}/api/live`);

  console.log(`[F1 Live] WebSocket: ws://${HOST}:${PORT}/ws`);

  console.log("[F1 Live] Connecting to Formula 1 SignalR...");

  void signalR.start();
});

function shutdown(): void {
  console.log("[F1 Live] shutting down...");

  signalR.stop();

  for (const client of websocketServer.clients) {
    client.close();
  }

  websocketServer.close();

  httpServer.close(() => {
    process.exit(0);
  });
}

process.on("SIGINT", shutdown);

process.on("SIGTERM", shutdown);
