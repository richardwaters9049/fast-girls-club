# Fast Girls Club engineering note

**Date:** 18 September 2026

## Summary

This pass reduced technical debt without changing the established visual direction or the public data contract. It focused on correctness, one clear integration path for each data source, safer unavailable states, shared site navigation and a smaller production footprint.

## Changes completed

### Editorial and WordPress

- Connected the homepage's latest-story cards to published WordPress content through `/api/blog/latest`.
- Added shared site navigation and a footer to the homepage, news dashboard and article pages.
- Added a visible News link and a route back to the main site from The Grid.
- Corrected WordPress HTML entity decoding, including ellipses and numeric entities.
- Selected appropriately sized WordPress images for cards and article heroes to avoid unnecessary upscaling.
- Corrected article canonical and Open Graph URLs so they point to the Next.js article route rather than the legacy WordPress route.
- Redirected unknown categories to the unfiltered news dashboard.
- Redirected out-of-range page requests to the last valid page instead of returning a server error.
- Added blog loading, error and not-found states.

### Formula 1 data correctness

- Corrected active-race selection so countries with more than one race are matched by session date, circuit or location rather than the first country match.
- Ignored historical timing sessions when the backend reports that no session is live, allowing the next scheduled race to remain the dashboard focus.
- Added support for both two-letter and three-letter country codes so flags display consistently.
- Removed the Italian and Singapore circuit-map fallbacks. An unavailable map is now labelled honestly.
- Removed fabricated result positions when a provider omits a classification value.
- Removed hard-coded 2026 labels from the UI and results route; the season now comes from the backend response.
- Reduced background timing requests to thirty-second polling outside the Live panel when no live session is active. Live views retain five-second polling.
- Marked F2 and F3 as unavailable until genuine datasets are connected.

### Integration and configuration

- Consolidated four F1 backend environment names into `F1_API_BASE_URL`.
- Added `NEXT_PUBLIC_SITE_URL`, `WORDPRESS_API_URL` and `F1_API_BASE_URL` to `.env.example`.
- Updated the local environment to the consolidated F1 API setting and removed obsolete service settings.
- Added timeouts to upstream WordPress and F1 requests.
- Removed the duplicate embedded live-timing service; the sibling `f1-api` project is now the single F1 backend.
- Removed the additional direct external-driver request. Driver metadata and standings now come from the same backend.

### Structure, SEO and maintenance

- Added a metadata base, title template, Open Graph defaults, `robots.txt`, a WordPress-aware sitemap and F1 route metadata.
- Added regression tests for race selection, country codes and WordPress text handling.
- Added `test` and `typecheck` scripts.
- Replaced the stale README architecture and updated the contributor guidance to match the current project.
- Removed superseded F1 dashboard implementations, old provider helpers, unused generated UI modules and the obsolete WordPress helper.
- Preserved the empty component files that act as intentional future templates.
- Removed unused screenshots, logo variants, source 3D exports, starter SVGs and duplicate imagery from `public`. Runtime assets reduced from roughly 75 MB to 6.7 MB.
- Removed packages used only by deleted code and refreshed `bun.lock`.

## Verification

The following checks completed successfully:

```text
bun run test       7 tests passed
bun run lint       no errors or warnings
bun run typecheck  passed
bun run build      production build passed
```

A production server smoke test returned successful responses for the homepage, news dashboard, The Grid, all active internal APIs, `robots.txt` and `sitemap.xml`. Invalid category and excessive pagination requests resolved to valid news URLs.

## Recommended next steps

1. Add contract tests between `fastgirlclub` and the sibling `f1-api`, particularly for live timing and race results.
2. Add browser-level tests for news filtering, article navigation and the six Grid panels.
3. Decide whether F2 and F3 will receive real data in the next release; keep their controls disabled until then.
4. Add production observability for upstream timeouts, WordPress failures and F1 backend availability.
5. Review WordPress publishing permissions and sanitisation policy before allowing less-trusted authors or plugins to supply article HTML.
6. Optimise the remaining logo and 3D assets only after visual comparison, as they are active production assets.
