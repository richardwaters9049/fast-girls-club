import { afterAll, expect, spyOn, test } from "bun:test";
import { wakeF1Backend } from "./backend-wakeup";

const fetchSpy = spyOn(globalThis, "fetch");
const clock = spyOn(Date, "now").mockReturnValue(1_000_000);
const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
afterAll(() => {
    fetchSpy.mockRestore(); clock.mockRestore();
    if (originalWindow) Object.defineProperty(globalThis, "window", originalWindow);
    else Reflect.deleteProperty(globalThis, "window");
});

test("server loaders do not make a browser wake-up request", async () => {
    await wakeF1Backend();
    expect(fetchSpy).not.toHaveBeenCalled();
});

test("visitors share one credential-free wake-up and it expires after idle", async () => {
    Object.defineProperty(globalThis, "window", { value: {}, configurable: true });
    fetchSpy.mockResolvedValue(Response.json({ status: "ok" }));
    await Promise.all([wakeF1Backend(), wakeF1Backend(), wakeF1Backend()]);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(fetchSpy.mock.calls[0]?.[1]?.mode).toBe("no-cors");
    expect(fetchSpy.mock.calls[0]?.[1]?.credentials).toBe("omit");
    await wakeF1Backend();
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    clock.mockReturnValue(1_300_001);
    await wakeF1Backend();
    expect(fetchSpy).toHaveBeenCalledTimes(2);
});

test("failed visitor wake-up does not block proxy recovery or prevent a later wake-up", async () => {
    clock.mockReturnValue(1_600_002);
    fetchSpy.mockRejectedValueOnce(new TypeError("cross-origin request blocked"));
    await expect(wakeF1Backend()).resolves.toBeUndefined();
    fetchSpy.mockResolvedValueOnce(Response.json({ status: "ok" }));
    await wakeF1Backend();
    expect(fetchSpy).toHaveBeenCalledTimes(4);
});
