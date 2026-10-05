export function livePollingDelay(isLive: boolean, viewingLive: boolean, failures = 0): number {
  const normal = isLive ? (viewingLive ? 10_000 : 60_000) : 120_000;
  return failures > 0 ? Math.max(normal, Math.min(300_000, 30_000 * 2 ** Math.min(failures - 1, 4))) : normal;
}
