type RecordValue = Record<string, unknown>;
function record(value: unknown): RecordValue | null {
  return value !== null && typeof value === "object" && !Array.isArray(value) ? value as RecordValue : null;
}
function text(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}
function number(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

/** Translate the sibling API contract, preserving unavailable fields as null. */
export function normaliseResult(value: unknown) {
  const result = record(value);
  if (!result) throw new Error("Invalid race result");
  const driver = record(result.driver);
  const constructor = record(result.constructor);
  const fastestLap = text(result.fastestLap);
  const retired = text(result.retired);
  return {
    position: number(result.position),
    number: number(driver?.number),
    points: number(result.points),
    driverId: text(driver?.driverId),
    driver: driver ? {
      driverId: text(driver.driverId),
      name: text(driver.fullName),
      firstName: text(driver.firstName),
      lastName: text(driver.lastName),
      nationality: text(driver.nationality),
      number: number(driver.number),
      code: text(driver.code),
    } : null,
    constructorId: text(constructor?.constructorId),
    constructor: constructor ? {
      constructorId: text(constructor.constructorId),
      name: text(constructor.name),
      nationality: text(constructor.nationality),
    } : null,
    grid: number(result.grid),
    laps: null,
    status: retired,
    retired,
    fastestLap: fastestLap ? { rank: null, lap: null, time: fastestLap, averageSpeed: null } : null,
    time: text(result.time),
    milliseconds: null,
  };
}
