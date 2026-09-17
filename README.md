# Fast Girls Club

Fast Girls Club is a modern Next.js rebuild of an existing WordPress motorsport publication focused on women in motorsport and Formula 1.

The project combines an editorial-style website with a serious F1 data experience. It is designed to keep the personality and visual identity of the original Fast Girls Club site while providing a modern, maintainable technical foundation for live data, championship information, race weekends and interactive 3D content.

## What the project does

Fast Girls Club brings together several areas of the site:

- **Editorial content** for stories, news and features about women in motorsport.
- **Formula 1 championship data** including driver and constructor standings.
- **Race weekend information** including schedules, previous and next races, circuit information and completed results.
- **Live timing** powered by a dedicated F1 live timing service connected to Formula 1's live timing infrastructure.
- **Interactive 3D content** including a Formula 1 hero experience and circuit visualisation.
- **Responsive layouts** designed for desktop, tablet and mobile screens.

The F1 experience is intentionally part of the Fast Girls Club publication rather than being presented as a separate generic dashboard.

## Technology

- **Next.js 16** with the App Router
- **React 19**
- **TypeScript**
- **Tailwind CSS v4**
- **Framer Motion**
- **Bun**
- **React Three Fiber / Three.js**
- **Node.js**
- **WebSocket (`ws`)**
- **f1api.dev** for F1 championship, calendar and race data
- **Formula 1 SignalR live timing** for real-time session data

## Architecture

The application separates presentation, F1 data access and live timing into clear layers.

### Next.js application

The Next.js application handles the website, page structure, UI components, responsive layouts and the F1 dashboard.

F1 information is exposed to the frontend through internal server-side API routes. Presentation components consume these application endpoints rather than calling external F1 services directly.

### F1 data layer

The `lib/f1` layer contains the application's F1 types, adapters, calendar data and supporting data functionality.

It handles:

- Current season and calendar information
- Race and circuit information
- Completed race results
- Driver championship data
- Constructor championship data
- F1 data normalisation
- Dashboard-facing race and series models

The application uses real external data and keeps the frontend model separate from provider-specific response shapes.

### F1 service

A separate F1 service sits behind the Next.js API layer and provides HTTP access to championship, race and live data.

It handles upstream F1 API requests, normalisation, caching and live timing state. The service exposes HTTP endpoints for application data and WebSocket support for live updates.

### Live timing service

Live timing connects to Formula 1's SignalR infrastructure and translates the incoming state into a simpler application model.

The service currently handles data including:

- Driver lists
- Driver positions
- Timing information
- Gaps and intervals
- Fastest laps
- Session information
- Lap counts
- Track status
- Race control information
- Driver and team metadata

The current Next.js dashboard consumes live timing through `/api/f1/live` and polls every five seconds while the F1 live dashboard is active. The underlying WebSocket infrastructure is already in place for a future browser-side live update path.

## F1 dashboard

The F1 dashboard is the main interactive F1 feature within the website.

It currently provides six dashboard views:

### Overview

Provides a high-level view of the current F1 season including:

- Season progress
- Completed and remaining rounds
- Current live session status
- Current or next race
- Navigation into the race experience

### Race

The race view provides a detailed race weekend experience using real calendar and race data.

It currently includes:

- Current, previous and next race context
- Race weekend schedule
- Circuit information
- Circuit statistics
- Completed race results where available
- Upcoming race information
- Interactive 3D circuit visualisation
- Race status handling for completed, live and upcoming events

The dashboard uses the season calendar to determine the active race instead of inventing placeholder race data.

### Live

Displays the current or most recent F1 session and live timing information.

Where live data is available, the interface can display:

- Driver position
- Driver name and acronym
- Team
- Gap to leader
- Interval
- Fastest lap
- Driver nationality
- Driver headshot when available
- Team colour
- Session information
- Lap and track state information

Live data is intentionally not cached like static championship data because freshness is more important for this view.

### Drivers

Displays the current 2026 driver championship standings with:

- Championship position
- Driver number
- Driver name and acronym
- Nationality and country flag
- Team
- Championship points
- Team colour
- Responsive pagination

Driver metadata is joined from the complete F1 driver dataset with the current championship standings so the UI receives a clean, stable response shape.

### Teams

Displays the current constructor championship standings with:

- Championship position
- Team name
- Championship points
- Team colour
- Responsive layout

Drivers and Teams use one shared mounted championship panel so switching between the two views does not repeatedly remount and refetch the same data.

### Calendar

Displays the current season calendar with race status information and responsive race cards.

## API routes

The Next.js application exposes a small internal API layer for F1 functionality:

| Route                          | Purpose                                               |
| ------------------------------ | ----------------------------------------------------- |
| `/api/f1/live`                 | Returns the current live timing state                 |
| `/api/f1/calendar`             | Returns the current season calendar                   |
| `/api/f1/race/[round]`         | Returns normalised race information for a round       |
| `/api/f1/race/[round]/results` | Returns completed race results for a round            |
| `/api/f1/drivers`              | Returns normalised driver championship standings      |
| `/api/f1/constructors`         | Returns normalised constructor championship standings |

Keeping these endpoints inside the Next.js application provides a consistent data boundary and keeps external provider response formats away from presentation components.

## Caching and performance

Caching is used throughout the F1 data layer to reduce unnecessary upstream requests while keeping time-sensitive information fresh.

### Next.js API caching

| Data                           | Cache behaviour                                      |
| ------------------------------ | ---------------------------------------------------- |
| Season calendar                | 6 hours with stale-while-revalidate                  |
| Individual race data           | 30 minutes with stale-while-revalidate               |
| Completed race results         | 12 hours with stale-while-revalidate                 |
| Empty or upcoming race results | 60 seconds                                           |
| Driver standings               | 30 minutes with stale-while-revalidate               |
| Constructor standings          | 30 minutes with stale-while-revalidate               |
| Live timing                    | No-store; refreshed every 5 seconds by the dashboard |

Completed race results can be cached for much longer because they do not change once the race is finished. Upcoming result endpoints use a short cache so an empty response cannot remain stale for an extended period.

### F1 service caching

The underlying F1 service also maintains short-lived in-memory caches for frequently used datasets. Current cache durations include:

| Dataset                | Cache duration |
| ---------------------- | -------------- |
| Drivers                | 30 minutes     |
| Constructors           | 30 minutes     |
| Race calendar          | 5 minutes      |
| Individual race data   | 10 minutes     |
| Championship standings | 60 seconds     |
| Race results           | 10 minutes     |

This two-level approach keeps the frontend responsive while avoiding unnecessary repeated requests to upstream F1 providers.

### Client-side state retention

The dashboard keeps its major panels mounted and switches visibility using layered panel containers rather than unmounting the inactive panel.

This means switching between Overview, Race, Live, Drivers, Teams and Calendar can preserve component state and avoids needless refetching or remounting.

## Design system

The visual identity is based on the existing Fast Girls Club WordPress site rather than introducing an unrelated design system.

### Colour palette

| Colour    | Hex       |
| --------- | --------- |
| Pink      | `#FF729F` |
| Orange    | `#EE8434` |
| Black     | `#1C1C1C` |
| Off-white | `#E6E6E6` |
| Grey      | `#747578` |
| White     | `#FFFFFF` |

Pink and orange are the primary accent colours, with gradients adding depth while keeping the interface dark and editorial.

The existing global CSS contains the project's approved design tokens and gradients. These should be treated as established visual identity rather than replaced with generic Tailwind colours.

## Design philosophy

The website should feel like a **modern motorsport publication with serious technology underneath it**.

The visual direction is:

- Dark
- Editorial
- Confident
- Technical
- Modern
- Restrained
- Image-led

The interface should avoid looking like a conventional SaaS dashboard. F1 data should feel integrated into the publication rather than bolted on as a separate application.

## 3D experience

The site includes interactive Formula 1 3D experiences using React Three Fiber and Three.js.

The project currently includes:

- A Formula 1 3D hero experience
- 3D race circuit visualisation within the race dashboard
- Circuit-specific map selection based on race data

The 3D layer is intended to add depth and personality without overwhelming the editorial content or making the interface feel like a game.

## Current status

The project has moved beyond the initial proof-of-concept stage and now has a working F1 data dashboard with real API data, caching and persistent dashboard state.

### Completed

- Next.js application structure
- Responsive Fast Girls Club homepage
- Fast Girls Club visual identity
- Reusable UI component system
- F1 dashboard structure
- Overview dashboard
- Race weekend experience
- F1 season calendar integration
- Real driver championship standings
- Real constructor championship standings
- Previous and next race handling
- Completed race result integration
- Circuit information and statistics
- Interactive 3D circuit visualisation
- Interactive 3D Formula 1 hero experience
- Dedicated live timing service
- Formula 1 SignalR connection
- Live timing HTTP API
- Live timing WebSocket infrastructure
- Loading, error and empty states
- Server-side API caching
- Client-side dashboard state retention

### Current dashboard state

The main F1 dashboard is currently organised around:

`Overview → Race → Live → Drivers → Teams → Calendar`

F1 is the active fully populated series. The dashboard structure also supports F2 and F3 series selection, ready for those datasets to be integrated later.

The current championship experience uses real 2026 data. The interface does not intentionally invent missing championship, race or live values and instead uses appropriate loading, error or empty states where data is unavailable.

## Roadmap

### Phase 1 — Foundation

- Complete the WordPress-to-Next.js visual rebuild
- Establish the reusable component system
- Integrate the Fast Girls Club visual identity
- Establish the F1 data layer

**Status: Completed**

### Phase 2 — Live F1 experience

- Improve live session detection
- Persist and expose session status
- Improve lap and track status presentation
- Expose richer driver state such as pit and stopped status
- Move browser live updates from five-second HTTP polling towards the existing WebSocket infrastructure
- Improve live timing resilience and reconnect handling

**Status: In progress**

### Phase 3 — Championship experience

- Improve driver and constructor metadata
- Add richer race history
- Add race-by-race championship progression
- Improve championship visualisation
- Add deeper driver and team detail views
- Expand the data available in the race experience

**Status: Core experience complete, enhancements in progress**

### Phase 4 — Editorial integration

- Connect real editorial content
- Build article and story pages
- Connect related stories to F1 events and sessions
- Integrate F1 data naturally into editorial content

**Status: Planned**

### Phase 5 — Production

- Production deployment
- Live service hosting
- Performance optimisation
- Monitoring and reliability improvements
- Final responsive and accessibility pass

**Status: Planned**

## Development

Install dependencies with:

```bash
bun install
```

Start the Next.js development server with:

```bash
bun dev
```

The dedicated F1/live timing service is run separately during development.

Before considering a change complete, run:

```bash
bun run build
```

The production build should complete successfully with no TypeScript or Next.js compilation errors.

## Development principles

The project should remain simple to understand and maintain.

### Reuse components

Common UI patterns should be implemented as reusable components rather than repeatedly recreated inside pages.

### Keep responsibilities separate

Presentation components should not contain unnecessary API, database or external-service logic.

F1 fetching, normalisation, caching and calculations belong in the appropriate data layer or API boundary.

### Protect data correctness

F1 information should never be invented or silently guessed. If external data is unavailable, the UI should communicate that clearly through an appropriate loading, error or empty state.

### Cache according to data freshness

Static or completed F1 information should be cached aggressively enough to reduce upstream traffic, while live session information should remain fresh.

### Preserve the brand

New functionality should complement the Fast Girls Club identity. Technical features should not turn the website into a generic motorsport dashboard.

### Keep the interface responsive

Layouts should use natural document flow, grid, flexbox, spacing and responsive breakpoints. Avoid unnecessary fixed-height layouts that create problems on smaller screens.

## Project philosophy

Fast Girls Club is being built to demonstrate that a motorsport publication can combine strong editorial design with genuinely useful technology.

The end result should feel fast, confident and distinctive while remaining technically sound underneath the surface.
