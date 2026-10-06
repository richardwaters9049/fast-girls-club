# WordPress public presentation

This optional plugin keeps WordPress as the content store and editor, while
routing public readers to the Next.js publication. It is **Off by default**.
Prepared locally; not installed or tested inside the live WordPress runtime.

## Install without changing public behaviour

Upload `fgc-headless.zip` in WordPress → Plugins → Add New Plugin → Upload Plugin.
Activate it and open Settings → Fast Girls Club. Leave the mode **Off**.
Activation alone on a fresh installation does not redirect or change indexing.
An existing saved mode survives deactivation/reactivation; check it first if reinstalling.

## Behaviour when enabled

- Only runs on a WordPress site whose configured home host is
  `cms.fastgirlsclub.co.uk`.
- Public GET/HEAD requests for published, non-password-protected posts redirect
  to `https://fastgirlsclub.co.uk/blog/{slug}`.
- CMS front page redirects to the public homepage; posts index to /blog;
  the About page (slug about) to /about.
- Logged-in requests, previews, Customizer, REST, admin, AJAX, cron, XML-RPC,
  feeds, embeds, robots, favicon and identified sitemap requests bypass redirects.
  Version 0.2.1 adds `X-Robots-Tag: noindex, follow` to CMS feeds when enabled.
- No permalink or REST response filters are applied; the frontend still reads
  published posts from WordPress normally. Direct media files are unaffected.
- Other CMS HTML pages get an X-Robots-Tag: noindex, follow header. Missing pages
  retain their existing status instead of redirecting to the homepage.
- Test mode uses 302; Live mode uses 301. Responses request no caching.
- Destination host is fixed. Request query strings, preview tokens and redirect
  parameters are not forwarded.
- WordPress post slugs are encoded once, including percent-encoded emoji.

## Launch sequence

Do not enable while the public root still serves a holding page or while the
Next.js site is available only on localhost.

1. Take fresh WordPress filesystem/database backups and record current domain settings.
2. Verify the public Next.js homepage, About, blog index and every published
   article over HTTPS, including emoji slugs, images and canonical URLs.
3. Verify CMS login, editing, REST and media work independently.
4. Select Test mode and save. Purge the Pressable/WordPress page cache.
5. Signed out: check CMS articles redirect to matching Next.js articles without
   loops; test CMS homepage, About, archives and unknown URLs.
6. Signed in: test Gutenberg save/publish/update, previews and media uploads.
   Confirm new articles reach Next.js and unpublishing is handled. The frontend
   currently uses 15-second revalidation, not an immediate push webhook.
7. Check actual CMS response headers after the cache purge. Do not blanket-block
   crawling with robots.txt: crawlers need access to see redirects/noindex.
8. Only after these checks, select Live mode.

This plugin does not disable public REST access, authenticate editorial previews,
change Yoast's stored metadata, rewrite Gutenberg links, remove feeds or submit
search-engine removals. Existing WordPress preview protection remains authoritative.
The Next.js article metadata supplies public canonicals. Sitemap indexing and
old changed/deleted-slug inventories require a separate production review.

## Rollback

Select Off or deactivate the plugin, then purge Pressable caches.
For emergency recovery add `define('FGC_HEADLESS_DISABLED', true);` before
WordPress loads in wp-config.php. This override disables routing even if the saved
mode is Live. Do not restore backups just to turn off redirects.
Browsers/search engines may remember earlier permanent redirects; use Test mode
until the destinations are proven. No DNS/domain settings are changed by the plugin.

## Local verification and packaging

From `/Users/richy/Documents/Github/fast_girls_club/fastgirlclub`:

```bash
php -l deploy/wordpress/fgc-headless/fgc-headless.php
php -l deploy/wordpress/fgc-headless/routes.php
php deploy/wordpress/test-routing.php
```

The CLI tests cover routing policy, disabled modes, unpublished/password-protected
posts, protected requests, non-read methods, host/loop protection, exact mappings,
emoji encoding and fixed destinations. They are not a live WordPress integration
test. Production/editorial checks above remain necessary.

Official hook references:
- https://developer.wordpress.org/reference/hooks/template_redirect/
- https://developer.wordpress.org/reference/functions/wp_safe_redirect/
- https://developer.wordpress.org/reference/hooks/allowed_redirect_hosts/

## Homepage placement (0.2.0)

Each post editor has a **Homepage placement** panel. Save/publish the post, choose Automatic, Hide, Left, Middle or Right, then click **Save homepage placement**. Fixed slots require a published, unprotected post. Automatic fills unassigned slots newest first. A story appears only once. Replacing a currently displayed story asks for confirmation naming it; cancellation changes nothing. The replaced article remains in the blog but is hidden from the homepage until its placement is changed back to Automatic or a fixed slot. Moving a selected article releases its old slot. Unpublished/deleted pins are ignored. On mobile the same left-to-right order stacks vertically.

The public `/wp-json/fgc/v1/homepage` endpoint returns exactly three published post IDs or nulls. Next.js reads those IDs, retrieves their WordPress summaries and retains slot order. An old plugin without the endpoint retains the previous newest-first behaviour. CMS/network failures are surfaced rather than silently ignoring editorial exclusions. Changes can take several minutes through the existing caches.

Before rollout run `php deploy/wordpress/test-homepage.php`, `php deploy/wordpress/test-homepage-actions.php`, `php deploy/wordpress/test-routing.php`, PHP lint, and frontend lint/typecheck/tests/build. Update the existing plugin with the ZIP (do not delete it), retain Test redirect mode, deploy the frontend, then verify replacement/cancel, moving slots, hidden articles and draft/publish behaviour in the real CMS. The local checks do not substitute for this live verification.

## 6 October 2026 SEO audit update

The 0.2.1 ZIP includes the RSS noindex fix. Install/update the ZIP before considering this feed fix live. Public CMS HTML was verified as 302 plus noindex in Test mode; switch to Live only after authenticated editor/preview acceptance. Run `php deploy/wordpress/test-feed-headers.php` for the header regression checks.
