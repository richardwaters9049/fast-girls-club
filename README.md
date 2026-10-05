# Fast Girls Club

Fast Girls Club is a Next.js motorsport publication focused on women in motorsport. It combines WordPress editorial content with a Formula 1 dashboard, live timing and interactive 3D presentation.

## Technology

- Next.js 16 App Router and React 19
- TypeScript and Tailwind CSS v4
- Bun
- Framer Motion
- React Three Fiber and Three.js
- WordPress REST API for editorial content
- The sibling `f1-api` service for Formula 1 data

## Application areas

### Homepage

The homepage combines the latest WordPress stories with an interactive React Three Fiber hero, an image-led route into The Grid and branded editorial sections. On desktop, the 3D car can be rotated with the mouse and follows a scroll-driven exit and return sequence. Touch interaction remains reserved for normal page scrolling.

Homepage motion honours `prefers-reduced-motion`. Story-card entrances run once to avoid flicker, while deliberately directional sections may respond to both entry and exit.

### Editorial

The homepage displays the latest published WordPress stories. `/blog` provides searching, category/date filters, sorting and pagination, while `/blog/[slug]` renders the article body and WordPress media.

WordPress requests are made on the server through `lib/wordpress/client.ts`. The public `/api/blog/latest` endpoint exists only to supply the client-rendered homepage section.

### The Grid

`/f1` is the active Formula 1 dashboard. It includes:

- season overview;
- current, previous and next race context;
- live timing;
- driver and constructor standings;
- the race calendar;
- available circuit maps and the 3D car experience.

F2 and F3 are deliberately marked as unavailable until genuine data is connected. Missing results or circuit maps are shown as unavailable and are never replaced with invented values.

### About

`/about` presents the Fast Girls Club mission, editorial point of view and working brand values. Its current narrative copy is suitable placeholder content and should be reviewed before a final production launch.

## Data architecture

```text
WordPress REST API ──→ lib/wordpress ──→ pages / internal latest-post route

f1-api ──→ Next.js /api/f1/* routes ──→ F1 dashboard components
```

The Next.js application has one F1 backend setting: `F1_API_BASE_URL`. It should include the backend's `/api` prefix. The default local value is `http://127.0.0.1:8787/api`.

The internal routes are:

| Route | Purpose |
| --- | --- |
| `/api/f1/live` | Normalised live or most-recent timing state |
| `/api/f1/calendar` | Current season calendar |
| `/api/f1/race/[round]` | Normalised race detail |
| `/api/f1/race/[round]/results` | Results using the season reported by the race API |
| `/api/f1/drivers` | Driver standings joined with driver metadata |
| `/api/f1/constructors` | Constructor standings |

Static data uses server-side revalidation. Live data is not cached; the dashboard polls every five seconds on the Live panel or while a session is live, and every thirty seconds otherwise.

## Configuration

Copy `.env.example` to `.env.local` and adjust values when necessary:

```dotenv
NEXT_PUBLIC_SITE_URL=http://localhost:3000
WORDPRESS_API_URL=https://fastgirlsclub.co.uk/wp-json/wp/v2
F1_API_BASE_URL=http://127.0.0.1:8787/api
```

`NEXT_PUBLIC_SITE_URL` is used for canonical URLs, Open Graph metadata, the sitemap and robots configuration.

## Development

Install dependencies and start Next.js:

```bash
bun install
bun run dev
```

Run the sibling `f1-api` project separately on port `8787` when working on The Grid.

Before merging a change, run:

```bash
bun run test
bun run lint
bun run typecheck
bun run build
```

## Project structure

```text
app/
  about/                   Brand story and values
  api/blog/latest/         Homepage editorial feed
  api/f1/                  F1 server-side boundary
  blog/                    Editorial dashboard and articles
  f1/                      The Grid
components/
  3d/                      Interactive hero car and circuit scenes
  blog/                    Editorial cards, filters and pagination
  f1/                      Timing, standings and dashboard panels
  layout/                  Shared site navigation and footer
lib/
  f1/                      F1 models, country/circuit helpers and race selection
  wordpress/               WordPress client, mapping and text utilities
public/                     Runtime assets only
```

## Working principles

- Do not fabricate motorsport data. Use clear loading, error or unavailable states.
- Keep provider response handling at the server/API boundary.
- Keep shared navigation and editorial presentation consistent across routes.
- Cache according to freshness: completed/static data can be cached; live data cannot.
- Preserve the established Fast Girls Club palette and editorial character.

## Editorial migration — 4 October 2026

The CMS REST origin is `https://cms.fastgirlsclub.co.uk/wp-json/wp/v2`.
The root route renders `app/homepage.tsx`. Set `NEXT_PUBLIC_SITE_URL` to the
public Next.js origin in production; localhost is intended for development.

The sitemap includes About and paginates published articles in batches of 100.
CMS failures propagate rather than returning a successful, incomplete sitemap.
Article canonical and Open Graph URLs use the slug returned by WordPress.

`next.config.ts` maps the four published dated article paths verified on
4 October to their corresponding `/blog/{slug}` paths using permanent redirects.
Keep this map when articles are renamed; add verified historical paths as needed.
These redirects only handle requests reaching Next.js. Redirecting public CMS
article pages still requires WordPress/Pressable configuration after the public
Next.js site is available. Admin, REST, media and editorial previews must remain
accessible. No production CMS or DNS changes were made.

## Google Analytics and consent

GA4 measurement ID: `G-76CV16SY23`. The root layout mounts
`components/AnalyticsConsent.tsx`. Visitors can accept or reject analytics,
then change their choice using the persistent Cookie settings button.
No Google tag is loaded before consent. Preferences last six months.
Withdrawal disables analytics, clears GA cookies and reloads the page to remove
the loaded tag and its listeners. If storage is blocked, choices last only for
the current page.

Tracking is restricted to production builds on `fastgirlsclub.co.uk` and
`www.fastgirlsclub.co.uk`. Localhost, preview hosts and the CMS are excluded.
The banner remains visible locally for UI review. No advertising consent is
granted; Google signals and advertising personalisation are disabled.

Page views use GA4's automatic strategy. The code configures the tag once after
consent and permits its initial page view. It sends no manual page-view events
and has no route-change tracking hook. Enhanced measurement must have
**Page changes based on browser history events** enabled in the GA4 web stream
for client navigation and browser back/forward tracking. Account access is
currently unavailable, so that setting and actual event delivery are unverified.
Do not follow the earlier instruction to disable Enhanced measurement.

Production configuration:
1. Set `NEXT_PUBLIC_GA_MEASUREMENT_ID=G-76CV16SY23` and
   `NEXT_PUBLIC_ANALYTICS_ENABLED=true` in the production build environment,
   then rebuild. Local and example configuration keep it false.
2. When account access is available, verify the automatic history setting and
   event counts in Realtime/DebugView, including initial load and back/forward.
3. Verify browser consent, rejection, reload and withdrawal before launch.

Automatic collection uses Google's URL, title and referrer handling. The former
manual query-string removal no longer applies: URL queries, including blog
searches, may be collected. Review the stream's query-parameter redaction and
site-search settings when account access returns, and keep personal data out of
URLs. No custom user IDs or personal-data events are supplied by this code.
The site's privacy information should describe its use of Google Analytics.

The Next.js source and publicly fetched CMS/root HTML contained no existing
Google tags during inspection on 4 October. This does not establish WordPress
plugin settings or the GA4 stream configuration; check those before launch.

References:
- https://developers.google.com/analytics/devguides/collection/ga4/views
- https://developers.google.com/tag-platform/security/guides/consent

## WordPress redirect plugin

The optional [CMS redirect plugin](deploy/wordpress/README.md) is packaged at
`deploy/wordpress/fgc-headless.zip`. It defaults to Off and provides temporary
Test and permanent Live modes. It is prepared locally, not installed on the CMS.
Read its launch checks and rollback instructions before enabling it.

## The Grid contract and freshness — 5 October 2026

Race results now read nested driver/constructor identities from the sibling API.
The backend fastest-lap string is exposed in the frontend's fastestLap.time
shape. Retirement text is preserved as retired and status. Unsupported laps and
milliseconds remain null; missing fields no longer disappear during JSON
serialisation. Both season and round must match. Successful results have a
60-second CDN lifetime instead of twelve hours; backend caching still applies.

Live responses explicitly use Cache-Control: no-store. A live label requires
a connected feed, Started status, a valid session window and a feed update
within two minutes (up to 30 seconds of future clock skew is tolerated).
The scheduled end has a 30-minute grace period. Local SignalR dates use the
supplied GmtOffset; ambiguous dates without a timezone cannot establish live
status. These conservative bounds may hide a live label during a prolonged
feed silence or a heavily delayed session rather than present stale data as live.

Polling failures clear timing data and its live label. A five-second browser
timer also expires a retained live label. Requests do not overlap within the
active polling effect; obsolete responses after an effect change are ignored.
An inactive/expired snapshot may still be shown as non-live when available.

Tests cover the nested results contract, explicit nulls, retirement, timezones,
future/historical sessions and stale/missing updates. Active-race browser
behaviour and actual disconnect/reconnect scenarios still need verification.

## Polling and article presentation — 5 October 2026

The visible Grid checks inactive timing every two minutes. During a live session,
the Live tab checks every ten seconds and other Grid panels every minute.
Polling pauses in hidden/offline tabs and resumes with a request on return.
Retries back off to five minutes; requests are sequential and aborted on cleanup.
Initial Grid loading still makes one timing request. Browser freshness checks
run locally every five seconds and do not make network requests.

Steady-state idle Live-tab polling is reduced from 720 to 30 requests per hour
per visible tab (excluding initial loads, focus/resume and retries). This is not
a shared cache: requests still scale with concurrent viewers. The F1 backend
maintains its existing shared SignalR connection; each browser poll reads that
state, rather than opening a separate upstream timing subscription.

Article content has scoped 0.025rem body letter spacing. YouTube and
YouTube-nocookie embeds fill the article column at a responsive 16:9 ratio,
overriding WordPress's fixed iframe dimensions. Global typography is unchanged.

## Championship driver portraits

The 2026 standings use verified local Formula 1 portraits when the live feed
has no headshots. Matching live headshots still take priority. The local assets
are matched by driver code and restricted to their verified season; unknown
drivers/seasons retain initials. Tall fallback portraits are cropped from the
top so the circular avatar shows the driver's face. Source URLs are recorded
in public/images/f1-drivers/2026/SOURCES.md. No extra timing polling is required.

## Latest published race results

The Race tab's previous-race card and the Live tab's Live / Previous race switch
share /api/f1/results/latest. This adapts the backend /api/results/current route,
which skips missing-result races on 404 but propagates upstream outages. The
selected result's season, round, name and date are displayed explicitly; it may
be older than the immediately preceding calendar event. Archived classification
is never converted into live timing data.

The Race tab shows the top three; Previous race in the Live tab shows the full
classification in a scrollable panel. Winner comes from position one. Laps and
fastest lap come only from matching-season, matching-round race metadata.
Missing metadata stays unavailable. Client requests are shared/cached for one
minute; there is no additional periodic results polling. Live polling uses the
slower background cadence while Previous race is selected.
