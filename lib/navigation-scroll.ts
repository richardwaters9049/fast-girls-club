// Navigation clicks have explicit destinations, independent of the router's
// cached scroll position. Keep the intent across page/header remounts.
let pendingHref: string | null = null;

export function requestNavigationScroll(href: string, pathname: string): void {
    pendingHref = href;
    applyNavigationScroll(pathname);
}

export function applyNavigationScroll(pathname: string): void {
    if (!pendingHref || pendingHref.split("#")[0] !== pathname) return;
    const href = pendingHref;
    pendingHref = null;
    window.requestAnimationFrame(() => {
        if (href === "/#latest") {
            document.getElementById("latest")?.scrollIntoView({ behavior: "instant", block: "start" });
        } else {
            window.scrollTo({ top: 0, left: 0, behavior: "instant" });
        }
    });
}
