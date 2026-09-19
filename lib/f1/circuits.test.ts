import { expect, test } from "bun:test";

import { getCircuitMap } from "./circuits";

test("resolves Sepang by its API ID and full circuit name", () => {
  expect(getCircuitMap("sepang")?.id).toBe("sepang");
  expect(getCircuitMap("Sepang International Circuit")?.id).toBe("sepang");
});

test("tries later identifiers when an earlier circuit name is unknown", () => {
  expect(getCircuitMap("Unknown circuit", "Sepang International Circuit")?.id).toBe(
    "sepang",
  );
});

test("does not substitute an unrelated circuit for an unknown venue", () => {
  expect(getCircuitMap("madring", "Circuito de Madring")).toBeNull();
});
