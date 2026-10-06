import type { BlogPost } from "./wordpress/types";

export function articleSchema(post: BlogPost, siteUrl: string) {
    const url = `${siteUrl}/blog/${post.slug}`;
    return {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "NewsArticle",
                "@id": `${url}#article`,
                mainEntityOfPage: url,
                headline: post.title,
                description: post.seo.description ?? post.excerpt,
                datePublished: post.date,
                dateModified: post.modified,
                ...(post.featuredImage ? { image: [post.featuredImage.heroUrl] } : {}),
                ...(post.author ? { author: {
                    "@type": post.author === "Fast Girls Club" ? "Organization" : "Person",
                    name: post.author,
                    ...(post.author === "Fast Girls Club" ? { url: siteUrl } : {}),
                } } : {}),
                publisher: { "@type": "Organization", name: "Fast Girls Club", url: siteUrl },
            },
            {
                "@type": "BreadcrumbList",
                itemListElement: [
                    { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
                    { "@type": "ListItem", position: 2, name: "News", item: `${siteUrl}/blog` },
                    { "@type": "ListItem", position: 3, name: post.title, item: url },
                ],
            },
        ],
    };
}

export function serializeJsonLd(value: unknown): string {
    return JSON.stringify(value).replace(/</g, "\\u003c");
}
