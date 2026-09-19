interface CircuitFacts {
  lengthKm: number;
  corners: number;
}

// Official circuit information used where the race feed omits a value.
// https://www.sepangcircuit.com/architecture
// https://www.formula1.com/en/information/azerbaijan-baku-city-circuit-baku.5KEzWNQG1x2nLSpfg5xBZh
const CIRCUIT_FACTS: Record<string, CircuitFacts> = {
  sepang: { lengthKm: 5.543, corners: 15 },
  baku: { lengthKm: 6.003, corners: 20 },
};

// The 2026 Madrid race feed omits its lap count. Keep this keyed to the race,
// not the circuit, because the number of laps can change between seasons.
// https://www.formula1.com/en/racing/2026/spain
const RACE_LAPS: Record<string, number> = {
  "2026:14:madring": 57,
};

// The provider reports Madrid as "5474km"; F1 lists the 2026 layout as
// 5.414 km. This correction is scoped to that race rather than future layouts.
// https://www.formula1.com/en/racing/2026/spain
const RACE_LENGTH_CORRECTIONS_KM: Record<string, number> = {
  "2026:14:madring": 5.414,
};

export function getVerifiedCircuitFacts(
  circuitId: string | null | undefined,
): CircuitFacts | null {
  if (!circuitId) return null;
  return CIRCUIT_FACTS[circuitId.toLowerCase()] ?? null;
}

export function getVerifiedRaceLaps(
  season: number,
  round: number,
  circuitId: string,
): number | null {
  return RACE_LAPS[`${season}:${round}:${circuitId.toLowerCase()}`] ?? null;
}

export function getVerifiedRaceLengthCorrectionKm(
  season: number,
  round: number,
  circuitId: string,
): number | null {
  return RACE_LENGTH_CORRECTIONS_KM[
    `${season}:${round}:${circuitId.toLowerCase()}`
  ] ?? null;
}

export function parseCircuitLengthKm(
  input: string | number | null | undefined,
): number | null {
  if (input === null || input === undefined) return null;

  const value = String(input).trim();
  const match = /^(\d+(?:\.\d+)?)\s*(km|m)?$/i.exec(value);

  if (!match) return null;

  const amount = Number(match[1]);

  if (!Number.isFinite(amount) || amount <= 0) return null;

  // The current provider sends metre values with a "km" suffix ("6003km").
  // A three- or four-digit circuit length is metres, regardless of suffix.
  const lengthKm = match[2]?.toLowerCase() === "m" || amount >= 1000
    ? amount / 1000
    : amount;

  return lengthKm > 0 && lengthKm < 30 ? lengthKm : null;
}
