import { expect, test } from "bun:test";

import { countryCodeToEmoji, countryNameToCode } from "./countries";

test("renders ISO alpha-2 and alpha-3 country codes", () => {
  expect(countryCodeToEmoji("GB")).toBe("🇬🇧");
  expect(countryCodeToEmoji("GBR")).toBe("🇬🇧");
});

test("maps provider country names to ISO alpha-2 codes", () => {
  expect(countryNameToCode("Great Britain")).toBe("GB");
  expect(countryNameToCode("United Kingdom")).toBe("GB");
});

