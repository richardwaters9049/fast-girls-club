# Fast Girls Club

Fast Girls Club is a modern Next.js rebuild of an existing WordPress motorsport publication, created around women in motorsport and Formula 1.

The project combines an editorial-style website with a serious F1 data experience, including championship standings, race information and live timing. The goal is to preserve the personality and visual identity of the original Fast Girls Club site while giving it a modern, maintainable technical foundation.

## What the project does

Fast Girls Club brings together two sides of the website:

- **Editorial content** for stories, news and features about women in motorsport.
- **Formula 1 data** including driver standings, constructor standings and live session information.
- **Live timing** powered by a dedicated Node.js service connected to Formula 1's live timing infrastructure.
- **Interactive 3D content** used as part of the visual experience.
- **Responsive layouts** designed for desktop, tablet and mobile screens.

This is intentionally more than a generic F1 dashboard. The data experience sits inside an editorial motorsport brand.

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
- **f1api.dev** for championship and race data
- **Formula 1 SignalR live timing** for real-time session data

## Architecture

The application is split into a few clear responsibilities.

### Next.js application

The main Next.js application handles the website, editorial content, UI components and F1 data presentation.

F1 data is accessed through server-side API routes rather than having individual UI components communicate directly with external F1 APIs.

### F1 data layer

The `lib/f1` layer provides the application's F1 data functionality.

It handles:

- Current season information
- Race information
- Completed race results
- Driver championship calculations
- Constructor championship calculations
- F1 data normalisation

Championship standings are calculated from completed race results rather than relying on a static table. Results are cached to avoid repeatedly requesting the same data.

### Live timing service

Live timing is handled by a separate Node.js service.

The service connects to Formula 1's live timing SignalR endpoint and translates the incoming data into a simpler application state that the Next.js application can consume.

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
- Driver/team metadata

The service also exposes an HTTP API and WebSocket endpoint for consuming live state.

## F1 Data Hub

The F1 Data Hub is the main interactive F1 feature within the website.

It provides three primary views:

### Live

Displays the current or most recent F1 session, including session information and driver timing.

Where live data is available, the interface can display:

- Driver position
- Driver name and acronym
- Team
- Gap to leader
- Interval
- Fastest lap
- Driver nationality
- Driver headshot
- Team colour
- Session information

### Drivers

Displays the current driver championship standings, calculated from completed race results.

The interface includes driver information alongside championship points and supporting metadata.

### Constructors

Displays the current constructor championship standings and accumulated points.

## API routes

The Next.js application exposes a small internal API layer for F1 functionality:

| Route                  | Purpose                                    |
| ---------------------- | ------------------------------------------ |
| `/api/f1/live`         | Returns the current live timing state      |
| `/api/f1/drivers`      | Returns driver championship standings      |
| `/api/f1/constructors` | Returns constructor championship standings |

Keeping these endpoints inside the application gives the UI a consistent data boundary and keeps external API details away from presentation components.

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

Pink and orange are used as the primary accent colours, with gradients providing additional depth while keeping the overall interface dark and editorial.

The existing global CSS contains the project's approved design tokens and gradients. These should be treated as part of the established visual identity rather than replaced with generic Tailwind colours.

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

The interface should avoid looking like a conventional SaaS dashboard. F1 data should feel like part of the publication rather than a separate application bolted onto it.

## 3D experience

The site includes an interactive Formula 1 3D experience using React Three Fiber and Three.js.

The project contains a Formula 1 model which is used as part of the hero experience. The 3D layer is intended to add depth and personality without overwhelming the editorial content.

## Development

Install dependencies with:

```bash
bun install
```

Start the Next.js development server with:

```bash
bun dev
```

The live timing service is run separately during development.

Before considering a change complete, the application should be checked with:

```bash
bun run build
```

The production build should complete successfully with no TypeScript or Next.js compilation errors.

## Current status

The project currently has the core website and F1 data foundations in place.

Completed foundations include:

- Next.js application structure
- Responsive editorial homepage
- Fast Girls Club visual identity
- F1 Data Hub
- Driver championship standings
- Constructor championship standings
- F1 race data integration
- Dedicated live timing service
- Formula 1 SignalR connection
- Live timing API endpoint
- WebSocket support in the live service
- Interactive Formula 1 3D hero experience
- Loading, error and empty states for F1 data

## Roadmap

### Phase 1 — Foundation

- Complete the WordPress-to-Next.js visual rebuild
- Establish the reusable component system
- Integrate the existing Fast Girls Club visual identity
- Establish the F1 data layer

**Status: Completed**

### Phase 2 — Live F1 experience

- Improve live session detection
- Persist and expose session status
- Improve lap and track status presentation
- Expose richer driver state such as pit and stopped status
- Move browser live updates towards the existing WebSocket infrastructure

**Status: In progress**

### Phase 3 — Championship experience

- Improve driver and constructor metadata
- Add richer race history
- Add race-by-race championship progression
- Improve championship visualisation

### Phase 4 — Editorial integration

- Connect real editorial content
- Build article and story pages
- Connect related stories to F1 events and sessions
- Integrate F1 data naturally into editorial content

### Phase 5 — Production

- Production deployment
- Live service hosting
- Performance optimisation
- Monitoring and reliability improvements
- Final responsive and accessibility pass

## Development principles

The project should remain simple to understand and maintain.

### Reuse components

Common UI patterns should be implemented as reusable components rather than repeatedly recreated inside pages.

### Keep responsibilities separate

Presentation components should not contain unnecessary API, database or external-service logic.

F1 data fetching, normalisation and calculations belong in the appropriate data layer or API boundary.

### Protect data correctness

F1 information should never be invented or silently guessed. If external data is unavailable, the UI should communicate that clearly through an appropriate loading, error or empty state.

### Preserve the brand

New functionality should complement the Fast Girls Club identity. Adding technical features should not turn the website into a generic motorsport dashboard.

### Keep the interface responsive

Layouts should use natural document flow, grid, flexbox, spacing and responsive breakpoints. Avoid unnecessary fixed-height layouts that create problems on smaller screens.

## Project philosophy

Fast Girls Club is being built to demonstrate that a motorsport publication can combine strong editorial design with genuinely useful technology.

The end result should feel fast, confident and distinctive while remaining technically sound underneath the surface.
