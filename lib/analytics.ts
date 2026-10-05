export const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "";
export const ANALYTICS_ENABLED = process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === "true";

export function canTrack(hostname: string, production: boolean, enabled: boolean, id: string): boolean {
  return production && enabled && /^G-[A-Z0-9]+$/.test(id) &&
    ["fastgirlsclub.co.uk", "www.fastgirlsclub.co.uk"].includes(hostname);
}

export interface AnalyticsTransport {
  command: (...args: unknown[]) => void;
  load: () => void;
  disable: () => void;
}

export function createAnalytics(transport: AnalyticsTransport, id: string) {
  let started = false;
  let stopped = false;
  return {
    start() {
      if (started || stopped) return;
      transport.command("consent", "default", {
        analytics_storage: "granted",
        ad_storage: "denied",
        ad_user_data: "denied",
        ad_personalization: "denied",
      });
      transport.command("js", new Date());
      // GA4 sends the initial view; Enhanced measurement handles history changes
      // when enabled in the web stream. Never send additional manual page views.
      transport.command("config", id, {
        send_page_view: true,
        allow_google_signals: false,
        allow_ad_personalization_signals: false,
        cookie_domain: "none",
        cookie_expires: 15552000,
      });
      transport.load();
      started = true;
    },
    revoke() {
      if (started && !stopped) transport.disable();
      stopped = true;
    },
  };
}
