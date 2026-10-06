// A visitor request can wake the public free service before server-to-server
// proxy requests. This is on-demand only, not a background keep-alive timer.
const WAKE_URL = process.env.NEXT_PUBLIC_F1_WAKE_URL ?? "https://f1-api-009n.onrender.com/api/health";
let pending: Promise<void> | undefined;
let lastWake = 0;

export function wakeF1Backend(): Promise<void> {
    if (typeof window === "undefined") return Promise.resolve();
    if (pending) return pending;
    if (Date.now() - lastWake < 5 * 60_000) return Promise.resolve();
    pending = fetch(WAKE_URL, {
        mode: "no-cors", credentials: "omit", cache: "no-store",
        signal: AbortSignal.timeout(75_000),
    }).then(() => {
        // An opaque response cannot prove application health. The same-origin
        // Grid requests still validate their HTTP status and data afterwards.
        lastWake = Date.now();
    }).catch(() => {
        // A blocked cross-origin request must not prevent normal proxy recovery.
    }).finally(() => { pending = undefined; });
    return pending;
}
