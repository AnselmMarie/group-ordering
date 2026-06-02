import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const ENV_KEYS = [
  "PRODUCTS_RATE_LIMIT",
  "PRODUCTS_RATE_LIMIT_WINDOW_MS",
] as const;

const clearEnv = () => {
  for (const key of ENV_KEYS) {
    delete process.env[key];
  }
};

const loadModule = async () => {
  vi.resetModules();
  return import("./products-rate-limit");
};

describe("products-rate-limit", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(0);
    clearEnv();
  });

  afterEach(() => {
    vi.useRealTimers();
    clearEnv();
  });

  it("builds the per-IP key", async () => {
    const mod = await loadModule();

    expect(mod.productsIpKey("203.0.113.7")).toBe("products:ip:203.0.113.7");
  });

  it("collapses two hosts in the same /64 to one key", async () => {
    const mod = await loadModule();

    expect(mod.productsIpKey("2001:db8:1234:5678::2")).toBe(
      mod.productsIpKey("2001:db8:1234:5678::3"),
    );
  });

  it("applies the default per-IP limit of 10 calls", async () => {
    const { productsRateLimiter } = await loadModule();

    let last = productsRateLimiter.check("ip");
    for (let i = 1; i < 10; i += 1) {
      last = productsRateLimiter.check("ip");
    }
    expect(last.allowed).toBe(true);
    expect(productsRateLimiter.check("ip").allowed).toBe(false);
  });

  it("honors the PRODUCTS_RATE_LIMIT env override", async () => {
    process.env.PRODUCTS_RATE_LIMIT = "2";
    const { productsRateLimiter } = await loadModule();

    expect(productsRateLimiter.check("ip").allowed).toBe(true);
    expect(productsRateLimiter.check("ip").allowed).toBe(true);
    expect(productsRateLimiter.check("ip").allowed).toBe(false);
  });

  it("ignores invalid env values and falls back to defaults", async () => {
    process.env.PRODUCTS_RATE_LIMIT = "not-a-number";
    const { productsRateLimiter } = await loadModule();

    // Falls back to the default of 10, so 10 calls remain allowed.
    let last = productsRateLimiter.check("ip");
    for (let i = 1; i < 10; i += 1) {
      last = productsRateLimiter.check("ip");
    }
    expect(last.allowed).toBe(true);
    expect(productsRateLimiter.check("ip").allowed).toBe(false);
  });

  it("ignores non-positive env values", async () => {
    process.env.PRODUCTS_RATE_LIMIT = "0";
    const { productsRateLimiter } = await loadModule();

    // 0 is rejected, so the default of 10 applies.
    expect(productsRateLimiter.check("ip").allowed).toBe(true);
  });
});
