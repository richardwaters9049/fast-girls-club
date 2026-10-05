"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { ANALYTICS_ENABLED, GA_ID, canTrack, createAnalytics } from "@/lib/analytics";

type Consent = "accepted" | "rejected" | null;
const STORAGE_KEY = "fgc-analytics-consent-v1";
const CHANGE_EVENT = "fgc-consent-change";
const MAX_AGE = 180 * 24 * 60 * 60 * 1000;
let memoryConsent: Consent = null;
let controller: ReturnType<typeof createAnalytics> | null = null;

function readConsent(): Consent {
  if (memoryConsent !== null) return memoryConsent;
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null");
    if (stored && typeof stored.at === "number" && Date.now() - stored.at < MAX_AGE &&
        (stored.choice === "accepted" || stored.choice === "rejected")) return stored.choice;
  } catch { /* Storage may be unavailable; consent still works for this page. */ }
  return memoryConsent;
}

function subscribe(callback: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY && event.key !== null) return;
    memoryConsent = null;
    callback();
  };
  window.addEventListener(CHANGE_EVENT, callback);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(CHANGE_EVENT, callback);
    window.removeEventListener("storage", onStorage);
  };
}

function clearAnalyticsCookies() {
  const domains = [null, location.hostname, "." + location.hostname, ".fastgirlsclub.co.uk"];
  for (const cookie of document.cookie.split(";")) {
    const name = cookie.split("=")[0].trim();
    if (name !== "_ga" && !name.startsWith("_ga_")) continue;
    for (const domain of domains) {
      document.cookie = name + "=; Max-Age=0; Path=/" + (domain ? "; Domain=" + domain : "") + "; SameSite=Lax";
    }
  }
}

function stopTracking() {
  if (!controller) return;
  controller.revoke();
  clearAnalyticsCookies();
  // Remove the already-executed tag and its listeners by starting a fresh page.
  window.location.reload();
}

function saveConsent(choice: Exclude<Consent, null>) {
  memoryConsent = choice;
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ choice, at: Date.now() })); } catch {}
  if (choice === "rejected") clearAnalyticsCookies();
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

function analytics() {
  if (controller) return controller;
  const globals = window as unknown as Record<string, unknown>;
  const queue: IArguments[] = [];
  globals.dataLayer = queue;
  function command() {
    // Google gtag consumes Arguments entries, rather than dataLayer event arrays.
    // eslint-disable-next-line prefer-rest-params
    queue.push(arguments);
  }
  globals.gtag = command;
  controller = createAnalytics({
    command,
    load() {
      const script = document.createElement("script");
      script.id = "fgc-ga4";
      script.async = true;
      script.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(GA_ID);
      document.head.appendChild(script);
    },
    disable() { globals["ga-disable-" + GA_ID] = true; },
  }, GA_ID);
  return controller;
}

export default function AnalyticsConsent() {
  const consent = useSyncExternalStore(subscribe, readConsent, () => undefined);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    if (consent !== "accepted") {
      if (consent !== undefined) stopTracking();
      return;
    }
    if (canTrack(location.hostname, process.env.NODE_ENV === "production", ANALYTICS_ENABLED, GA_ID)) {
      analytics().start();
    }
  }, [consent]);

  if (consent === undefined) return null;

  const buttonClass = "border border-white/50 px-4 py-2 text-sm font-bold focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#FF729F]";

  return (
    <>
      {(consent === null || settingsOpen) && (
        <section aria-label="Analytics cookie preferences" className="fixed inset-x-3 bottom-14 z-[100] mx-auto max-w-2xl border border-white/20 bg-[#1C1C1C] p-5 text-white shadow-xl sm:inset-x-6">
          <h2 className="text-lg font-bold">Your cookie preferences</h2>
          <p className="mt-2 text-sm leading-6 text-white/80">
            With your permission, we use Google Analytics cookies to understand which pages people visit and improve Fast Girls Club.
            You can reject analytics and still use the whole site. We remember your choice for six months.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button type="button" className={buttonClass} onClick={() => { saveConsent("accepted"); setSettingsOpen(false); }}>Accept analytics</button>
            <button type="button" className={buttonClass} onClick={() => { saveConsent("rejected"); setSettingsOpen(false); }}>Reject analytics</button>
            {consent !== null && <button type="button" className={buttonClass} onClick={() => setSettingsOpen(false)}>Close</button>}
          </div>
        </section>
      )}
      <button type="button" aria-label="Cookie settings" title="Cookie settings" onClick={() => setSettingsOpen(true)} className="fixed bottom-3 right-3 z-[100] flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-[#1C1C1C] text-xl text-white shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF729F]">
        <span aria-hidden="true">🍪</span>
      </button>
    </>
  );
}
