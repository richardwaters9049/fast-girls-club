import { expect, test } from "bun:test";

import { cleanSeoTitle, decodeHtmlText } from "./utils";

test("decodes WordPress entities used in excerpts", () => {
  expect(decodeHtmlText("Read more [&hellip;]")).toBe("Read more […]");
  expect(decodeHtmlText("Fast &#038; fearless")).toBe("Fast & fearless");
});

test("removes an empty trailing SEO separator", () => {
  expect(cleanSeoTitle("F3 News -")).toBe("F3 News");
});
