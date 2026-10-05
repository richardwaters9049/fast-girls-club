export const LIVE_MAX_AGE_MS = 120_000;
const SESSION_END_GRACE_MS = 30 * 60_000;

/** SignalR may supply local dates plus a separate GmtOffset. */
export function normaliseFeedDate(value: string, offset: unknown): string {
  if (/(Z|[+-]\d{2}:\d{2})$/i.test(value)) return value;
  if (typeof offset !== "string" || !/^[+-]?\d{2}:\d{2}(:\d{2})?$/.test(offset)) return value;
  const zone = offset.slice(0, offset.startsWith("+") || offset.startsWith("-") ? 6 : 5);
  return value + (zone.startsWith("+") || zone.startsWith("-") ? zone : "+" + zone);
}

function timestamp(value: unknown): number {
  return typeof value === "string" && /(Z|[+-]\d{2}:\d{2})$/i.test(value) ? Date.parse(value) : NaN;
}
export function isFreshLiveSession(
  connected: unknown,
  session: { status?: string; dateStart: string; dateEnd: string } | null,
  lastUpdated: unknown,
  now = Date.now(),
): boolean {
  if (connected !== true || session?.status?.toLowerCase() !== "started") return false;
  const start = timestamp(session.dateStart);
  const end = timestamp(session.dateEnd);
  const updated = timestamp(lastUpdated);
  return Number.isFinite(start) && Number.isFinite(end) && Number.isFinite(updated)
    && end >= start && now >= start && now <= end + SESSION_END_GRACE_MS
    && updated <= now + 30_000 && now - updated <= LIVE_MAX_AGE_MS;
}
