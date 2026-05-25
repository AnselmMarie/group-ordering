import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createExpiry } from "./utils";

describe("createExpiry", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns a Date roughly 30 minutes from now", () => {
    const now = new Date("2026-01-01T00:00:00Z");
    vi.setSystemTime(now);

    const expiry = createExpiry();

    expect(expiry).toBeInstanceOf(Date);
    expect(expiry.getTime() - now.getTime()).toBe(30 * 60 * 1000);
  });
});
