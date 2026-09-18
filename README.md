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
  api/blog/latest/         Homepage editorial feed
  api/f1/                  F1 server-side boundary
  blog/                    Editorial dashboard and articles
  f1/                      The Grid
components/
  3d/                      Car and circuit scenes
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
