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
  feeds, embeds, robots, favicon and identified sitemap requests are bypassed.
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
   currently uses 60-second revalidation, not an immediate push webhook.
7. Check actual CMS response headers after the cache purge. Do not blanket-block
   crawling with robots.txt: crawlers need access to see redirects/noindex.
8. Only after these checks, select Live mode.

This plugin does not disable public REST access, authenticate editorial previews,
change Yoast's stored metadata, rewrite Gutenberg links, remove feeds or submit
search-engine removals. Existing WordPress preview protection remains authoritative.
The Next.js article metadata supplies public canonicals. Feed/sitemap indexing and
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
