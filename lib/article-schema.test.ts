import { describe, expect, test } from "bun:test";
import { articleSchema, serializeJsonLd } from "./article-schema";
import type { BlogPost } from "./wordpress/types";

describe("editorial structured data", () => {
    test("CMS text cannot terminate the JSON-LD script", () => {
        const title = "</script><script>alert(1)</script>";
        const json = serializeJsonLd({ headline: title });
        expect(json).not.toContain("<");
        expect(JSON.parse(json).headline).toBe(title);
    });
    test("missing CMS author and image are omitted, with the frontend as canonical", () => {
        const post: BlogPost = { id: 1, slug: "story", title: "Story", excerpt: "Summary", content: "", date: "2026-10-06T12:00:00Z", modified: "2026-10-06T12:30:00Z", author: null, featuredImage: null, categories: [], seo: { title: null, description: null, canonical: "https://cms.example/story", image: null } };
        const article = articleSchema(post, "https://example.com")["@graph"][0];
        expect(article.mainEntityOfPage).toBe("https://example.com/blog/story");
        expect(article).not.toHaveProperty("author");
        expect(article).not.toHaveProperty("image");
        expect(article.datePublished).toBe(post.date);
    });
});
