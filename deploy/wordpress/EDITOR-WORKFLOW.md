# Client publishing workflow

1. Sign in at https://cms.fastgirlsclub.co.uk/admin using the CMS account.
2. Open Posts → Add Post. Write the title and article in the normal visual block editor. Add a featured image, categories and a useful Yoast title/description.
3. For a video, insert a YouTube block and paste the full `https://www.youtube.com/watch?v=VIDEO_ID` URL. If a temporary embed warning appears, retry or reload the editor before converting it to a link. The existing Baku video (2fqu0VxJHfU) was confirmed rendering in the editor on 5 October 2026; YouTube's oEmbed endpoint also responded successfully. No persistent cause of the earlier warning has been established.
4. Save draft, then Preview. Authenticated previews stay on the CMS. Publish when ready; the public article is served at `https://fastgirlsclub.co.uk/blog/SLUG`.
5. With plugin 0.2.0 installed and the updated frontend deployed: use **Homepage placement**. Choose **Automatic** for newest-first selection, **Hide** to keep the story in the blog only, or **Left / Middle / Right** for a fixed position. Click **Save homepage placement** after publishing. Confirm the named replacement if wanted. Replaced stories remain in the blog and are hidden from the homepage. Set them back to Automatic to make them eligible again.

The website caches editorial data in Next.js with 15-second background revalidation and rotates the Pressable REST cache key every 15 seconds. Reload the page after publishing or trashing; an already-open homepage also refreshes every 30 seconds while visible and when you return to it. An open homepage normally picks up changes through those refresh cycles; allow roughly 45 seconds plus request time in healthy conditions, and longer during CMS/cache failures. This is not an immediate push webhook. Preview is currently a WordPress preview; it is not a Next.js design preview.

## Verification record — 5 October 2026

Test post 243, “FGC publishing test — please ignore”, was saved as draft, reopened with title/body intact, previewed while signed in, and published. The public WordPress REST response reported `publish`, and the Next.js article returned HTTP 200 with matching text. Cleanup and live homepage-control verification must be confirmed separately before marking rollout complete.

Redirect setting must remain **Test — temporary 302** pending completion of live verification.
