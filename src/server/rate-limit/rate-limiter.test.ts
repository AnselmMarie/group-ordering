import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createRateLimiter } from "./rate-limiter";

describe("createRateLimiter", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(0);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("allows calls up to the configured limit", () => {
    const limiter = createRateLimiter({ limit: 3, windowMs: 1000 });

    expect(limiter.check("ip").allowed).toBe(true);
    expect(limiter.check("ip").allowed).toBe(true);
    expect(limiter.check("ip").allowed).toBe(true);
  });

  it("blocks calls once the limit is exceeded", () => {
    const limiter = createRateLimiter({ limit: 2, windowMs: 1000 });

    limiter.check("ip");
    limiter.check("ip");
    const result = limiter.check("ip");

    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it("reports remaining calls in the window", () => {
    const limiter = createRateLimiter({ limit: 3, windowMs: 1000 });

    expect(limiter.check("ip").remaining).toBe(2);
    expect(limiter.check("ip").remaining).toBe(1);
    expect(limiter.check("ip").remaining).toBe(0);
  });

  it("resets and allows calls again after the window passes", () => {
    const limiter = createRateLimiter({ limit: 1, windowMs: 1000 });

    expect(limiter.check("ip").allowed).toBe(true);
    expect(limiter.check("ip").allowed).toBe(false);

    vi.setSystemTime(1000);

    const result = limiter.check("ip");
    expect(result.allowed).toBe(true);
    expect(result.resetAt).toBe(2000);
  });

  it("tracks separate keys independently", () => {
    const limiter = createRateLimiter({ limit: 1, windowMs: 1000 });

    expect(limiter.check("a").allowed).toBe(true);
    expect(limiter.check("b").allowed).toBe(true);
    expect(limiter.check("a").allowed).toBe(false);
  });
});
