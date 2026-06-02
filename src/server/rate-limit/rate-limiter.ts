import { createInMemoryStore, type RateLimitStore } from "./in-memory-store";
import type { RateLimitConfig, RateLimitResult } from "./types";

export interface RateLimiter {
  /** Records a call against `key` and reports whether it is allowed. */
  check(key: string): RateLimitResult;
}

/**
 * Creates a rate limiter backed by the given store (in-memory by default).
 *
 * `config.limit` controls how many calls are permitted per window and
 * `config.windowMs` controls how long the counter lives before it resets.
 */
export const createRateLimiter = (
  config: RateLimitConfig,
  store: RateLimitStore = createInMemoryStore(),
): RateLimiter => {
  const check = (key: string): RateLimitResult => {
    const { count, expiresAt } = store.increment(key, config.windowMs);

    return {
      allowed: count <= config.limit,
      remaining: Math.max(0, config.limit - count),
      resetAt: expiresAt,
    };
  };

  return { check };
};
