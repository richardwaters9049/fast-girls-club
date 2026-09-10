<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

---

# Fast Girls Club — AI Development Rules

## 1. Project Identity

This repository is the **Fast Girls Club** website, being rebuilt from an existing WordPress site into a modern Next.js application.

The website combines:

- Women's motorsport editorial content
- Formula 1 data
- Live F1 timing
- Driver standings
- Constructor standings
- Editorial stories
- A visually rich F1 hero experience
- Future motorsport-focused features

The goal is **not** to create a generic Formula 1 dashboard.

The site should retain the identity of Fast Girls Club while adding technically credible F1 functionality.

---

## 2. Technology Stack

The current application uses:

- Next.js 16
- Next.js App Router
- React 19
- TypeScript
- Tailwind CSS v4
- Framer Motion
- Bun
- React Three Fiber
- Three.js
- Node.js
- WebSocket (`ws`)
- Formula 1 SignalR live timing
- `f1api.dev` for championship/race data

Use the existing stack unless there is a clear technical reason to change it.

Do not introduce a new framework, styling system or state-management library simply because another solution is available.

---

## 3. Next.js Version

This project uses a current Next.js release.

Before changing Next.js-specific code:

1. Check the installed version.
2. Read the relevant documentation in:

```text
node_modules/next/dist/docs/
```

3. Follow current Next.js conventions.
4. Do not rely on assumptions from older Next.js versions.

The generated Next.js agent rules at the top of this file must remain intact.

---

## 4. Visual Identity

The existing visual design is intentional.

Do **not** redesign the global styling system without an explicit request.

The approved Fast Girls Club palette is:

```text
Pink       #FF729F
Orange     #EE8434
Black      #1C1C1C
Off-white  #E6E6E6
Grey       #747578
White      #FFFFFF
```

Existing gradients include:

```text
pink → orange
orange → pink
dark → pink
pink → dark
editorial dark gradient
```

Use the existing CSS variables and Tailwind theme.

The visual direction should remain:

- Stylish
- Modern
- Editorial
- Motorsport-focused
- Technical
- Restrained
- High contrast
- Confident

Avoid:

- Generic SaaS dashboards
- Excessive cards
- Excessive decorative blobs
- Overuse of gradients
- Pulse-heavy animation
- Unnecessary motion
- Visual clutter
- Over-designed interfaces
- Generic AI-generated aesthetics

The site should feel like a **motorsport publication with technology built into it**, not a software dashboard wearing a racing theme.

---

## 5. Global CSS

`app/globals.css` is already established and approved.

Do not modify it simply to solve a component-level styling problem.

Prefer Tailwind classes and existing CSS variables at component level.

Only change global CSS when the developer explicitly requests a global styling change or when a genuine application-wide requirement makes it necessary.

---

## 6. Animation

The project uses Framer Motion.

Animation should be:

- Simple
- Fast
- Purposeful
- Stylish

Preferred patterns include:

- Page-load slide-ins
- Subtle fade-ins
- Directional entrance animations
- Small hover transitions

Avoid:

- Constant pulsing
- Excessive bouncing
- Distracting looping animations
- Animation that interferes with usability

Animation should enhance the editorial experience rather than become the feature.

---

## 7. Responsive Design

The website must work across:

- Mobile
- Tablet
- Desktop
- Large desktop displays

Do not rely on fixed heights to create layouts.

In particular, avoid unnecessary:

```text
min-h-full
min-h-screen
```

when natural document flow, padding, margins, grid and gaps provide a better responsive solution.

Prefer:

```text
grid
flex
gap
padding
margin
max-width
responsive breakpoints
```

Use responsive Tailwind utilities rather than creating separate desktop and mobile implementations unless genuinely necessary.

---

## 8. Component Architecture

Components should have clear responsibilities.

Current areas include:

```text
components/
├── 3d/
├── blog/
├── f1/
├── layout/
├── motorsport/
├── stories/
└── ui/
```

For F1 functionality:

```text
components/f1/
├── ConstructorStandings.tsx
├── DriverStandings.tsx
├── F1DataHub.tsx
└── LiveTiming.tsx
```

Keep components focused.

For example:

- `F1DataHub` manages the data hub tabs and overall state.
- `LiveTiming` presents live session/timing information.
- `DriverStandings` presents the drivers' championship.
- `ConstructorStandings` presents the constructors' championship.

Do not duplicate existing components when an existing component can be reused.

---

## 9. F1 Data Architecture

Keep external data processing separate from presentation.

Preferred architecture:

```text
External F1 provider
        ↓
Data/service layer
        ↓
Next.js API route
        ↓
React component
```

Do not place third-party API transformation logic directly inside presentation components.

Current data sources:

### Championship and race data

`f1api.dev`

Used for:

- Race information
- Completed races
- Driver championship calculations
- Constructor championship calculations

### Live timing

Formula 1 SignalR live timing.

Used for:

- Current session
- Drivers
- Timing
- Gaps
- Fastest laps
- Lap count
- Track status
- Session information

---

## 10. Live Timing Service

The project contains a dedicated local live timing service:

```text
services/f1-live/
├── index.ts
├── signalr.ts
└── types.ts
```

The service maintains a persistent connection to Formula 1's live timing SignalR system.

It exposes:

```text
GET /health
GET /api/live
WebSocket /ws
```

The service handles:

- SignalR negotiation
- WebSocket connection
- Topic subscriptions
- Driver state
- Timing state
- Session state
- Lap information
- Track status
- Reconnection
- Broadcasting live state

Do not treat live timing as ordinary cached API data.

The existing browser implementation currently polls the Next.js live API. The service's WebSocket architecture should eventually allow the browser to consume live updates directly rather than relying on repeated HTTP polling.

---

## 11. F1 Data Correctness

Never invent Formula 1 data.

External APIs and live feeds can contain:

- Missing values
- Optional fields
- Inconsistent timing states
- Delayed information
- Different representations of the same value

Parse external data defensively.

When a provider does not supply a value, use the existing nullable or empty representation.

Do not fabricate:

- Driver information
- Team information
- Nationality
- Session status
- Timing gaps
- Championship points

---

## 12. Championship Calculations

The current championship implementation derives standings from completed race results.

The calculation:

1. Retrieves completed races.
2. Retrieves results for each race.
3. Accumulates driver points.
4. Accumulates constructor points.
5. Tracks race wins.
6. Sorts championship positions.
7. Returns the calculated standings.

Be particularly careful around race day.

A race that has technically started but does not yet have complete results must not accidentally be treated as a completed championship event.

---

## 13. TypeScript

Use the existing type definitions.

Main application F1 types:

```text
lib/f1/types.ts
```

Live service types:

```text
services/f1-live/types.ts
```

Avoid `any`.

External untrusted data should be handled at the service/API boundary and converted into known application types before reaching presentation components.

Prefer explicit interfaces and type-safe transformations.

---

## 14. API Routes

Current F1 API routes:

```text
/api/f1/live
/api/f1/drivers
/api/f1/constructors
```

These routes act as the application boundary between external/backend data and the frontend.

API routes should:

- Validate external responses
- Return predictable structures
- Handle failures gracefully
- Avoid leaking implementation details
- Use appropriate HTTP status codes
- Avoid unnecessary caching for genuinely live information

---

## 15. Error and Loading States

F1 data is external and can fail.

Every data-driven component should have sensible:

- Loading state
- Error state
- Empty state

The interface should remain usable when data is unavailable.

Do not let a failed F1 API request break the entire page.

---

## 16. Project Images and Assets

Existing F1 assets are stored under:

```text
public/images/F1-images/
```

The project also contains a Formula 1 3D model under:

```text
public/images/3Dimages/
```

The existing 3D hero experience should be preserved and improved incrementally rather than replaced without a reason.

---

## 17. Development Workflow

Make focused changes.

When implementing a feature:

1. Understand the existing architecture.
2. Identify the smallest set of files that need changing.
3. Make the change.
4. Test it.
5. Check responsive behaviour.
6. Run the production build.

The standard production verification command is:

```bash
bun run build
```

Do not refactor unrelated code while implementing a feature.

---

## 18. Existing Build Requirement

The project has previously reached a successful production build.

A healthy build should finish with:

```text
✓ Compiled successfully
✓ Finished TypeScript
✓ Collecting page data
✓ Generating static pages
✓ Finalizing page optimization
```

Avoid introducing changes that create unnecessary build-time complexity.

---

## 19. AI Development Behaviour

When working on this project, an AI coding assistant should:

- Read the existing code before proposing replacements.
- Preserve approved styling.
- Reuse existing components.
- Make incremental changes.
- Avoid unnecessary dependencies.
- Keep TypeScript strict and readable.
- Keep data transformation outside presentation components.
- Treat external F1 data as untrusted input.
- Preserve responsive behaviour.
- Test changes rather than assuming they work.
- Avoid unrelated refactoring.
- Explain architectural changes clearly.

Do not rewrite an entire component when a small targeted change is sufficient.

---

## 20. File Requests

When asking the developer to provide project files, give exact commands.

For a single file:

```bash
cpfile path/to/file
```

For multiple files:

```bash
cpc path/to/file1 path/to/file2
```

Do not vaguely ask the developer to "send the relevant files".

State exactly which files are required.

---

## 21. Communication

When explaining completed development work, keep the response practical.

Prefer:

```text
What changed
Why
How to test it
Any limitation
```

Avoid long explanations when a concise technical explanation is sufficient.

---

## 22. Git

Use the project's established commit convention:

```text
Type/Area: Description
```

Examples:

```text
Feat/F1: Add live timing data hub
Feat/Frontend: Add responsive F1 standings
Fix/F1: Correct live session state
Chore/Frontend: Improve F1 data loading states
```

Commit messages should describe the actual change.

---

## 23. Important Project Decisions

These decisions should not be casually reversed:

### The visual system is approved

Do not replace the existing Fast Girls Club styling.

### Tailwind is the styling system

Do not introduce another styling approach without a clear reason.

### Bun is the preferred package manager

Use Bun for normal project commands.

### F1 functionality is part of the editorial site

Do not turn the website into a generic sports dashboard.

### Live timing is a separate service

Do not move the entire SignalR connection into a normal browser component without understanding the existing service architecture.

### Data transformation belongs outside UI components

Keep external API details out of presentation code.

### Incremental development is preferred

Improve the existing application rather than repeatedly rebuilding it from scratch.

---

## 24. Overall Design Principle

Fast Girls Club should sit between:

**Women's motorsport editorial**

and

**serious F1 technology.**

The result should feel fast, confident, modern and technically credible without becoming visually noisy.

Every new feature should ask:

> Does this make Fast Girls Club better?

If the answer is yes, build it.

If it only makes the code more complicated or the interface more impressive for its own sake, reconsider it.
