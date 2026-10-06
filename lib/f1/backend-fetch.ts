/** Server transport: preserve Next's successful fetch cache and recover from wake-up failures. */
const pending = new Map<string, Promise<Response>>();
const RETRYABLE = new Set([429, 500, 502, 503, 504]);

type BackendOptions = RequestInit & { next?: { revalidate?: number | false; tags?: string[] } };

export function fetchF1Backend(input: string | URL, options: BackendOptions = {}, budgetMs = 90_000): Promise<Response> {
    const url = String(input);
    const key = JSON.stringify([url, options.cache, options.next, budgetMs]);
    let request = pending.get(key);
    if (!request) {
        request = recover(url, options, budgetMs).finally(() => { pending.delete(key); });
        pending.set(key, request);
    }
    // Each route needs its own body, including callers sharing an in-flight request.
    return request.then((response) => response.clone());
}

async function recover(url: string, options: BackendOptions, budgetMs: number): Promise<Response> {
    const deadline = Date.now() + budgetMs;
    for (let attempt = 0; ; attempt++) {
        try {
            const headers = new Headers(options.headers);
            headers.set("Accept", "application/json");
            headers.set("User-Agent", "FastGirlsClub/1.0 (+https://fastgirlsclub.co.uk)");
            const response = await fetch(url, {
                ...options,
                headers,
                signal: AbortSignal.timeout(Math.max(1, Math.min(65_000, deadline - Date.now()))),
            });
            if (!RETRYABLE.has(response.status) || attempt >= 2) return response;
            const retryAfter = response.headers.get("Retry-After");
            const seconds = retryAfter ? Number(retryAfter) : NaN;
            const retryAt = retryAfter ? Date.parse(retryAfter) : NaN;
            const requestedDelay = Number.isFinite(seconds) ? seconds * 1000 : retryAt - Date.now();
            const delay = Math.max(15_000 * (attempt + 1), Number.isFinite(requestedDelay) ? requestedDelay : 0);
            // Do not retry sooner than the backend requests, or wait indefinitely.
            if (Date.now() + delay >= deadline) return response;
            await response.body?.cancel();
            await new Promise((resolve) => setTimeout(resolve, delay));
        } catch (error) {
            const delay = 3_000 * (attempt + 1);
            if (attempt >= 2 || Date.now() + delay >= deadline) throw error;
            await new Promise((resolve) => setTimeout(resolve, delay));
        }
    }
}
